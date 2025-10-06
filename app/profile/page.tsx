"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  FireIcon,
  UserGroupIcon,
  PlusIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  FireIcon as FireSolidIcon,
} from "@heroicons/react/24/solid";
import { getInitialAvatar } from "@/lib/utils";

interface LocalUserProfile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
}

interface Post {
  id: string;
  image: string;
  title: string;
  calories: number;
  created_at: string;
  caption?: string;
  tags?: string[];
  mealtype?: string;
  likes_count?: number;
  comments_count?: number;
}

// Meal type color mapping
const getMealTypeColor = (mealtype: string) => {
  const colors = {
    breakfast: "from-amber-500 to-orange-500",
    lunch: "from-green-500 to-emerald-500",
    dinner: "from-purple-500 to-indigo-500",
    snack: "from-pink-500 to-rose-500",
    dessert: "from-red-500 to-pink-500",
    beverage: "from-blue-500 to-cyan-500",
    appetizer: "from-yellow-500 to-amber-500",
    "main course": "from-orange-500 to-red-500",
  };
  return (
    colors[mealtype.toLowerCase() as keyof typeof colors] ||
    "from-gray-500 to-gray-600"
  );
};

const getMealTypeIcon = (mealtype: string) => {
  const icons = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍿",
    dessert: "🍰",
    beverage: "🥤",
    appetizer: "🥗",
    "main course": "🍽️",
  };
  return icons[mealtype.toLowerCase() as keyof typeof icons] || "🍽️";
};

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Check auth state and set user
  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || "User",
        });
        setError(null);
      } else {
        setCurrentUser(null);
        setError("User not logged in");
      }
      setAuthChecking(false);
      setProfileLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.full_name || "User",
          });
          setProfileLoading(false);
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setError("User not logged in");
          setProfileLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load user profile from profiles table
  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) {
        setError("User not logged in");
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, name, username, avatar")
          .eq("id", currentUser.id)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setProfile(data);
        } else {
          // Create initial profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.name || "User",
                username: currentUser.email?.split("@")[0] || "user",
                avatar: getInitialAvatar(currentUser.name || "User"),
              },
            ])
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setProfile(newProfile);
        }
      } catch (err: any) {
        console.error("Error loading profile:", err.message);
        setError("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [currentUser]);

  // Load user posts with likes and comments count
  useEffect(() => {
    async function fetchPosts() {
      if (!currentUser) {
        setError("User not logged in");
        return;
      }

      try {
        setLoading(true);

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(
            "id, image_url, title, calories, created_at, caption, tags, mealtype"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (postsError) {
          throw new Error(`Failed to fetch posts: ${postsError.message}`);
        }

        if (!postsData || postsData.length === 0) {
          setPosts([]);
          return;
        }

        // Fetch likes and comments counts for all posts
        const postIds = postsData.map((p) => p.id);

        // Get likes count
        const likesPromises = postIds.map(async (postId) => {
          const { count } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);
          return { postId, count: count || 0 };
        });

        // Get comments count
        const commentsPromises = postIds.map(async (postId) => {
          const { count } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);
          return { postId, count: count || 0 };
        });

        const likesResults = await Promise.all(likesPromises);
        const commentsResults = await Promise.all(commentsPromises);

        // Create lookup maps
        const likesMap = new Map(likesResults.map((r) => [r.postId, r.count]));
        const commentsMap = new Map(
          commentsResults.map((r) => [r.postId, r.count])
        );

        // Combine data
        const postsWithCounts = postsData.map((post: any) => ({
          id: post.id,
          image: post.image_url,
          title: post.title,
          calories: post.calories,
          created_at: post.created_at,
          caption: post.caption,
          tags: post.tags ? post.tags.split(",") : [],
          mealtype: post.mealtype,
          likes_count: likesMap.get(post.id) || 0,
          comments_count: commentsMap.get(post.id) || 0,
        }));

        setPosts(postsWithCounts);
      } catch (err: any) {
        console.error("Error fetching posts:", err.message);
        setError(err.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [currentUser]);

  const handleProfileUpdated = () => {
    if (currentUser) {
      supabase
        .from("profiles")
        .select("id, email, name, username, avatar")
        .eq("id", currentUser.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          } else {
            console.error("Error refreshing profile:", error?.message);
          }
        });

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.user_metadata.full_name || "User",
          });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-gray-950/50 border-gray-800/30 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Avatar Section */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="relative">
                      <Avatar className="h-32 w-32 sm:h-40 sm:w-40 ring-4 ring-gradient-to-r from-orange-500/30 to-pink-500/30 shadow-2xl">
                        <AvatarImage
                          src={
                            profile?.avatar ||
                           getInitialAvatar(profile?.name || currentUser?.name || "User")
                          }
                          alt="Profile"
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-4xl font-bold">
                          {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator */}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Profile Info */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex-1 text-center lg:text-left"
                  >
                    <div className="space-y-4">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent tracking-tight">
                          {profile?.name || currentUser?.name || "User"}
                        </h1>
                        <p className="text-lg text-gray-400 mt-1">
                          @
                          {profile?.username ||
                            currentUser?.email?.split("@")[0] ||
                            "username"}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
                        <div className="flex items-center gap-2 bg-gray-900/30 px-4 py-2 rounded-full border border-gray-800/40">
                          <SparklesIcon className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-300 font-medium">
                            {posts.length} Posts
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-900/30 px-4 py-2 rounded-full border border-gray-800/40">
                          <HeartIcon className="w-4 h-4 text-red-500" />
                          <span className="text-gray-300 font-medium">
                            {posts.reduce(
                              (total, post) => total + (post.likes_count || 0),
                              0
                            )}{" "}
                            Likes
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-900/30 px-4 py-2 rounded-full border border-gray-800/40">
                          <ChatBubbleLeftIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-300 font-medium">
                            {posts.reduce(
                              (total, post) =>
                                total + (post.comments_count || 0),
                              0
                            )}{" "}
                            Comments
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-800 hover:bg-white/500 hover:border-orange-500/50 transition-all duration-300"
                          onClick={() => setShowEditDialog(true)}
                        >
                          Edit Profile
                        </Button>
                        <Link href="/create">
                          <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                            <PlusIcon className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            New Post
                          </Button>
                        </Link>
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full sm:w-auto border-red-600/50 text-red-400 hover:bg-red-400/20 hover:border-red-600 transition-all duration-300 group"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Posts Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20 lg:pb-8 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {profileLoading || loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading your delicious posts...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-red-400 text-lg font-medium">{error}</p>
                <p className="text-gray-400 mt-2">
                  Please try again later or contact support.
                </p>
              </div>
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Start sharing your delicious creations with the community!
                </p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Posts Grid Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-100 mb-2">
                  Your Food Journey
                </h2>
                <p className="text-gray-400">
                  All your delicious creations in one place
                </p>
              </motion.div>

              {/* Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.5 + index * 0.1,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className="group"
                  >
                    <Card className="bg-gray-950/60 border-gray-800/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden backdrop-blur-sm">
                      <CardContent className="p-0">
                        {/* Image Container */}
                        <div className="relative overflow-hidden">
                          <Image
                            src={post.image || "/img.jpeg"}
                            alt={post.title}
                            width={400}
                            height={400}
                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
                          />

                          {/* Meal Type Badge */}
                          {post.mealtype && (
                            <div
                              className={`absolute top-3 left-3 bg-gradient-to-r ${getMealTypeColor(
                                post.mealtype
                              )} px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg`}
                            >
                              <span className="text-sm">
                                {getMealTypeIcon(post.mealtype)}
                              </span>
                              <span className="text-xs font-semibold text-white capitalize">
                                {post.mealtype}
                              </span>
                            </div>
                          )}

                          {/* Calories Badge */}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-sm font-bold text-white flex items-center gap-1">
                              <FireSolidIcon className="w-3 h-3 text-orange-400" />
                              {post.calories} cal
                            </span>
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <HeartIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {post.likes_count || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {post.comments_count || 0}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      post.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-100 text-lg mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors duration-300">
                            {post.title}
                          </h3>

                          {post.caption && (
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                              {post.caption}
                            </p>
                          )}

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs bg-gray-900/40 text-gray-300 hover:bg-gray-800/50 transition-colors duration-300 border border-gray-800/30"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-gray-900/40 text-gray-400 border border-gray-800/30"
                                >
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <HeartIcon className="w-3 h-3" />
                                {post.likes_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <ChatBubbleLeftIcon className="w-3 h-3" />
                                {post.comments_count || 0}
                              </span>
                            </div>
                            <span className="text-xs">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onProfileUpdated={handleProfileUpdated}
        profile={profile}
      />
    </div>
  );
}