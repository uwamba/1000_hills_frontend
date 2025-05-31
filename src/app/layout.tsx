import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // Import global styles


// Load fonts with variables
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",  // Make the font load more efficiently
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",  // Make the font load more efficiently
});

// Metadata export
export const metadata: Metadata = {
  title: "Visit 1000 Hills",
  description: "Find top hotels and bus routes in Rwanda and beyond.",
};

// RootLayout - Server Component by Default
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <head>
      <link rel="icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#ffffff" />
     <script src="https://cdn.tailwindcss.com"></script>
     </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
