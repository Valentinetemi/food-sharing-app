import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    useCallback,
  } from "react";
  import { supabase } from "@/lib/supabase";
import { getInitialAvatar } from "@/lib/utils";
  
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
  
  // Helper function to consistently format post data from various sources
  const mapToPost = (p: any, profileSource: any): Post => {
    const profile = profileSource;
  
    const user: Profile | null = profile
      ? {
          id: profile.id,
          name: profile.name || "Anonymous",
          username: profile.username || `user_${profile.id.slice(0, 8)}`,
          avatar: profile.avatar || getInitialAvatar(profile.name || ""),
          created_at: profile.created_at,
        }
      : null;
  
    return {
      id: p.id,
      title: p.title,
      caption: p.caption,
      image_url: p.image_url,
      tags: p.tags ? p.tags.split(",") : [],
      calories: p.calories,
      mealtype: p.mealtype,
      created_at: p.created_at,
      user: user,
    };
  };
  
  export const PostsProvider = ({ children }: { children: ReactNode }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
  
    const fetchPosts = useCallback(async () => {
      console.log("🔍 Starting fetchPosts...");
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
            tags,
            calories,
            mealtype,
            user_id,
            created_at,
            profiles!posts_user_id_fkey(id, name, username, avatar, created_at)
          `
          )
          .order("created_at", { ascending: false });
        
        if (error) {
          throw error;
        }
  
        if (!data || data.length === 0) {
          console.warn(" No posts returned from database");
          setPosts([]);
          return;
        }
  
        console.log(" First post raw data:", data[0]);
        console.log(" First post profile data:", data[0]?.profiles);
  
        // Map fetched data, passing the nested 'profiles' object as the source
        const formatted: Post[] = (data || []).map((p: any) => {
          console.log("🔄 Mapping post:", p.id, "Profile:", p.profiles);
          return mapToPost(p, p.profiles);
        });
  
        console.log("✅ Formatted posts:", formatted);
        console.log("✅ Total posts formatted:", formatted.length);
        setPosts(formatted);
      } catch (error) {
        console.error("💥 Error loading posts during fetch:", error);
      } finally {
        setIsLoading(false);
        console.log("🏁 fetchPosts completed");
      }
    }, []);
  
    const addPost = (newPost: Post) => {
      setPosts((prev) => [newPost, ...prev]);
    };
  
    useEffect(() => {
      fetchPosts();
  
      const subscription = supabase
        .channel("posts-changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "posts" },
          async (payload) => {
            const newPost = payload.new;
  
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, name, username, avatar, created_at")
              .eq("id", newPost.user_id)
              .single();
  
            const formattedPost: Post = mapToPost(newPost, profile);
  
            setPosts((prev) => {
              if (prev.some((p) => p.id === formattedPost.id)) {
                return prev;
              }
              return [formattedPost, ...prev];
            });
          }
        )
        .subscribe();
  
      return () => {
        subscription.unsubscribe();
      };
    }, [fetchPosts]);
  
    return (
      <PostsContext.Provider value={{ posts, addPost, fetchPosts, isLoading }}>
        {children}
      </PostsContext.Provider>
    );
  };
  
  export const usePosts = () => useContext(PostsContext);