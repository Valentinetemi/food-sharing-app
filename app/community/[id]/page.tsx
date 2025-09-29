"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  UsersIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
} from "@heroicons/react/24/solid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// TypeScript Interfaces
interface Community {
  id: number;
  title: string;
  description: string;
  members: number;
}

interface Comment {
  id: number;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: number;
  author: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
}

// Mock Data
const mockCommunities: Community[] = [
  {
    id: 1,
    title: "🍳 Everyday Eats",
    description: "For casual meals, what people are really eating daily.",
    members: 50,
  },
  {
    id: 2,
    title: "🥑 Healthy Plates",
    description: "Focused on nutritious meals, clean eating, and wellness.",
    members: 82,
  },
  {
    id: 3,
    title: "Naija Kitchen",
    description: "For those who love bold or culturally rich meals.",
    members: 34,
  },
];

const mockPosts: { [key: number]: Post[] } = {
  1: [
    {
      id: 1,
      author: "Sarah Johnson",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Just made the most amazing scrambled eggs with herbs from my garden! Sometimes the simplest meals are the best. What's your go-to comfort breakfast?",
      imageUrl: "/placeholder.svg?height=300&width=400",
      likes: 24,
      comments: [
        {
          id: 1,
          author: "Mike Chen",
          authorAvatar: "/placeholder.svg?height=32&width=32",
          text: "Looks delicious! I love adding fresh chives to my eggs too.",
          createdAt: "2 hours ago",
        },
        {
          id: 2,
          author: "Emma Wilson",
          authorAvatar: "/placeholder.svg?height=32&width=32",
          text: "Garden herbs make such a difference! Do you grow your own?",
          createdAt: "1 hour ago",
        },
      ],
      createdAt: "3 hours ago",
      isLiked: false,
    },
    {
      id: 2,
      author: "David Rodriguez",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Quick lunch hack: leftover rice + whatever vegetables you have + soy sauce + fried egg = perfect meal! Anyone else love these simple combinations?",
      likes: 18,
      comments: [
        {
          id: 3,
          author: "Lisa Park",
          authorAvatar: "/placeholder.svg?height=32&width=32",
          text: "Yes! I do this all the time. Sometimes I add sriracha for extra kick.",
          createdAt: "30 minutes ago",
        },
      ],
      createdAt: "5 hours ago",
      isLiked: true,
    },
    {
      id: 3,
      author: "Alex Thompson",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Made pasta with whatever I had in the fridge - cherry tomatoes, spinach, and some leftover chicken. It's amazing how good simple ingredients can taste together!",
      imageUrl: "/placeholder.svg?height=300&width=400",
      likes: 31,
      comments: [],
      createdAt: "1 day ago",
      isLiked: false,
    },
  ],
  2: [
    {
      id: 4,
      author: "Jennifer Lee",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Green smoothie bowl with homemade granola! Packed with spinach, banana, mango, and topped with chia seeds. Perfect way to start the morning with nutrients!",
      imageUrl: "/placeholder.svg?height=300&width=400",
      likes: 42,
      comments: [
        {
          id: 4,
          author: "Mark Davis",
          authorAvatar: "/placeholder.svg?height=32&width=32",
          text: "This looks amazing! What's your granola recipe?",
          createdAt: "1 hour ago",
        },
      ],
      createdAt: "2 hours ago",
      isLiked: true,
    },
    {
      id: 5,
      author: "Rachel Green",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Quinoa salad with roasted vegetables and tahini dressing. Meal prep Sunday done right! This will keep me energized all week.",
      likes: 28,
      comments: [],
      createdAt: "6 hours ago",
      isLiked: false,
    },
  ],
  3: [
    {
      id: 6,
      author: "Kemi Adebayo",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content:
        "Jollof rice Sunday! Made it with the perfect blend of spices and served with plantain and chicken. Nothing beats authentic Nigerian flavors! 🇳🇬",
      imageUrl: "/placeholder.svg?height=300&width=400",
      likes: 67,
      comments: [
        {
          id: 5,
          author: "Tunde Okafor",
          authorAvatar: "/placeholder.svg?height=32&width=32",
          text: "This looks perfect! The rice has that beautiful color. What's your secret spice blend?",
          createdAt: "2 hours ago",
        },
        {
          id: 6,
          author: "Amara Nwosu",
          authorAvatar: "/placeholder.svg?height=32&width=32",
          text: "Jollof rice is life! Yours looks absolutely delicious 😍",
          createdAt: "1 hour ago",
        },
      ],
      createdAt: "4 hours ago",
      isLiked: false,
    },
  ],
};

// Components
interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment("");
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.authorAvatar} alt={post.author} />
            <AvatarFallback className="bg-gray-700 text-gray-200">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-100">{post.author}</h4>
            <p className="text-sm text-gray-400">{post.createdAt}</p>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-gray-200 mb-4 leading-relaxed">{post.content}</p>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            {post.isLiked ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span className="text-sm">{post.likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="text-sm">{post.comments.length}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-700 pt-4">
            {/* Existing Comments */}
            {post.comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.authorAvatar}
                        alt={comment.author}
                      />
                      <AvatarFallback className="bg-gray-700 text-gray-200 text-xs">
                        {comment.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="font-medium text-gray-200 text-sm">
                          {comment.author}
                        </p>
                        <p className="text-gray-300 text-sm">{comment.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.createdAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-700 text-gray-200 text-xs">
                  You
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  className="bg-gray-800 border-gray-700 text-gray-100 text-sm"
                />
                <Button
                  onClick={handleAddComment}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
export default function ViewCommunityPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Find community by ID
    const foundCommunity = mockCommunities.find((c) => c.id === communityId);
    setCommunity(foundCommunity || null);

    // Load posts for this community
    setPosts(mockPosts[communityId] || []);
  }, [communityId]);

  const handleLike = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: number, commentText: string) => {
    const newComment: Comment = {
      id: Date.now(), // Simple ID generation for demo
      author: "You",
      authorAvatar: "/placeholder.svg?height=32&width=32",
      text: commentText,
      createdAt: "Just now",
    };

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">
            Community Not Found
          </h1>
          <Button
            onClick={() => router.back()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              {community.title}
            </h1>
            <p className="text-gray-400 mb-3">{community.description}</p>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {community.members} members
              </span>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          ) : (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8 text-center">
                <ChatBubbleLeftIconSolid className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-500">
                  Be the first to share something in this community!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
