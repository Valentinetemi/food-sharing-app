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
  image_url: string;
  title: string;
  caption: string;
  calories: number;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  mealtype: string;
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
          .select(
            `
            id,
            title,
            caption,
            image_url,
            calories,
            tags,
            created_at,
            user_id,
            profiles!posts_user_id_fkey(id, name, username, avatar, created_at)
          `
          )
          .order("created_at", { ascending: false });

          console.log("Response", { data, error })

        if (error) {
          console.error("Failed to fetch posts from Supabase:", error);
          throw error;
        }

        const formatted = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          caption: p.caption,
          image_url: p.image_url,
          tags: p.tags ? p.tags.split(",") : [],
          calories: p.calories,
          mealtype: p.mealtype,
          created_at: p.created_at,
          user: p.profiles ? {
            id: p.profiles.id,
            name: p.profiles.name || "Anonymous",
            username: p.profiles.username || `user_${p.profiles.id.slice(0, 8)}`,
            avatar: p.profiles.avatar || "/default-avatar.png",
            created_at: p.profiles.created_at,
          } : null,
        }));
    
        setPosts(formatted);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
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
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
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
