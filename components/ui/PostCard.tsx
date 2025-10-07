"use client";

import {
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
  HeartIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  username: string;
  avatar: string;
};

type Comment = {
  id: string;
  user: Profile;
  content: string;
  timestamp: string;
  timeAgo: string;
  user_id: string;
};

type PostCardProps = {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  tags: string[];
  calories: number;
  timeAgo: string;
  mealtype: string;
  communityId?: string;
};

const likeSound = typeof Audio !== "undefined" ? new Audio("/like-pop.mp3") : null;

// Generate avatar URL using DiceBear API
const generateAvatar = (username: string) => {
  const seed = encodeURIComponent(username || "anonymous");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1,8b5cf6,ec4899,ef4444,f59e0b`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

export default function PostCard({
  id,
  title,
  caption,
  image_url,
  user,
  likes: initialLikes,
  comments: initialComments,
  tags,
  calories,
  timeAgo,
  communityId,
}: PostCardProps): JSX.Element {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<number>(initialLikes ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(initialComments || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const postAuthorAvatar = useMemo(() => {
    return user.avatar && user.avatar !== "/default.png" 
      ? user.avatar 
      : generateAvatar(user.username || user.name);
  }, [user.avatar, user.username, user.name]);

  useEffect(() => {
    const initializeData = async () => {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authUser) {
        setCurrentProfile(null);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, username, avatar")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profile) {
          const avatarUrl = profile.avatar && profile.avatar !== "/default.png"
            ? profile.avatar
            : generateAvatar(profile.username || profile.name || `user_${profile.id.slice(0, 8)}`);
          
          setCurrentProfile({
            id: profile.id,
            name: profile.name || "Anonymous",
            username: profile.username || `user_${profile.id.slice(0, 8)}`,
            avatar: avatarUrl,
          });
        } else {
          const username = authUser.email?.split("@")[0] || `user_${authUser.id.slice(0, 8)}`;
          setCurrentProfile({
            id: authUser.id,
            name: authUser.user_metadata.full_name || "Anonymous",
            username: username,
            avatar: generateAvatar(username),
          });
        }

        const { data: existingLike } = await supabase
          .from("likes")
          .select("*")
          .eq("post_id", id)
          .eq("user_id", authUser.id)
          .maybeSingle();
        setLiked(!!existingLike);

        const { count } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", id);
        setLikes(count || 0);

        const { data: dbComments } = await supabase
          .from("comments")
          .select(`id, content, created_at, user_id, profiles!comments_user_id_fkey(id, name, username, avatar)`)
          .eq("post_id", id)
          .order("created_at", { ascending: false });

        if (dbComments) {
          setPostComments(
            dbComments.map((c: any) => {
              const profile = c.profiles || {};
              const username = profile.username || `user_${(c.user_id || "unknown").slice(0, 8)}`;
              const avatarUrl = profile.avatar && profile.avatar !== "/default.png"
                ? profile.avatar
                : generateAvatar(profile.name || username);
              
              return {
                id: String(c.id),
                user: {
                  id: c.user_id || "",
                  name: profile.name || "Anonymous",
                  username: username,
                  avatar: avatarUrl,
                },
                content: c.content,
                timestamp: c.created_at,
                timeAgo: formatTimeAgo(new Date(c.created_at)),
                user_id: c.user_id,
              };
            })
          );
          setCommentCount(dbComments.length);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        initializeData();
      } else if (event === "SIGNED_OUT") {
        setCurrentProfile(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [id]);

  const handleDoubleClick = () => {
    if (!liked && !isLiking) {
      [0, 1, 2].forEach((_, i) => {
        setTimeout(() => {
          if (likeSound) {
            likeSound.pause();
            likeSound.currentTime = 0;
            likeSound.play().catch(() => {});
          }
          const burst = {
            id: Date.now() + i,
            x: Math.random() * 160 - 80,
            y: Math.random() * 160 - 80,
          };
          setHearts((prev) => [...prev, burst]);
          setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== burst.id)), 600);
        }, i * 100);
      });
      toggleLike(id);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser || !currentProfile) {
      alert("Please log in to comment.");
      return;
    }

    const textToSend = commentText;
    setCommentText("");

    const { error } = await supabase.from("comments").insert({
      post_id: id,
      user_id: authUser.id,
      content: textToSend,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setCommentText(textToSend);
      alert(`Failed to add comment: ${error.message}`);
      return;
    }

    const { data: dbComments } = await supabase
      .from("comments")
      .select(`id, content, created_at, user_id, profiles!comments_user_id_fkey(id, name, username, avatar)`)
      .eq("post_id", id)
      .order("created_at", { ascending: false });

    if (dbComments) {
      setPostComments(
        dbComments.map((c: any) => {
          const profile = c.profiles || {};
          const username = profile.username || `user_${(c.user_id || "unknown").slice(0, 8)}`;
          const avatarUrl = profile.avatar && profile.avatar !== "/default.png"
            ? profile.avatar
            : generateAvatar(username);
          
          return {
            id: String(c.id),
            user: {
              id: c.user_id || "",
              name: profile.name || "Anonymous",
              username: username,
              avatar: avatarUrl,
            },
            content: c.content,
            timestamp: c.created_at,
            timeAgo: formatTimeAgo(new Date(c.created_at)),
            user_id: c.user_id,
          };
        })
      );
      setCommentCount(dbComments.length);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentProfile) {
      alert("Please log in to delete comments.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    setDeletingCommentId(commentId);

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", currentProfile.id);

    if (error) {
      alert(`Failed to delete comment: ${error.message}`);
      setDeletingCommentId(null);
      return;
    }

    setPostComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((prev) => Math.max(0, prev - 1));
    setDeletingCommentId(null);
  };

  const toggleLike = async (postId: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert("Please log in to like posts.");
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const previousLiked = liked;
    const previousLikes = likes;
    const newLiked = !liked;
    
    setLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (newLiked) {
        await supabase.from("likes").upsert(
          { post_id: postId, user_id: authUser.id, created_at: new Date().toISOString() },
          { onConflict: "post_id,user_id" }
        );
      } else {
        await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", authUser.id);
      }

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      setLikes(count || 0);
    } catch (err) {
      setLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = communityId
      ? `${window.location.origin}/community/${communityId}?post=${id}`
      : `${window.location.origin}/post/${id}`;

    const shareData = {
      title: title || "Delicious meal on FoodShare",
      text: caption || "Check out this post on FoodShare",
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("Link copied to clipboard! 📋"))
      .catch(() => prompt("Copy this link:", text));
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <img src={postAuthorAvatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
        <div>
          <p className="text-white font-semibold">{user.name}</p>
          <span className="text-gray-400">@{user.username}</span>
          <span className="ml-auto text-xs text-gray-500">. {timeAgo}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {calories} cal
          </span>
        </div>
      </div>

      <div onDoubleClick={handleDoubleClick} className="relative cursor-pointer">
        <Image src={image_url} alt={title} width={600} height={600} className="w-[600px] h-[500px] object-cover rounded-md" />
        {hearts.map(({ id, x, y }) => (
          <HeartIcon
            key={id}
            className="absolute top-1/2 left-1/2 text-red-500 opacity-90 animate-heart-burst z-20 pointer-events-none"
            style={{ top: `50%`, left: `50%`, transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`, width: "100px", height: "100px" }}
          />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-gray-300">{caption}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {tags.map((tag, i) => (
            <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">#{tag}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-pink">
        <button onClick={() => toggleLike(id)} disabled={isLiking} className={`flex items-center gap-1 ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}>
          <HeartIcon className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : ""} ${isLiking ? "animate-pulse" : ""}`} />
          {likes}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 hover:text-blue-400">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          {commentCount}
        </button>
        <button onClick={handleShare} className="flex items-center gap-1 hover:text-green-400 transition-colors">
          <ArrowUpTrayIcon className="w-5 h-5" />
          Share
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-700 pt-4 space-y-4">
          <h3 className="text-white font-semibold">Comments</h3>
          <div className="flex gap-3">
            <img src={currentProfile?.avatar || generateAvatar("anonymous")} alt={currentProfile?.name || "User"} className="h-8 w-8 rounded-full object-cover" />
            <div className="flex-1 space-y-2">
              <textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && currentProfile && commentText.trim()) { e.preventDefault(); handleAddComment(); }}}
                className="bg-gray-800 border-gray-700 text-white resize-none w-full p-2 rounded-md"
                rows={2}
              />
              <div className="flex justify-end">
                <button onClick={handleAddComment} disabled={!commentText.trim() || !currentProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50">
                  Post
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {postComments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            ) : (
              postComments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <img src={comment.user.avatar} alt={comment.user.name} className="h-8 w-8 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{comment.user.name}</span>
                          <span className="text-gray-400 text-xs">@{comment.user.username}</span>
                          <span className="text-gray-500 text-xs">· {comment.timeAgo}</span>
                        </div>
                        {currentProfile && comment.user_id === currentProfile.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 disabled:opacity-50"
                            title="Delete comment"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}