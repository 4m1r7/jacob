import localFont from 'next/font/local'
import type { Metadata } from "next";
import "./globals.css";

const vazirmatn = localFont({
  src: '../fonts/vazirmatn-variable.woff2',
  variable: '--font-vazirmatn',
  display: "swap",
})

export const metadata: Metadata = {
  title: "Khajeata",
  description: "Khajeata Cultutal Festival",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir='rtl'>
      <body
        className={`${vazirmatn.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
