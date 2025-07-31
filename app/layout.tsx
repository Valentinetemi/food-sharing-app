
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import  ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FoodShare - Share Your Culinary Journey",
  description:
    "A social platform for food enthusiasts to share, discover, and track their culinary adventures with calorie tracking and community features.",
    icons: {
      icon: "/favicon.ico",
    },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientWrapper>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      
            <Navigation />
            <main className="flex-1 overflow-auto ">
              {children}
              </main>
              
        </ThemeProvider>
        </ClientWrapper>
      </body>
    </html>
  )
}
