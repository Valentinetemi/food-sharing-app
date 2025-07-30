"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, Users, User, Search, Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/create", icon: Camera, label: "Share Food" },
    { href: "/community", icon: Users, label: "Community" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 pt-6 flex-col justify-between bg-gray-950 text-white px-6 z-50 border-r border-zinc-600">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 px-3">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-lg font-bold text-white">
              F
            </div>
            <span className="text-xl font-bold text-white">FoodShare</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4 mt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-3 py-2 rounded-lg transition-all",
                  pathname === item.href
                    ? "bg-zinc-800 text-orange-500"
                    : "hover:bg-zinc-800 hover:text-orange-500"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-md font-bold">{item.label}</span>
              </Link>
            ))}

            {/* Search */}
            <Link
              href="/search"
              className={cn(
                "flex items-center gap-4 px-3 py-2 rounded-lg transition-all",
                pathname === "/search"
                  ? "bg-zinc-800 text-orange-500"
                  : "hover:bg-zinc-800 hover:text-orange-500"
              )}
            >
              <Search className="w-6 h-6" />
              <span className="text-md font-bold">Search</span>
            </Link>

            {/* Notifications */}
            <div className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-orange-500 relative cursor-pointer">
              <Bell className="w-6 h-6" />
              <span className="text-md font-bold">Notifications</span>
              <Badge className="absolute left-5 top-0 -translate-y-1/2 text-[10px] bg-red-500 px-1">3</Badge>
            </div>

            {/* Messages */}
            <div className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-zinc-800 relative cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.3c0 4.6-4.3 8.4-9 8.4-1.6 0-3.1-.4-4.5-1.1L3 21l1.4-4.2C3.4 15.2 3 13.8 3 12.3 3 7.7 7.4 4 12 4s9 3.7 9 8.3z" />
              </svg>
              <span className="text-md font-bold">Messages</span>
            </div>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col space-y-4 mb-4">
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-4 px-3 py-2 rounded-lg transition-all",
              pathname === "/profile"
                ? "bg-zinc-800 text-orange-500"
                : "hover:bg-zinc-800 hover:text-orange-500"
            )}
          >
            <User className="w-6 h-6" />
            <span className="text-md font-bold">Profile</span>
          </Link>
          <div className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-orange-500 cursor-pointer">
            <Menu className="w-6 h-6" />
            <span className="text-md font-bold">More</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full lg:ml-64 flex flex-col">
        {/* Mobile Top Nav */}
        <nav className="lg:hidden sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
          <div className="px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold text-gray-100">FoodShare</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-400 hover:text-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
            {isMobileMenuOpen && (
              <div className="border-t border-gray-800 py-4">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 text-gray-400 hover:text-gray-100 hover:bg-gray-800",
                          pathname === item.href && "text-orange-400 bg-gray-800"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <div className="border-t border-gray-800 pt-2 mt-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-gray-100">
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-gray-100">
                      <Bell className="h-4 w-4" />
                      Notifications
                      <Badge className="ml-auto h-5 w-5 p-0 text-xs bg-red-500">3</Badge>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Page Content */}
        <main className="flex-1 p-4">
          {/* Your actual page content goes here */}
        </main>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-3 text-gray-400 hover:text-gray-100",
                    pathname === item.href && "text-orange-400"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
            <Button variant="ghost" size="sm" className="relative flex flex-col items-center gap-1 text-gray-400 hover:text-gray-100">
              <Bell className="h-5 w-5" />
              <span className="text-xs">Alerts</span>
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-red-500">3</Badge>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
