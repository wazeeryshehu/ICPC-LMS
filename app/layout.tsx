import type { Metadata, Viewport } from "next";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ICPC Digital Learning and Capacity Development Portal",
    template: "%s · ICPC Learning Portal",
  },
  description:
    "The official digital learning, capacity development and professional certification portal of the Independent Corrupt Practices and Other Related Offences Commission (ICPC), Nigeria.",
  applicationName: "ICPC Learning Portal",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "ICPC Learning",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b2550" },
    { media: "(prefers-color-scheme: dark)", color: "#06101f" },
  ],
};

const themeScript = `
try {
  var stored = localStorage.getItem('icpc-theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
