"use client";

import {
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import Image from "next/image";

type PostCardProps = {
  id: number;
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
  const [likes, setLikes] = useState(initialLikes || 0);

  type HeartBurst = { id: number; x: number; y: number };
  const [hearts, setHearts] = useState<HeartBurst[]>([]);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));

    if (newLiked && likeSound) likeSound.play().catch(() => {});
  };

  const handleDoubleClick = () => {
    setLiked(true);
    setLikes((prev) => (liked ? prev : prev + 1));

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
          x: Math.random() * 160 - 80, // random offset -50px to +50px
          y: Math.random() * 160 - 80,
        };

        setHearts((prev) => [...prev, burst]); // Unique key per heart

        setTimeout(() => {
          setHearts((prev) => prev.filter((h) => h.id !== burst.id));
        }, 600);
      }, i * 100);
    });
  };

  const handleComment = () => {
    alert("Comment feature coming soon!");
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

      {/* IMAGE WITH CALORIE BADGE*/}
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

      {/* POST DETAILS*/}
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

      {/* ACTION BUTTON*/}

      <div className="flex items-center gap-4 mt-3 text-pink">
        <button onClick={handleLike} className="flex items-center gap-1">
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
          {comments}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 hover:text-green-400"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  );
}
