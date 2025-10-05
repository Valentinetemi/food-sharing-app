"use client";

import React, { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BellIcon, CheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

const slideIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, isLoading } =
    useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState(10);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [animateNew, setAnimateNew] = useState<number[]>([]);

  // This Track new notifications for animation
  useEffect(() => {
    const newIds = notifications
      .filter((notification) => notification.timeAgo === "Just now")
      .map((notification) => notification.id);

    if (newIds.length > 0) {
      setAnimateNew(newIds);

      // Remove from animation list after animation completes
      const timer = setTimeout(() => {
        setAnimateNew([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((notification) => !notification.read);

  const loadMore = () => {
    setVisibleNotifications((prev) => prev + 10);
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = () => {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex-1 ml-0 lg:ml-64">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-20 lg:pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                Notifications
              </h1>
              <p className="text-gray-400">
                Stay updated with your food community
              </p>
            </div>
            <Button
              variant="outline"
              className="text-gray-300 border-gray-700"
              onClick={handleMarkAllAsRead}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              className={
                filter === "all"
                  ? "bg-blue-600"
                  : "text-gray-300 border-gray-700"
              }
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              className={
                filter === "unread"
                  ? "bg-blue-600"
                  : "text-gray-300 border-gray-700"
              }
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))
            ) : filteredNotifications.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800 p-8 text-center">
                <BellIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500">
                  When you get notifications, they'll show up here
                </p>
              </Card>
            ) : (
              <AnimatePresence>
                {filteredNotifications
                  .slice(0, visibleNotifications)
                  .map((notification) => (
                    <motion.div
                      key={notification.id} 
                      {...(animateNew.includes(notification.id)
                        ? slideIn
                        : fadeIn)}
                      className={`relative ${
                        !notification.read ? "bg-gray-800/50" : "bg-gray-900"
                      } border ${
                        !notification.read
                          ? "border-blue-900/50"
                          : "border-gray-800"
                      } rounded-lg p-4 transition-colors duration-200`}
                    >
                      {!notification.read && (
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 flex items-center justify-center">
                          {getNotificationIcon()}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                            <div>
                              <span className="text-gray-300">
                                {notification.message}
                              </span>
                            </div>
                            <span className="text-gray-500 text-sm mt-1 sm:mt-0">
                              {notification.timeAgo}
                            </span>
                          </div>

                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-blue-400 hover:text-blue-300 p-0 h-auto"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            )}

            {filteredNotifications.length > visibleNotifications && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  onClick={loadMore}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
