"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  UsersIcon,
  PaperAirplaneIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/24/solid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
}

interface Community {
  id: number;
  title: string;
  description: string;
  members: number;
  emoji?: string;
  created_at?: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  title: string;
  caption: string;
  image_url: string | null;
  community_id: number | null;
  created_at: string;
  profiles?: Profile;
}

interface PostCardProps {
  post: Post;
  onCommentAdded: () => void;
  onLikeToggled: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onCommentAdded,
  onLikeToggled,
}) => {
  const [user, setUser] = useState<any>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            id,
            name,
            username,
            avatar,
            email
          )
        `
        )
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading comments:", error);
        setComments([]);
        return;
      }

      // Handle the response and ensure profiles is properly typed
      const formattedComments = (data || []).map((comment: any) => ({
        id: comment.id,
        post_id: comment.post_id, 
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        profiles: comment.profiles || null
      }));

      setComments(formattedComments);
    } catch (err) {
      console.error("Error loading comments:", err);
      setComments([]);
    }
  };


  const loadLikes = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post.id);

    if (data) {
      setLikes(data as Like[]);
      if (user) {
        setIsLiked(data.some((like) => like.user_id === user.id));
      }
    }
    if (error) console.error("Error loading likes:", error);
  };

  useEffect(() => {
    loadComments();
    loadLikes();
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like posts");
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({
          post_id: post.id,
          user_id: user.id,
        });

        if (error) throw error;
      }

      await loadLikes();
      onLikeToggled();
    } catch (error: any) {
      console.error("Error toggling like:", error);
      alert("Failed to update like: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      alert("Please log in to comment");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      await loadComments();
      onCommentAdded();
    } catch (error: any) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-12 w-12 ring-2 ring-purple-500/30">
              <AvatarImage
                src={post.profiles?.avatar || ""}
                alt={post.profiles?.name || ""}
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                {post.profiles?.name?.charAt(0) ||
                  post.profiles?.email?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-100 text-lg">
                {post.profiles?.name || post.profiles?.username || "Anonymous"}
              </h4>
              <p className="text-sm text-gray-400">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          {post.title && (
            <h3 className="text-xl font-bold text-gray-100 mb-3">
              {post.title}
            </h3>
          )}

          <p className="text-gray-200 mb-6 leading-relaxed">{post.caption}</p>

          {post.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
              <img
                src={post.image_url}
                alt="Post content"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-8">
              <button
                onClick={handleLike}
                disabled={isLoading || !user}
                className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-all duration-200 group disabled:opacity-50"
              >
                {isLiked ? (
                  <HeartIconSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-sm font-medium">{likes.length}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-all duration-200"
              >
                <ChatBubbleLeftIcon className="h-6 w-6" />
                <span className="text-sm font-medium">{comments.length}</span>
              </button>

              <button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: post.title || "Delicious meal on FoodShare",
                      text: post.caption || "Check out this post on FoodShare",
                      url: `${window.location.origin}/community/${post.community_id}?post=${post.id}`,
                    });
                  } catch {
                    navigator.clipboard
                      .writeText(
                        `${window.location.origin}/community/${post.community_id}?post=${post.id}`
                      )
                      .then(() => alert("Link copied to clipboard."))
                      .catch(() =>
                        alert("Unable to share. Please copy the link manually.")
                      );
                  }
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-all duration-200"
              >
                <ArrowUpTrayIcon className="h-6 w-6" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-700 pt-6 mt-6"
              >
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                          <AvatarImage src={comment.profiles?.avatar || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                            {comment.profiles?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-100 text-sm">
                                {comment.profiles?.name || "Anonymous"}
                              </p>
                              <span className="text-xs text-gray-500">•</span>
                              <p className="text-xs text-gray-500">
                                {formatDate(comment.created_at)}
                              </p>
                            </div>
                            <p className="text-gray-200 text-sm">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ChatBubbleLeftIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No comments yet</p>
                    </div>
                  )}
                </div>

                {user && (
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                        {user.user_metadata?.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-3">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        className="bg-gray-800 border-gray-600 text-gray-100 text-sm resize-none min-h-[60px]"
                        rows={3}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isLoading}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ViewCommunityPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);
  const [user, setUser] = useState<any>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [joiningCommunity, setJoiningCommunity] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkMembership = async () => {
    if (!user) return;

    const { data: membership } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsMember(!!membership);

    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId);

    setMemberCount(count || 0);
  };

  const handleJoinToggle = async () => {
    if (!user) {
      alert("Please log in to join communities");
      return;
    }

    setJoiningCommunity(true);
    try {
      if (isMember) {
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsMember(false);
        setMemberCount((prev) => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase.from("community_members").insert({
          community_id: communityId,
          user_id: user.id,
        });

        if (error) throw error;

        setIsMember(true);
        setMemberCount((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("Error toggling membership:", error);
      alert("Failed to update membership: " + error.message);
    } finally {
      setJoiningCommunity(false);
    }
  };

  useEffect(() => {
    const loadCommunityData = async () => {
      setLoading(true);

      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .single();

      if (communityData) setCommunity(communityData);
      if (communityError)
        console.error("Error loading community:", communityError);

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          id,
          user_id,
          title,
          caption,
          image_url,
          community_id,
          created_at,
          profiles!posts_user_id_fkey (
            id,
            name,
            username,
            avatar,
            email
          )
        `
        )
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (postsData) setPosts(postsData as Post[]);
      if (postsError) console.error("Error loading posts:", postsError);

      await checkMembership();
      setLoading(false);
    };

    loadCommunityData();
  }, [communityId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-100 mb-6">
            Community Not Found
          </h1>
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-gray-400"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              {community.emoji && `${community.emoji} `}
              {community.title}
            </h1>
            <p className="text-gray-300 mb-4 text-lg">
              {community.description}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400 font-medium">
                  {memberCount} members
                </span>
              </div>
              {user && (
                <Button
                  onClick={handleJoinToggle}
                  disabled={joiningCommunity}
                  size="sm"
                  className={
                    isMember
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  }
                >
                  {joiningCommunity
                    ? "..."
                    : isMember
                    ? "Leave"
                    : "Join Community"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onCommentAdded={checkMembership}
                onLikeToggled={checkMembership}
              />
            ))
          ) : (
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
              <CardContent className="p-12 text-center">
                <ChatBubbleLeftIconSolid className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-200 mb-3">
                  No posts yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Be the first to share in this community!
                </p>
                {user && (
                  <Button
                    onClick={() => router.push("/create")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
