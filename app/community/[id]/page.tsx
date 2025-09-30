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
import { auth, db } from "@/app/firebase/config";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion, AnimatePresence } from "framer-motion";

// TypeScript Interfaces
interface Community {
  id: number;
  title: string;
  description: string;
  members: number;
}

interface Comment {
  id: string | number;
  author:
    | string
    | {
        uid: string;
        name: string;
        email: string;
        avatar?: string;
      };
  authorAvatar?: string;
  text: string;
  createdAt: any;
  postId?: string;
}

interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: any;
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
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [user] = useAuthState(auth);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load comments and likes
  useEffect(() => {
    if (!user) return;

    const postId = post.id.toString();

    // Subscribe to comments
    const commentsQuery = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    );

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(commentsData);
    });

    // Subscribe to likes
    const likesQuery = query(
      collection(db, "likes"),
      where("postId", "==", postId)
    );

    const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
      const likesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Like[];
      setLikes(likesData);
      setIsLiked(likesData.some((like) => like.userId === user.uid));
    });

    return () => {
      unsubscribeComments();
      unsubscribeLikes();
    };
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const postId = post.id.toString();
      const likeRef = doc(db, "likes", `${user.uid}_${postId}`);

      if (isLiked) {
        await deleteDoc(likeRef);
      } else {
        await addDoc(collection(db, "likes"), {
          userId: user.uid,
          postId: postId,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsLoading(true);
    try {
      const postId = post.id.toString();
      await addDoc(collection(db, "comments"), {
        postId: postId,
        author: {
          uid: user.uid,
          name: user.displayName || user.email?.split("@")[0] || "Anonymous",
          email: user.email || "",
          avatar: user.photoURL,
        },
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsLoading(false);
    }
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
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-12 w-12 ring-2 ring-purple-500/30">
              <AvatarImage src={post.authorAvatar} alt={post.author} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                {post.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-100 text-lg">
                {post.author}
              </h4>
              <p className="text-sm text-gray-400">{post.createdAt}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <BookmarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Post Content */}
          <motion.p
            className="text-gray-200 mb-6 leading-relaxed text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {post.content}
          </motion.p>

          {/* Post Image */}
          {post.imageUrl && (
            <motion.div
              className="mb-6 rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-8">
              <motion.button
                onClick={handleLike}
                disabled={isLoading || !user}
                className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-all duration-200 group disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isLiked ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  )}
                </motion.div>
                <span className="text-sm font-medium">{likes.length}</span>
              </motion.button>

              <motion.button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChatBubbleLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{comments.length}</span>
              </motion.button>

              <motion.button
                className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-all duration-200 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShareIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Share</span>
              </motion.button>
            </div>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-700 pt-6 mt-6"
              >
                {/* Existing Comments */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto comments-scrollbar">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3"
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                          <AvatarImage
                            src={
                              typeof comment.author === "string"
                                ? comment.authorAvatar || "/default-avatar.png"
                                : comment.author.avatar || "/default-avatar.png"
                            }
                            alt={
                              typeof comment.author === "string"
                                ? comment.author
                                : comment.author.name
                            }
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                            {typeof comment.author === "string"
                              ? comment.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : comment.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-100 text-sm">
                                {typeof comment.author === "string"
                                  ? comment.author
                                  : comment.author.name}
                              </p>
                              <span className="text-xs text-gray-500">•</span>
                              <p className="text-xs text-gray-500">
                                {comment.createdAt
                                  ?.toDate?.()
                                  ?.toLocaleDateString() ||
                                  (typeof comment.createdAt === "string"
                                    ? comment.createdAt
                                    : "Just now")}
                              </p>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ChatBubbleLeftIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Comment */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                      <AvatarImage
                        src={user.photoURL || ""}
                        alt={user.displayName || ""}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                        {user.displayName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
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
                        className="bg-gray-800 border-gray-600 text-gray-100 text-sm resize-none min-h-[60px] focus:border-purple-500 transition-colors"
                        rows={3}
                        disabled={isLoading}
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isLoading}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 h-auto disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <PaperAirplaneIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Component
export default function ViewCommunityPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);
  const [user] = useAuthState(auth);

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Find community by ID
    const foundCommunity = mockCommunities.find((c) => c.id === communityId);
    setCommunity(foundCommunity || null);

    // Load posts for this community
    setPosts(mockPosts[communityId] || []);
  }, [communityId]);

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-100 mb-6">
            Community Not Found
          </h1>
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3"
          >
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </motion.div>
          <div className="flex-1">
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3 animate-gradient"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {community.title}
            </motion.h1>
            <motion.p
              className="text-gray-300 mb-4 text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {community.description}
            </motion.p>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <UsersIcon className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400 font-medium">
                {community.members} members
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Posts */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-xl">
                <CardContent className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    <ChatBubbleLeftIconSolid className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">
                    No posts yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Be the first to share something in this community!
                  </p>
                  {user && (
                    <Button
                      onClick={() => router.push("/create")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3"
                    >
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
