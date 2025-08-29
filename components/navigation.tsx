"use client";

import { Children, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  CameraIcon,
  UsersIcon,
  UserIcon,
  BellIcon,
  Bars3Icon,
  StarIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationsContext";
import { useAuth } from "@/context/AuthContext";

const mockUser = {
  followedTags: ["healthy", "vegan"],
};

export function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("recent");
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  const navItems = [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/create", icon: CameraIcon, label: "Share Food" },
    { href: "/community", icon: UsersIcon, label: "Community" },
    { href: "/profile", icon: UserIcon, label: "Profile" },
  ];

  const filters = [
    { label: "🔥 Trending", value: "trending" },
    { label: "🥗 Healthy", value: "healthy" },
    { label: "🕒 Recent", value: "recent" },
    // Optional: Only show if user has tags
    ...(mockUser?.followedTags?.length > 0
      ? [{ label: "❤️ My Tags", value: "mytags" }]
      : []),
  ];
  return (
    <div className="flex-1">
      {/* Desktop Sidebar */}
      <aside
        className="
        hidden
        lg:flex
        fixed
        top-0
        left-0
        h-full
        w-64
        flex-col
        justify-between
        bg-gray-950
        text-white
        px-6
        z-50
        border-r
        border-zinc-600
      "
      >
        <div>
          {/* Logo */}
          <div
            className="
            flex
            items-center
            gap-2
            px-3
            pt-6
          "
          >
            <div
              className="
              w-9
              h-9
              rounded-full
              bg-orange-500
              flex
              items-center
              justify-center
              text-lg
              font-bold
              text-white
            "
            >
              F
            </div>
            <span
              className="
              text-xl
              font-bold
              text-white
            "
            >
              FoodShare
            </span>
          </div>

          {pathname === "/" && (
            <div
              className="
              flex
              flex-wrap
              gap-3
              px-8
              justify-center
              items-center
              py-4
              bg-gray-950
            "
            >
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    activeFilter === filter.value
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          {/* Navigation Links */}
          <nav
            className="
            flex
            flex-col
            space-y-4
            mt-8
          "
          >
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
                <span
                  className="
                  text-md
                  font-bold
                "
                >
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Messages */}

            {/* Notifications */}
            <Link
              href="/notifications"
              className={cn(
                "flex items-center gap-4 px-3 py-2 rounded-lg transition-all relative",
                pathname === "/notifications"
                  ? "bg-zinc-800 text-orange-500"
                  : "hover:bg-zinc-800 hover:text-orange-500"
              )}
            >
              <BellIcon className="w-6 h-6" />
              <span className="text-md font-bold">Notifications</span>
              {unreadCount > 0 && (
                <Badge
                  className="
                  absolute  
                  left-5
                  top-0
                  -translate-y-1/2
                  text-[10px]
                  bg-red-500
                  px-1
                "
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div
          className="
          flex
          flex-col
          space-y-4
          mb-4
        "
        >
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-12 h-12  rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>
              </div>

              <div
                className="
                flex
                items-center
                gap-4
                px-3
                py-2
                rounded-lg
                hover:bg-zinc-800 hover:text-orange-500
                cursor-pointer
              "
              ></div>

              <div
                className="
                flex
                items-center
                gap-4
                px-3
                py-2
                rounded-lg
                hover:bg-zinc-800
                hover:text-orange-500
                cursor-pointer
              "
              >
                <Bars3Icon className="w-6 h-6" />
                <span
                  className="
                  text-md
                  font-bold
                "
                >
                  More
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="
                flex
                items-center
                gap-4
                px-3
                py-2
                rounded-lg
                hover:bg-red-900/30
                text-gray-300
                hover:text-red-400
                cursor-pointer
                mt-4
                border border-transparent hover:border-red-800/50
              "
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
                <span
                  className="
                  text-md
                  font-bold
                "
                >
                  Logout
                </span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="
              flex
              items-center
              gap-4
              px-3
              py-2
              rounded-lg
              bg-orange-600
              hover:bg-orange-700
              text-white
              cursor-pointer
              justify-center
            "
            >
              <span className="text-md font-bold">Sign In</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className="
        flex-1
        w-full
        lg:ml-64
        flex
        flex-col
      "
      >
        {/* Filter Tabs for mobile*/}
        {pathname === "/" && (
          <div
            className="
            w-full
            flex
            justify-center
            items-center
            flex-wrap
            gap-2
            bg-gray-950
            pt-2
            pb-2
            lg:hidden
          "
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-3 py-1 text-sm sm:text-base font-bold py-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  activeFilter === filter.value
                    ? "bg-orange-500 text-white"
                    : "hover:bg-zinc-800 hover:text-orange-500"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Bottom Nav */}
        <div
          className="
          lg:hidden
          fixed
          bottom-0
          left-0
          right-0
          bg-gray-900/95
          backdrop-blur-sm
          border-t
          border-gray-800
          z-50
        "
        >
          <div
            className="
            flex
            items-center
            justify-around
            py-2
          "
          >
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-3 text-gray-400 hover:bg-zinc-800 hover:text-orange-500",
                    pathname === item.href && "text-orange-400"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}

            <Link href="/notifications">
              <Button
                variant="ghost"
                size="sm"
                className="
                  relative
                  flex
                  flex-col
                  items-center
                  gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-zinc-800 hover:text-orange-500
                 
                "
              >
                <BellIcon className="h-5 w-5" />
                <span className="text-xs">Alerts</span>
                {unreadCount > 0 && (
                  <Badge
                    className="
                    absolute
                    -top-1
                    -right-1
                    h-4
                    w-4
                    p-0
                    text-[10px]
                    bg-red-500
                  "
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Account sheet for mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-zinc-800 hover:text-orange-500"
                >
                  <UserIcon className="h-6 w-6" />
                  <span className="text-xs">Account</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-gray-950 text-white border-l border-gray-800"
              >
                <div className="mt-6 space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20  rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:text-red-400"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login" className="block">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Sign in
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
