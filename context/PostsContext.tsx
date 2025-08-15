"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the Post type
export type Post = {
  id: number;
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
  addPost: (post: Omit<Post, "id" | "likes" | "comments" | "timeAgo">) => void;
  isLoading: boolean;
};

// Create the context with a default value
const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Initial posts data
const initialPosts: Post[] = [
  {
    id: 1,
    user: {
      name: "Temiloluwa",
      username: "@temiloluwa",
      avatar: "/cht.png?height=60&width=60",
    },
    image: "/salad.jpg?height=400&width=400",
    title: "Homemade Avocado Toast",
    description:
      "Perfect breakfast with sourdough, avocado, cherry tomatoes, and a poached egg!",
    calories: 320,
    tags: ["breakfast", "healthy", "vegetarian"],
    likes: 38,
    comments: 29,
    timeAgo: "2h ago",
  },
  {
    id: 2,
    user: {
      name: "Mike Rodriguez",
      username: "@mikeats",
      avatar: "/cht.png?height=40&width=40",
    },
    image: "/salad.jpg?height=100&width=200",
    title: "Grilled Salmon Bowl",
    description:
      "Fresh salmon with quinoa, roasted vegetables, and tahini dressing. Post-workout fuel!",
    calories: 485,
    tags: ["dinner", "protein", "healthy"],
    likes: 42,
    comments: 12,
    timeAgo: "4h ago",
  },
  {
    id: 3,
    user: { name: "Joy Wilson", username: "@joywilson", avatar: "" },
    image: "/salad.jpg?height=400&width=400",
    title: "Cake",
    description: "Vanilla cake with orange juice",
    calories: 300,
    tags: ["dessert", "sweet"],
    likes: 87,
    comments: 23,
    timeAgo: "12h Ago",
  },
  {
    id: 4,
    user: {
      name: "Emma Wilson",
      username: "@emmaeats",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=500&width=500",
    title: "Chocolate Lava Cake",
    description:
      "Indulgent dessert night! Sometimes you just need to treat yourself 🍫",
    calories: 420,
    tags: ["dessert", "chocolate", "indulgent"],
    likes: 67,
    comments: 15,
    timeAgo: "6h ago",
  },
];

// Create the provider component
export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  // Function to add a new post
  const addPost = (
    newPostData: Omit<Post, "id" | "likes" | "comments" | "timeAgo">
  ) => {
    setIsLoading(true);

    // Create a new post with generated fields
    const newPost: Post = {
      ...newPostData,
      id: Date.now(), // Use timestamp as a unique ID
      likes: 0,
      comments: 0,
      timeAgo: "Just now",
    };

    // Add the new post to the beginning of the array
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setIsLoading(false);
  };

  // Provide the context value
  const value = {
    posts,
    addPost,
    isLoading,
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
