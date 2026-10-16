// Run with: npm test
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { test } from 'node:test';
import { digest, safeEqual, signature } from '../src/doku.ts';

const parts = {
  clientId: 'MCH-0001-10791114622547',
  requestId: 'cc682442-6c22-493e-8121-b9ef6b3fa728',
  timestamp: '2020-08-11T08:45:42Z',
  target: '/checkout/v1/payment',
};

test('digest = base64(SHA-256(body))', async () => {
  const body = '{"order":{"amount":79000,"invoice_number":"KI-1"}}';
  assert.equal(await digest(body), createHash('sha256').update(body).digest('base64'));
});

test('signature matches DOKU format, checked with Node crypto', async () => {
  const d = await digest('{"a":1}');
  const text = `Client-Id:${parts.clientId}\nRequest-Id:${parts.requestId}\nRequest-Timestamp:${parts.timestamp}\nRequest-Target:${parts.target}\nDigest:${d}`;
  const expected = 'HMACSHA256=' + createHmac('sha256', 'SK-test').update(text).digest('base64');
  assert.equal(await signature('SK-test', { ...parts, digest: d }), expected);
});

test('GET signature has no Digest line', async () => {
  const text = `Client-Id:${parts.clientId}\nRequest-Id:${parts.requestId}\nRequest-Timestamp:${parts.timestamp}\nRequest-Target:/orders/v1/status/KI-1`;
  const expected = 'HMACSHA256=' + createHmac('sha256', 'SK-test').update(text).digest('base64');
  assert.equal(await signature('SK-test', { ...parts, target: '/orders/v1/status/KI-1' }), expected);
});

test('safeEqual', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
});
