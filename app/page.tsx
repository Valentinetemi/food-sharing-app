"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/ui/PostCard";
import { usePosts } from "@/context/PostsContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { posts, isLoading } = usePosts();
  const [visiblePosts, setVisiblePosts] = useState(4);

  const loadMorePosts = () => {
    setVisiblePosts((prev) => Math.min(prev + 4, posts.length));
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-64">
        {/* Main Feed */}
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-0">
          <div className="space-y-6">
            {isLoading
              ? // Loading skeletons
                Array(2)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 p-4 rounded-lg shadow-lg space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-[300px] w-full rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))
              : // Actual posts
                posts
                  .slice(0, visiblePosts)
                  .map((post) => <PostCard key={post.id} {...post} />)}
          </div>

          {/* Load More */}
          {visiblePosts < posts.length && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                onClick={loadMorePosts}
              >
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
