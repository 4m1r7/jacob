import localFont from 'next/font/local'
import type { Metadata } from "next";
import "./globals.css";

const mirza = localFont({
  src: [
    {
      path: "../fonts/mirza-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/mirza-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/mirza-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/mirza-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mirza",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jacob Carpet",
  description: "Jacob Carpet Store",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body className={`${mirza.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
