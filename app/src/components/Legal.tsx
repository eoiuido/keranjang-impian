import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, type } from '@/theme';
import { Header, Page } from './ui';

// Shared layout for the policy pages (privacy, terms, refund).
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <Page>
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Text style={legal.title}>{title}</Text>
      <Text style={legal.updated}>Berlaku sejak {updated}</Text>
      {children}
    </Page>
  );
}

export const H = ({ children }: { children: ReactNode }) => <Text style={legal.h}>{children}</Text>;
export const P = ({ children }: { children: ReactNode }) => <Text style={legal.p}>{children}</Text>;

export const legal = StyleSheet.create({
  title: { ...type.title, color: colors.text },
  updated: { ...type.small, marginTop: 4, marginBottom: 8, color: colors.textFaint },
  h: { ...type.h2, fontSize: 16, marginTop: 22, marginBottom: 6, color: colors.text },
  p: { ...type.body, color: colors.textSoft, marginBottom: 6 },
});
