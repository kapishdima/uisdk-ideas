import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const description = "Working demos of interfaces agents can operate, built on ui-sdk."

// The share image is app/opengraph-image.png (and twitter-image.png): the README hero.
export const metadata: Metadata = {
  metadataBase: new URL("https://uisdk.kapish.dev"),
  title: "ui-sdk ideas",
  description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ui-sdk ideas",
    title: "ui-sdk ideas",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "ui-sdk ideas",
    description,
    creator: "@kapish_dima",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  )
}
