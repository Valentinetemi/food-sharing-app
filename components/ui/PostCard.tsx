"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Share2,  } from "lucide-react"

type PostProps = {
    id: number;
    user: {
        name: string;
        username: string;
        avatar: string;
    };
    image: string;
    title: string;
    description: string;
    calories: number;
    tags: string[];
    likes: number;
    comments: number;
    timeAgo: string;
};

export function PostCard({ image, title, description, calories, tags, likes, comments, timeAgo  }:  PostProps) {
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(likes)

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1)
    };

    const handleComment = () => {
        //This would open comment section or navigate to comments
        console.log("Comment clicked");
    };

    const handleShare = () => {
        //This would trigger share logic or modal
       console.log ("Share Clicked")
    };

return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-md mb-6">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3">
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-xs text-gray-500">{user.username} • {timeAgo}</p>
        </div>
      </div>

      {/* Image */}
      <img src={image} alt={title} className="w-full h-60 object-cover rounded-xl mb-3" />

      {/* Content */}
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-1">Calories: {calories}</p>

        <div className="flex gap-2 mt-2 flex-wrap">
          {tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 px-2">
        <button onClick={handleLike} className="flex items-center gap-1 text-sm">
          <Heart className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : ""}`} />
          {likeCount}
        </button>

        <button onClick={handleComment} className="flex items-center gap-1 text-sm">
          <MessageCircle className="w-5 h-5" />
          {comments}
        </button>

        <button onClick={handleShare} className="flex items-center gap-1 text-sm">
          <Send className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  );
};