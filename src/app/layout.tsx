import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kasi2Kasi - Digital Stokvel Management",
  description: "Secure, transparent digital Stokvel management for the Kasi community. Track contributions, manage payouts, and build trust.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/logo.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://kasi2kasi.co.za",
    siteName: "Kasi2Kasi",
    title: "Kasi2Kasi - Digital Stokvel Management",
    description: "Secure, transparent digital Stokvel management. Join the movement towards financial freedom.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kasi2Kasi - Community Savings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasi2Kasi - Digital Stokvel Management",
    description: "Secure, transparent digital Stokvel management. Join the movement towards financial freedom.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#2D6A4F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
