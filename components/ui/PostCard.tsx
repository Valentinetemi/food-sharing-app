"use client";

import {
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
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
};

type PostCardProps = {
  id: string;
  title: string;
  description: string;
  image: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  tags: string[];
  calories: string;
  timeAgo: string;
};

const likeSound =
  typeof Audio !== "undefined" ? new Audio("/like-pop.mp3") : null;

// Generate an initial avatar (SVG data URL) from user's name
const getInitialAvatar = (name: string) => {
  if (!name || name === "Anonymous") {
    return "/default.png";
  }

  const firstLetter = name.trim().charAt(0).toUpperCase();
  const colors = [
    "#F87171",
    "#FB923C",
    "#FBBF24",
    "#A3E635",
    "#34D399",
    "#22D3EE",
    "#60A5FA",
    "#A78BFA",
    "#F472B6",
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

export default function PostCard({
  id,
  title,
  description,
  image,
  user,
  likes: initialLikes,
  comments: initialComments,
  tags,
  calories,
  timeAgo,
}: PostCardProps): JSX.Element {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<number>(initialLikes ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(initialComments || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("No authenticated user");
        alert("Please log in to interact with posts.");
        return;
      }

      try {
        // Fetch current user's profile for commenting
        let profile: Profile | null = null;
        const { data: me, error: meError } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", user.id)
          .maybeSingle();

        if (meError) {
          console.error("Profile fetch error:", meError.message);
          profile = {
            id: user.id,
            name: user.user_metadata.full_name || "Anonymous",
            username: user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
            avatar: getInitialAvatar(user.user_metadata.full_name || user.email || "Anonymous"),
          };
          const { error: insertError } = await supabase
            .from("users")
            .upsert(profile, { onConflict: "id" });
          if (insertError) {
            console.error("Profile insert error:", insertError.message);
          }
        } else if (!me) {
          profile = {
            id: user.id,
            name: user.user_metadata.full_name || "Anonymous",
            username: user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
            avatar: getInitialAvatar(user.user_metadata.full_name || user.email || "Anonymous"),
          };
          const { error: insertError } = await supabase
            .from("users")
            .upsert(profile, { onConflict: "id" });
          if (insertError) {
            console.error("Profile insert error:", insertError.message);
            profile = null;
          }
        } else {
          profile = {
            id: me.id,
            name: me.name || user.user_metadata.full_name || "Anonymous",
            username: me.email?.split("@")[0] || `user_${me.id.slice(0, 8)}`,
            avatar: getInitialAvatar(me.name || user.user_metadata.full_name || me.email || "Anonymous"),
          };
        }

        setCurrentProfile(profile);

        // Fetch likes
        const { data: existingLike, error: likeError } = await supabase
          .from("likes")
          .select("*")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (likeError && likeError.code !== "PGRST116") {
          console.error("Like fetch error:", likeError.message);
        }
        setLiked(!!existingLike);

        const { count, error: countError } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", id);

        if (countError) {
          console.error("Like count error:", countError.message);
        } else {
          setLikes(count || 0);
        }

        // Fetch comments
        const { data: dbComments, error: commentsError } = await supabase
          .from("comments")
          .select(`
            id,
            content,
            created_at,
            user_id,
            users!comments_user_id_fkey(id, name, email)
          `)
          .eq("post_id", id)
          .order("created_at", { ascending: false });

        if (commentsError) {
          console.error("Comments fetch error:", commentsError.message);
          alert("Failed to load comments: " + commentsError.message);
        } else {
          setPostComments(
            (dbComments || []).map((c: any) => {
              const profile = c.users || {};
              const name = profile.name || c.user_id === user.id ? user.user_metadata.full_name : "Anonymous";
              const username = profile.email?.split("@")[0] || `user_${(c.user_id || "unknown").slice(0, 8)}`;
              const avatar = getInitialAvatar(name);
              return {
                id: String(c.id),
                user: {
                  id: c.user_id || "",
                  name,
                  username,
                  avatar,
                },
                content: c.content,
                timestamp: c.created_at,
                timeAgo: formatTimeAgo(new Date(c.created_at)),
              } as Comment;
            })
          );
          setCommentCount((dbComments || []).length);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        alert("Failed to initialize post data.");
      }
    };

    initializeData();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        initializeData();
      } else if (event === "SIGNED_OUT") {
        setCurrentProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [id]);

  type HeartBurst = { id: number; x: number; y: number };
  const [hearts, setHearts] = useState<HeartBurst[]>([]);

  const handleDoubleClick = () => {
    if (!liked && !isLiking) {
      const heartBursts = [0, 1, 2];
      heartBursts.forEach((_, i) => {
        setTimeout(() => {
          if (likeSound) {
            likeSound.pause();
            likeSound.currentTime = 0;
            likeSound.play().catch(() => {});
          }
          const burst: HeartBurst = {
            id: Date.now() + i,
            x: Math.random() * 160 - 80,
            y: Math.random() * 160 - 80,
          };
          setHearts((prev) => [...prev, burst]);
          setTimeout(() => {
            setHearts((prev) => prev.filter((h) => h.id !== burst.id));
          }, 600);
        }, i * 100);
      });
      toggleLike(id);
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      console.log("Comment text is empty");
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("No authenticated user");
      alert("Please log in to comment.");
      return;
    }

    if (!currentProfile) {
      console.error("Current profile not loaded");
      alert("Profile not loaded. Please try again.");
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticComment: Comment = {
      id: tempId,
      user: currentProfile,
      content: commentText,
      timestamp: new Date().toISOString(),
      timeAgo: "just now",
    };

    setPostComments((prev) => [optimisticComment, ...prev]);
    setCommentCount((prev) => prev + 1);
    const previousComments = postComments;
    const textToSend = commentText;
    setCommentText("");

    try {
      const { error, data } = await supabase
        .from("comments")
        .insert({
          post_id: id,
          user_id: user.id,
          content: textToSend,
          created_at: new Date().toISOString(),
        })
        .select("id, content, created_at")
        .single();

      if (error) {
        console.error("Comment insert error:", error.message);
        setPostComments(previousComments);
        setCommentCount((prev) => Math.max(0, prev - 1));
        setCommentText(textToSend);
        alert(`Failed to add comment: ${error.message}`);
        return;
      }

      if (data) {
        const persisted: Comment = {
          id: data.id,
          user: currentProfile,
          content: data.content,
          timestamp: data.created_at,
          timeAgo: formatTimeAgo(new Date(data.created_at)),
        };
        setPostComments((prev) => [
          persisted,
          ...prev.filter((c) => c.id !== tempId),
        ]);
      }
    } catch (err) {
      console.error("Unexpected error in handleAddComment:", err);
      setPostComments(previousComments);
      setCommentCount((prev) => Math.max(0, prev - 1));
      setCommentText(textToSend);
      alert("Unexpected error adding comment.");
    }
  };

  const handleCommentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (!currentProfile || !commentText.trim()) return;
      e.preventDefault();
      handleAddComment();
    }
  };

  const toggleLike = async (postId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated");
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
        const { error } = await supabase.from("likes").upsert(
          {
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString(),
          },
          { onConflict: ["post_id", "user_id"] }
        );

        if (error) {
          console.error("Error adding like:", error.message);
          setLiked(previousLiked);
          setLikes(previousLikes);
          alert(`Failed to like post: ${error.message}`);
          return;
        }
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error removing like:", error.message);
          setLiked(previousLiked);
          setLikes(previousLikes);
          alert(`Failed to unlike post: ${error.message}`);
          return;
        }
      }

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      setLikes(count || 0);
      setLiked(newLiked);
    } catch (err) {
      console.error("Unexpected error in toggleLike:", err);
      setLiked(previousLiked);
      setLikes(previousLikes);
      alert("Unexpected error. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text: description,
        url: window.location.href,
      });
    } catch {
      alert("Sharing failed or was cancelled.");
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-10 w-10 rounded-full"
        />
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

      <div
        onDoubleClick={handleDoubleClick}
        className="relative cursor-pointer"
      >
        <Image
          src={image}
          alt={title}
          width={600}
          height={600}
          className="w-[600px] h-[500px] object-cover rounded-md"
        />
        {hearts.map(({ id, x, y }) => (
          <HeartIcon
            key={id}
            className="absolute top-1/2 left-1/2 text-red-500 opacity-90 animate-heart-burst z-20 pointer-events-none"
            style={{
              top: `50%`,
              left: `50%`,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              width: "100px",
              height: "100px",
            }}
          />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-gray-300">{description}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-pink">
        <button
          onClick={() => toggleLike(id)}
          disabled={isLiking}
          className={`flex items-center gap-1 ${
            isLiking ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <HeartIcon
            className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : ""} ${
              isLiking ? "animate-pulse" : ""
            }`}
          />
          {likes}
        </button>

        <button
          onClick={handleComment}
          className="flex items-center gap-1 hover:text-blue-400"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          {commentCount}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 hover:text-green-400"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Share
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-700 pt-4 space-y-4">
          <h3 className="text-white font-semibold">Comments</h3>
          <div className="space-y-2">
            <div className="flex gap-3">
              <img
                src={currentProfile?.avatar || "/placeholder-user.jpg"}
                alt={currentProfile?.name || "Current User"}
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  className="bg-gray-800 border-gray-700 text-white resize-none w-full p-2 rounded-md"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || !currentProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {postComments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            ) : (
              postComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">
                          {comment.user.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          @{comment.user.username}
                        </span>
                        <span className="text-gray-500 text-xs">
                          · {comment.timeAgo}
                        </span>
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