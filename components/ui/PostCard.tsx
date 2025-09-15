"use client";

import {
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import Image from "next/image";
import { getAuth } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

type Comment = {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
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
  calories: number;
  timeAgo: string;
};

const likeSound =
  typeof Audio !== "undefined" ? new Audio("/like-pop.mp3") : null;

// Static comments data
const staticComments: Comment[] = [
  {
    id: 1,
    user: {
      name: "Joy Joseph",
      username: "jjl",
      avatar: "/jjl.jpg",
    },
    content: "This looks amazing! Would love to try this recipe.",
    timestamp: "2025-07-15T10:30:00Z",
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Benson John",
      username: "benson",
      avatar: "/ben.jpg",
    },
    content:
      "How many servings does this make? Planning to cook for family dinner.",
    timestamp: "2025-01-15T09:15:00Z",
    timeAgo: "3 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder-user.jpg",
    },
    content: "Love the presentation! The colors are so vibrant.",
    timestamp: "2024-01-15T08:45:00Z",
    timeAgo: "4 hours ago",
  },
];

export default function PostCard({
  id,
  title,
  description,
  image,
  user,
  likes: initialLikes,
  comments,
  tags,
  calories,
  timeAgo,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<number>(initialLikes ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState<Comment[]>(staticComments);
  const [commentCount, setCommentCount] = useState(comments || 0);

  useEffect(() => {
    // Initialize liked state and like count from database
    const initializeLikeState = async () => {
      const auth = getAuth();
      const { currentUser } = auth;
      
      if (!currentUser) {
        return;
      }

      try {
        // Check if user has liked this post
        const { data: existingLike, error: likeError } = await supabase
          .from("likes")
          .select("*")
          .eq("post_id", id)
          .eq("user_id", currentUser.uid)
          .maybeSingle();

        if (likeError && likeError.code !== "PGRST116") {
          console.error("Error checking like status:", likeError.message);
          return;
        }

        // Set liked state based on database
        setLiked(!!existingLike);

        // Get current like count from database
        const { count, error: countError } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", id);

        if (countError) {
          console.error("Error getting like count:", countError.message);
          return;
        }

        // Update like count
        setLikes(count || 0);
      } catch (error) {
        console.error("Error initializing like state:", error);
      }
    };

    initializeLikeState();
  }, [id]);

  type HeartBurst = { id: number; x: number; y: number };
  const [hearts, setHearts] = useState<HeartBurst[]>([]);

  const handleLike = async () => {
    await toggleLike(id);
    
    if (!liked && likeSound) {
      likeSound.play().catch(() => {});
    }
  };

  const handleDoubleClick = async () => {
    // Only like if not already liked (double-click should only like, not unlike)
    if (!liked) {
      await toggleLike(id);
    }

    // Show heart burst animation
    const heartBursts = [0, 1, 2];
    heartBursts.forEach((_, i) => {
      setTimeout(() => {
        if (likeSound) {
          likeSound?.pause();
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
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now(),
        user: {
          name: "Temiloluwa Valentine",
          username: "temivalentine",
          avatar: "/cht.png",
        },
        content: commentText,
        timestamp: new Date().toISOString(),
        timeAgo: "just now",
      };

      setPostComments([newComment, ...postComments]);
      setCommentCount(commentCount + 1);
      setCommentText("");
    }
  };
  const toggleLike = async (postId: string) => {
    const auth = getAuth();
    const { currentUser } = auth;
    if (!currentUser) {
      console.error("User not authenticated");
      return;
    }

    try{
      const { data: existingLike, error: checkError } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", currentUser.uid)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking like:", checkError.message);
        return;
      }

      if (existingLike) {
        // Already liked the post > unlike the post
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.uid);

        if (!deleteError) {
          setLiked(false);
          setLikes((prev) => Math.max(0, prev - 1)); // Prevent negative likes
          console.log("Successfully unliked post");
        } else {
          console.error("Error deleting like:", deleteError.message);
        }
      } else {
        // Not liked yet > like the post
        const { error: insertError } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: currentUser.uid });

        if (!insertError) {
          setLiked(true);
          setLikes((prev) => prev + 1);
          console.log("Successfully liked post");
        } else {
          console.error("Error inserting like:", insertError.message);
        }
      }
    } catch (error) {
      console.error("Unexpected error in toggleLike:", error);
    }
  };

  const mapDbPostToUiPost = async (dbPost: any, currentUser: any) => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", dbPost.id);

    let isLiked = false;
    if (currentUser) {
      const { data } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", dbPost.id)
        .eq("user_id", currentUser.uid)
        .maybeSingle();

      isLiked = !!data;
    }

    return {
      ...dbPost,
      likesCount: count || 0,
      isLikedByCurrentUser: isLiked,
    };
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

      {/* IMAGE */}
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

      {/* POST DETAILS */}
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

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-4 mt-3 text-pink">
        <button
          onClick={() => toggleLike(id)}
          className="flex items-center gap-1"
        >
          <HeartIcon
            className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : ""}`}
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

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="border-t border-gray-700 pt-4 space-y-4">
          <h3 className="text-white font-semibold">Comments</h3>

          {/* Add new comment */}
          <div className="space-y-2">
            <div className="flex gap-3">
              <img
                src="/placeholder-user.jpg"
                alt="Current User"
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white resize-none w-full p-2 rounded-md"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {postComments.map((comment) => (
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
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
