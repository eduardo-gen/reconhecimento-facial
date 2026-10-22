import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Facegle — Laboratório facial', description: 'Rastreamento facial com MediaPipe e histórico de análises em JSON.' };
export default function Layout({children}: {children: React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
