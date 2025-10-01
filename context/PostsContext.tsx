"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// Define the Post type
export type Post = {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  image: string;
  title: string;
  description: string;
  calories: number;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
};

// Define the context type
type PostsContextType = {
  posts: Post[];
  addPost: (
    post: Omit<Post, "likes" | "comments" | "timeAgo"> & { id?: string }
  ) => void;
  isLoading: boolean;
  updatePostLikes: (
    postId: string,
    newLikesCount: number,
    isLiked: boolean
  ) => void;
};

// Create the context with a default value
const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Create the provider component
export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate an initial avatar (SVG data URL) from user's name
  const getInitialAvatar = (name: string) => {
    if (!name || name === "Anonymous") {
      return "/default.png";
    }

    const firstLetter = name.trim().charAt(0).toUpperCase();
    const colors = [
      "#F87171",
      "#FB923C",
      "#FBBF24",
      "#A3E635",
      "#34D399",
      "#22D3EE",
      "#60A5FA",
      "#A78BFA",
      "#F472B6",
    ];
    const colorIndex = firstLetter.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="${bgColor}" />
        <text x="50" y="50" font-family="Arial" font-size="50" fill="white" text-anchor="middle" dominant-baseline="central">
          ${firstLetter}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Load posts from Supabase with user data
  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            id,
            title,
            caption,
            image_url,
            calories,
            tags,
            created_at,
            user_id,
            users (id, email, name)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to fetch posts from Supabase:", error);
          throw error;
        }

        const mapped: Post[] = (data || []).map((dbPost: any) => {
          const userName = dbPost.users?.name || dbPost.users?.email?.split("@")[0] || "Anonymous";
          return {
            id: dbPost.id,
            user: {
              name: userName,
              username: dbPost.users?.email?.split("@")[0] || "user",
              avatar: getInitialAvatar(userName),
            },
            image: dbPost.image_url || "/placeholder-food.jpg",
            title: dbPost.title,
            description: dbPost.caption,
            calories: dbPost.calories ?? 0,
            tags: dbPost.tags ? String(dbPost.tags).split(",").filter(Boolean) : [],
            likes: 0, // Placeholder: implement likes fetching if needed
            comments: 0, // Placeholder: implement comments fetching if needed
            timeAgo: calculateTimeAgo(dbPost.created_at),
          };
        });

        if (isMounted) {
          setPosts(mapped);
        }
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate time ago for posts
  const calculateTimeAgo = (createdAt: string) => {
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Function to add a new post
  const addPost = (
    newPostData: Omit<Post, "likes" | "comments" | "timeAgo"> & {
      id?: string;
    }
  ) => {
    // Since CreatePostPage already inserts into Supabase, just update the local state
    const newPost: Post = {
      ...newPostData,
      id: newPostData.id ?? crypto.randomUUID(),
      likes: 0,
      comments: 0,
      timeAgo: "Just now",
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // Function to update post likes
  const updatePostLikes = (
    postId: string,
    newLikesCount: number,
    isLiked: boolean
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: newLikesCount } : post
      )
    );
    console.log(
      `Updated post ${postId} likes to ${newLikesCount}, isLiked: ${isLiked}`
    );
  };

  // Provide the context value
  const value = {
    posts,
    addPost,
    isLoading,
    updatePostLikes,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

// Custom hook to use the posts context
export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}