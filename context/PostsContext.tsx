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

// Initial posts data
const initialPosts: Post[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    user: {
      name: "Joy Joseph",
      username: "@joyjoseph",
      avatar: "/cht.png?height=60&width=60",
    },
    image: "/food2.jpg?height=400&width=400",
    title: "Homemade Chicken With Onions Cream Salad",
    description:
      "Perfect dinner with roasted chiken and onions cream and salad!",
    calories: 420,
    tags: ["dinner", "healthy", "vegetarian"],
    likes: 38,
    comments: 29,
    timeAgo: "2h ago",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    user: {
      name: "Mike Rodriguez",
      username: "@mikeats",
      avatar: "/cht.png?height=40&width=40",
    },
    image: "/food6.jpg?height=100&width=200",
    title: "Grape Cupcake",
    description:
      "Delicious grape cupcake for your birthday party or any special occasion. Enjoy it with friends and family!!",
    calories: 485,
    tags: ["cupcake", "Sweet", "Birthday Party"],
    likes: 42,
    comments: 12,
    timeAgo: "4h ago",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    user: {
      name: "Joy Wilson",
      username: "@joywilson",
      avatar: "/grace.jpg?height=40&width=40",
    },
    image: "/food1.jpg?height=400&width=400",
    title: "Cabbage Salad",
    description: "Cabbage Salad is a delicious and healthy salad recipe.",
    calories: 300,
    tags: ["vegetable", "salad", "cabbage"],
    likes: 87,
    comments: 23,
    timeAgo: "12h Ago",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    user: {
      name: "Emma Wilson",
      username: "@emmaeats",
      avatar: "/cht.png?height=40&width=40",
    },
    image: "/food3.jpg?height=500&width=500",
    title: "Vegetable Salad With Avocado",
    description:
      "Vegetable salad with avocado is a delicious and healthy salad recipe.",
    calories: 420,
    tags: ["vegetable", "avocado", "salad"],
    likes: 67,
    comments: 15,
    timeAgo: "6h ago",
  },
];

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
          avatar: "/cht.png",
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
