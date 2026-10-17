import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://sikarya-dalemmetra.vercel.app"
  ),
  title: {
    default: "SIKARYA - Sistem Informasi & Transparansi Kas Pura Dalem Metra",
    template: "%s | SIKARYA Pura Dalem Metra",
  },
  description:
    "Portal Resmi Transparansi Keuangan, Buku Kas Seksi, dan Rekapitulasi Real-Time Dana Punia Karya Pura Dalem Desa Adat Metra.",
  icons: {
    icon: [
      { url: "/logo_hitam.png", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/logo_hitam.png",
    apple: "/logo_hitam.png",
  },
  openGraph: {
    title: "SIKARYA - Sistem Informasi & Transparansi Kas Pura Dalem Metra",
    description:
      "Portal Transparansi Kas, Realisasi Anggaran, dan Rekapitulasi Dana Punia Karya Pura Dalem Metra. Terbuka, Akuntabel, dan Real-time.",
    url: "/",
    siteName: "SIKARYA Pura Dalem Metra",
    images: [
      {
        url: "/logo_hitam.png",
        width: 800,
        height: 800,
        alt: "Logo SIKARYA Pura Dalem Metra",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIKARYA - Sistem Informasi & Transparansi Kas Pura Dalem Metra",
    description:
      "Portal Transparansi Kas & Rekapitulasi Real-Time Dana Punia Karya Pura Dalem Desa Adat Metra.",
    images: ["/logo_hitam.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo_hitam.png" type="image/png" />
        <link rel="shortcut icon" href="/logo_hitam.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo_hitam.png" />
        <meta property="og:image" content="/logo_hitam.png" />
        <meta name="twitter:image" content="/logo_hitam.png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
