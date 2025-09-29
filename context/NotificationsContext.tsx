"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the Notification type
export type Notification = {
  id: number;
  type: "like" | "comment" | "follow" | "mention" | "system";
  message: string;
  postId?: number;
  postTitle?: string;
  postImage?: string;
  fromUser?: {
    name: string;
    username: string;
    avatar: string;
  };
  read: boolean;
  createdAt: string;
  timeAgo: string;
};

// Define the context type
type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "timeAgo" | "read">
  ) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
};

// Create the context with a default value
const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

// Initial notifications data
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "system",
    message: "You just joined! Earn the FoodShare MVP early adopter badge.",
    read: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    timeAgo: "Just now",
  },
];

// Create the provider component
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate unread count
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Function to add a new notification
  const addNotification = (
    newNotificationData: Omit<
      Notification,
      "id" | "createdAt" | "timeAgo" | "read"
    >
  ) => {
    setIsLoading(true);

    // Create a new notification with generated fields
    const newNotification: Notification = {
      ...newNotificationData,
      id: Date.now(), // Use timestamp as a unique ID
      read: false,
      createdAt: new Date().toISOString(),
      timeAgo: "Just now",
    };

    // Add the new notification to the beginning of the array
    setNotifications([newNotification]);

    // Play notification sound if available
    if (typeof window !== "undefined") {
      const notificationSound = new Audio("");
      notificationSound
        .play()
        .catch((err) => console.log("Error playing notification sound:", err));
    }

    setIsLoading(false);
  };

  // Function to mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    const simulateIncomingNotification = () => {
      // Only simulate new notifications occasionally (20% chance)
      if (Math.random() > 0.8) {
        const randomUsers = [
          {
            name: "Mike Rodriguez",
            username: "@mikeats",
            avatar: "/cht.png?height=40&width=40",
          },
          {
            name: "Emma Wilson",
            username: "@emmaeats",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          { name: "Joy Wilson", username: "@joywilson", avatar: "" },
          {
            name: "Alex Johnson",
            username: "@alexj",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        ];

        const randomPosts = [
          {
            id: 1,
            title: "Homemade Avocado Toast",
            image: "/salad.jpg?height=100&width=100",
          },
          {
            id: 2,
            title: "Grilled Salmon Bowl",
            image: "/salad.jpg?height=100&width=100",
          },
          {
            id: 3,
            title: "Chocolate Lava Cake",
            image: "/placeholder.svg?height=100&width=100",
          },
        ];

        const notificationTypes: ("like" | "comment" | "follow" | "mention")[] =
          ["like", "comment", "follow", "mention"];
        const randomType =
          notificationTypes[
            Math.floor(Math.random() * notificationTypes.length)
          ];
        const randomUser =
          randomUsers[Math.floor(Math.random() * randomUsers.length)];
        const randomPost =
          randomPosts[Math.floor(Math.random() * randomPosts.length)];

        let newNotification: Omit<
          Notification,
          "id" | "createdAt" | "timeAgo" | "read"
        > = {
          type: randomType,
          message: "",
          fromUser: randomUser,
        };

        switch (randomType) {
          case "like":
            newNotification.message = "liked your post";
            newNotification.postId = randomPost.id;
            newNotification.postTitle = randomPost.title;
            newNotification.postImage = randomPost.image;
            break;
          case "comment":
            newNotification.message = "commented on your post";
            newNotification.postId = randomPost.id;
            newNotification.postTitle = randomPost.title;
            newNotification.postImage = randomPost.image;
            break;
          case "follow":
            newNotification.message = "started following you";
            break;
          case "mention":
            newNotification.message = "mentioned you in a comment";
            newNotification.postId = randomPost.id;
            newNotification.postTitle = randomPost.title;
            newNotification.postImage = randomPost.image;
            break;
        }

        addNotification(newNotification);
      }
    };

    // Simulate WebSocket connection with interval
    const interval = setInterval(simulateIncomingNotification, 30000); //

    return () => {
      clearInterval(interval); // Clean up on unmount
    };
  }, []);

  // Provide the context value
  const value = {
    notifications,
    unreadCount,
    addNotification,
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

// Custom hook to use the notifications context
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
