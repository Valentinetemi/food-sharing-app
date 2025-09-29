"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { getAuth } from "firebase/auth";

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

  // Load posts from Supabase so IDs exist for FK constraints in likes
  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch posts from Supabase:", error);
        setIsLoading(false);
        return;
      }

      const mapped: Post[] = (data || []).map((dbPost: any) => ({
        id: dbPost.id,
        user: {
          name: dbPost.author_name || "Anonymous",
          username: dbPost.author_username || "user",
          avatar: dbPost.author_avatar || "/cht.png",
        },
        image: dbPost.image_url,
        title: dbPost.title,
        description: dbPost.caption,
        calories: dbPost.calories ?? 0,
        tags: dbPost.tags ? String(dbPost.tags).split(",").filter(Boolean) : [],
        likes: 0,
        comments: 0,
        timeAgo: "",
      }));

      if (isMounted) {
        setPosts(mapped);
        setIsLoading(false);
      }
    };

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to add a new post
  const addPost = (
    newPostData: Omit<Post, "likes" | "comments" | "timeAgo"> & {
      id?: string;
    }
  ) => {
    setIsLoading(true);

    // Create a new post with generated fields
    const newPost: Post = {
      ...newPostData,
      id: newPostData.id ?? crypto.randomUUID(), // Use provided UUID or generate
      likes: 0,
      comments: 0,
      timeAgo: "Just now",
    };

    // Add the new post to the beginning of the array
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setIsLoading(false);
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
