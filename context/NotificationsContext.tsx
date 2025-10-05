"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export type Notification = {
  id: number;
  type: "system";
  message: string;
  read: boolean;
  createdAt: string;
  timeAgo: string;
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "timeAgo" | "read">
  ) => void;
  addMVPBadgeNotification: () => void;
  addWelcomeNotification: (userName: string) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
};

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

const initialNotifications: Notification[] = [];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const addNotification = (
    newNotificationData: Omit<
      Notification,
      "id" | "createdAt" | "timeAgo" | "read"
    >
  ) => {
    setIsLoading(true);

    const newNotification: Notification = {
      ...newNotificationData,
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      timeAgo: "Just now",
    };

    setNotifications((prev) => [newNotification, ...prev]);

    if (typeof window !== "undefined") {
      const notificationSound = new Audio("/notification-sound.mp3");
      notificationSound
        .play()
        .catch((err) => console.log("Error playing notification sound:", err));
    }

    setIsLoading(false);
  };

  const markAsRead = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Welcome notification for new users
  const addWelcomeNotification = (userName: string) => {
    const welcomeNotification: Notification = {
      id: Date.now(),
      type: "system",
      message: `Welcome to FoodShare, ${userName}! We're thrilled to have you in our community. Start by sharing your first delicious meal, exploring different communities, and connecting with fellow food enthusiasts. Happy cooking!`,
      read: false,
      createdAt: new Date().toISOString(),
      timeAgo: "Just now",
    };

    setNotifications((prev) => [welcomeNotification, ...prev]);

    if (typeof window !== "undefined") {
      const notificationSound = new Audio("/notification-sound.mp3");
      notificationSound
        .play()
        .catch((err) => console.log("Error playing notification sound:", err));
    }
  };

  // MVP badge notification
  const addMVPBadgeNotification = () => {
    const mvpNotification: Notification = {
      id: Date.now() + 1, // Slightly different ID to avoid collision
      type: "system",
      message:
        "You've earned the MVP Early Adopter badge! Thank you for being one of the first members of our community. Your support means the world to us!",
      read: false,
      createdAt: new Date().toISOString(),
      timeAgo: "Just now",
    };

    setNotifications((prev) => [mvpNotification, ...prev]);

    if (typeof window !== "undefined") {
      const notificationSound = new Audio("/notification-sound.mp3");
      notificationSound
        .play()
        .catch((err) => console.log("Error playing notification sound:", err));
    }
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    addMVPBadgeNotification,
    addWelcomeNotification,
    markAsRead,
    markAllAsRead,
    isLoading,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}