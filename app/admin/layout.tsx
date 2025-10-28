// app/admin/layout.tsx
// TechEquity Admin Layout

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel | TechEquity Consulting',
  description: 'TechEquity Consulting Admin Panel - Manage appointments and availability'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}