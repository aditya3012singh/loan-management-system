import './globals.css';

import StoreProvider from '@/store/StoreProvider';

export const metadata = {
  title: 'LMS - Loan Management System',
  description: 'Full stack loan management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
