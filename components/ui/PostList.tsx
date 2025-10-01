import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "./PostCard";

// Types
interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface Post {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  tags: string[]; // split into array
  calories: number;
  mealtype: string;
  created_at: string;
  user: Profile | null;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            id,
            title,
            caption,
            image_url,
            tags,
            calories,
            mealtype,
            created_at,
            user_id,
            profiles (
              id,
              name,
              username,
              avatar_url,
              created_at
            )
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error.message);
          return;
        }

        const formattedPosts: Post[] = data.map((post: any) => ({
          id: post.id,
          title: post.title,
          caption: post.caption,
          image_url: post.image_url,
          tags: post.tags ? post.tags.split(",") : [],
          calories: post.calories,
          mealtype: post.mealtype,
          created_at: post.created_at,
          user: post.profiles
            ? {
                id: post.profiles.id,
                name: post.profiles.name || "Anonymous",
                username:
                  post.profiles.username ||
                  `user_${post.profiles.id.slice(0, 8)}`,
                avatar_url:
                  post.profiles.avatar_url || "/default-avatar.png",
                created_at: post.profiles.created_at,
              }
            : null,
        }));

        setPosts(formattedPosts);
      } catch (err) {
        console.error("Unexpected error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <div className="text-gray-100">Loading posts...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 ? (
        <p className="text-gray-400">No posts available.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            description={post.caption}
            image={post.image_url}
            user={{
              name: post.user?.name || "Anonymous",
              username: post.user?.username || "unknown",
              avatar: post.user?.avatar_url || "/default-avatar.png",
            }}
            likes={0}
            comments={0}
            tags={post.tags}
            calories={post.calories}
            timeAgo={new Date(post.created_at).toLocaleString()}
          />
        ))
      )}
    </div>
  );
}
