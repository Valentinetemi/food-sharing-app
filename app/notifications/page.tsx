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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="bg-red-500 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "comment":
        return (
          <div className="bg-blue-500 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "follow":
        return (
          <div className="bg-green-500 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case "mention":
        return (
          <div className="bg-purple-500 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-500 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Notifications</h1>
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
              filter === "all" ? "bg-blue-600" : "text-gray-300 border-gray-700"
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
                      {notification.fromUser ? (
                        <div className="relative">
                          <img
                            src={
                              notification.fromUser.avatar ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={notification.fromUser.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="absolute -bottom-1 -right-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                          <div>
                            {notification.fromUser && (
                              <span className="font-semibold text-white">
                                {notification.fromUser.name}{" "}
                              </span>
                            )}
                            <span className="text-gray-300">
                              {notification.message}
                            </span>
                            {notification.postTitle && (
                              <span className="font-medium text-white">
                                {" "}
                                "{notification.postTitle}"
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500 text-sm mt-1 sm:mt-0">
                            {notification.timeAgo}
                          </span>
                        </div>

                        {notification.postImage && notification.postId && (
                          <Link href={`/post/${notification.postId}`}>
                            <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                              <img
                                src={notification.postImage}
                                alt={notification.postTitle || "Post"}
                                className="h-12 w-12 object-cover rounded"
                              />
                              <span className="text-sm text-gray-300 truncate">
                                {notification.postTitle}
                              </span>
                            </div>
                          </Link>
                        )}

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
  );
}
