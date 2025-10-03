// PostsContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

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
  tags: string[];
  calories: number;
  mealtype: string;
  created_at: string;
  user: Profile | null;
}

interface PostsContextType {
  posts: Post[];
  addPost: (post: Post) => void;
  fetchPosts: () => Promise<void>;
  isLoading: boolean;
}

const PostsContext = createContext<PostsContextType>({
  posts: [],
  addPost: () => {},
  fetchPosts: async () => {},
  isLoading: false,
});

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, title, caption, image_url, tags, calories, mealtype, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      setIsLoading(false);
      return;
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
      user: null,
    }));

    setPosts(formatted);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const subscription = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const newPost = payload.new;
          // Fetch user profile for the new post
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, name, username, avatar_url, created_at")
            .eq("id", newPost.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile for new post:", profileError);
            return;
          }

          const formattedPost: Post = {
            id: newPost.id,
            title: newPost.title,
            caption: newPost.caption,
            image_url: newPost.image_url,
            tags: newPost.tags ? newPost.tags.split(",") : [],
            calories: newPost.calories,
            mealtype: newPost.mealtype,
            created_at: newPost.created_at,
            user: profile
              ? {
                  id: profile.id,
                  name: profile.name || "Anonymous",
                  username:
                    profile.username || `user_${profile.id.slice(0, 8)}`,
                  avatar_url: profile.avatar_url || "/default-avatar.png",
                  created_at: profile.created_at,
                }
              : null,
          };

          setPosts((prev) => [formattedPost, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    // Optionally, trigger a fetch to ensure sync with database
    fetchPosts();
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, fetchPosts, isLoading }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => useContext(PostsContext);
