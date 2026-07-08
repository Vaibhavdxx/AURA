import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA - Premium Web Music Player",
  description: "A premium music playing dashboard featuring real-time synchronized lyrics, responsive audio visualizers, and interactive 3D vinyl record playbacks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-hidden bg-black text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
