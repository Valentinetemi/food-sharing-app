"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";

interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  name: string | null;
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
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Load user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setError("User not logged in");
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("firebase_uid", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setProfile(data);
        } else {
          // Create initial profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert([
              {
                firebase_uid: user.id,
                email: user.email,
                name: user.name || "User",
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
        console.error("Error loading profile:", err.message, err.details);
        setError("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  // Load user posts
  useEffect(() => {
    async function fetchPosts() {
      if (!user) {
        setError("User not logged in");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching posts for firebase_uid:", user.id); // Debug user.id
        const { data, error } = await supabase
          .from("posts")
          .select("id, image_url, title, calories, created_at, caption, tags, mealtype")
          .eq("firebase_uid", user.id) // Changed from user_id to firebase_uid
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error.message, error.details, error.code);
          throw new Error(`Failed to fetch posts: ${error.message}`);
        }

        if (data) {
          setPosts(
            data.map((post: any) => ({
              id: post.id,
              image: post.image_url, // Map imageurl to image
              title: post.title,
              calories: post.calories,
              created_at: post.created_at,
              caption: post.caption,
              tags: post.tags,
              mealtype: post.mealtype,
            }))
          );
        } else {
          setPosts([]); // Ensure posts is empty if no data
        }
      } catch (err: any) {
        console.error("Error fetching posts:", err.message);
        setError(err.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [user]);

  const handleProfileUpdated = () => {
    if (user) {
      supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          } else {
            console.error("Error refreshing profile:", error?.message);
          }
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    profile?.email?.charAt(0) || "U"
                  )}&background=random&color=fff`}
                  alt="Profile"
                />
                <AvatarFallback className="bg-gray-700 text-gray-200 text-2xl">
                  {profile?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-100">
                  {profile?.name || "User"}
                </h1>
                <p className="text-gray-400">@{profile?.email || "username"}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                    onClick={() => setShowEditDialog(true)}
                  >
                    Edit Profile
                  </Button>
                  <Link href="/create">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      New Post
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {profileLoading || loading ? (
          <div className="text-gray-300 text-center">Loading...</div>
        ) : error ? (
          <div className="text-red-400 text-center">
            {error}. Please try again later or contact support.
          </div>
        ) : posts.length === 0 ? (
          <div className="text-gray-300 text-center">
            No posts yet.{" "}
            <Link href="/create" className="text-orange-500 hover:underline">
              Create your first post!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-3">
                  <Image
                    src={post.image || "/img.jpeg"}
                    alt={post.title}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-cover"
                  />
                  <h3 className="font-medium text-gray-100 mt-2">{post.title}</h3>
                  <p className="text-sm text-gray-400">
                    {post.calories} cal • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  {post.caption && <p className="text-sm text-gray-400 mt-1">{post.caption}</p>}
                  {post.tags && (
                    <p className="text-sm text-gray-400 mt-1">Tags: {post.tags.join(", ")}</p>
                  )}
                  {post.mealtype && (
                    <p className="text-sm text-gray-400 mt-1">Meal Type: {post.mealtype}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Profile Edit Dialog */}
        <ProfileEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onProfileUpdated={handleProfileUpdated}
          profile={profile}
        />
      </div>
    </div>
  );
}