import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import ClientWrapper from "@/components/ClientWrapper";
import { Toaster } from "@/components/ui/toaster";
import { PostsProvider } from "@/context/PostsContext";
import {NotificationsProvider} from "@/context/NotificationsContext";
import { AuthProvider } from "@/context/AuthContext";
import NavWrapper from "@/components/NavWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodShare - Share Your Culinary Journey",
  description:
    "A social platform for food enthusiasts to share, discover, and track their culinary adventures with calorie tracking and community features.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthProvider>
              <PostsProvider>
                <NotificationsProvider>
                  <NavWrapper />
                  <main className="flex-1 overflow-auto relative">
                    <div className="min-h-full">
                      {children}
                      <Toaster />
                    </div>
                    <div className="h-16 lg:hidden" aria-hidden="true" />
                  </main>
                </NotificationsProvider>
              </PostsProvider>
            </AuthProvider>
          </ThemeProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
