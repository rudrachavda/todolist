import { Toaster } from "@/components/ui/sonner";
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { NextAuthSessionProvider } from '@/components/providers/session-provider'
import { cn } from "@/lib/utils";

import './globals.css'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const haloGrotesk = localFont({
  src: '../public/fonts/HaloGrotesk-Regular.otf',
  variable: '--font-halo',
})

const spaceGrotesk = localFont({
  src: '../public/fonts/SpaceGrotesk-Regular.ttf',
  variable: '--font-space',
})

export const metadata: Metadata = {
  title: 'Reminders',
  description: 'Your thoughts, organized. Beautifully simple.',
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.svg",
        href: "/logo.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.svg",
        href: "/logo-dark.svg",
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, haloGrotesk.variable, spaceGrotesk.variable, "font-sans")}>
        <NextAuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="reminders-theme"
          >
            <Toaster position="bottom-center" />
            {children}
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
