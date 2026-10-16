// Saves the DOKU sandbox keys into server/.dev.vars (a private file that is never
// uploaded to GitHub). The Secret Key is typed hidden, so it never appears on screen.
// Run: npm run set-keys
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', '.dev.vars');

function ask(question, hidden) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    let value = '';
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off('data', onData);
          process.stdout.write('\n');
          return resolve(value.trim());
        }
        if (ch === '\u0003') process.exit(1); // Ctrl+C
        if (ch === '\u0008' || ch === '\u007f') {
          if (value) {
            value = value.slice(0, -1);
            if (!hidden) process.stdout.write('\b \b');
          }
          continue;
        }
        value += ch;
        process.stdout.write(hidden ? '*' : ch);
      }
    };
    stdin.on('data', onData);
  });
}

console.log('\nKunci DOKU SANDBOX (test). Lihat di sandbox.doku.com > Settings > API Keys.\n');
const clientId = await ask('Client ID  : ', false);
const secretKey = await ask('Secret Key : ', true);

if (!clientId || !secretKey) {
  console.log('\nKosong. Tidak ada yang disimpan.');
  process.exit(1);
}
writeFileSync(
  file,
  `# DOKU sandbox keys. Private: never commit or share this file.\nDOKU_CLIENT_ID=${clientId}\nDOKU_SECRET_KEY=${secretKey}\n`,
);
console.log(`\nTersimpan. Secret Key: ${secretKey.length} karakter (tidak ditampilkan).`);
