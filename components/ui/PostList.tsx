import { useEffect, useState } from "react";
import { usePosts } from "@/components/ui/PostsContext";
import PostCard from "./PostCard";
import { supabase } from "@/lib/supabase";

// IMPORTANT: Use a consistent getInitialAvatar function
const getInitialAvatar = (name: string): string => {
  if (!name || name === "Anonymous") {
    return "/default.png";
  }

  const firstLetter = name.trim().charAt(0).toUpperCase();
  const colors = [
    "#F87171", "#FB923C", "#FBBF24", "#A3E635", "#34D399",
    "#22D3EE", "#60A5FA", "#A78BFA", "#F472B6",
  ];
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="${bgColor}" />
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="central">
        ${firstLetter}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  created_at: string | null;
}

interface Post {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  tags: string[];
  calories: number;
  mealtype: string;
  created_at: string;
  user: Profile | null;
}

interface PostWithCounts extends Post {
  likes_count: number;
  comments_count: number;
}

export default function PostList() {
  const { posts, isLoading, fetchPosts } = usePosts();
  const [postsWithCounts, setPostsWithCounts] = useState<PostWithCounts[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!posts || posts.length === 0) {
        setPostsWithCounts([]);
        return;
      }

      const postIds = posts.map((p) => p.id);

      // Fetch likes counts
      const likesPromises = postIds.map(async (postId) => {
        const { count } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);
        return { postId, count: count || 0 };
      });

      // Fetch comments counts
      const commentsPromises = postIds.map(async (postId) => {
        const { count } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);
        return { postId, count: count || 0 };
      });

      const [likesResults, commentsResults] = await Promise.all([
        Promise.all(likesPromises),
        Promise.all(commentsPromises),
      ]);

      const likesMap = new Map(likesResults.map((r) => [r.postId, r.count]));
      const commentsMap = new Map(commentsResults.map((r) => [r.postId, r.count]));

      const postsWithData = posts.map((post) => ({
        ...post,
        likes_count: likesMap.get(post.id) || 0,
        comments_count: commentsMap.get(post.id) || 0,
      }));

      setPostsWithCounts(postsWithData);
    };

    fetchCounts();
  }, [posts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">Loading posts...</p>
      </div>
    );
  }

  if (postsWithCounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {postsWithCounts.map((post) => {
        // Generate avatar once per post, ensuring consistency
        const avatarUrl = post.user?.avatar || getInitialAvatar(post.user?.name || "Anonymous");
        
        return (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            caption={post.caption}
            image_url={post.image_url}
            user={{
              name: post.user?.name || "Anonymous",
              username: post.user?.username || "unknown",
              avatar: avatarUrl,
            }}
            likes={post.likes_count}
            comments={post.comments_count}
            tags={post.tags}
            calories={post.calories}
            timeAgo={formatTimeAgo(new Date(post.created_at))}
            mealtype={post.mealtype}
          />
        );
      })}
    </div>
  );
}

// Helper function to format time
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}