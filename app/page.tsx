import { Heart, MessageCircle, Share2, Users, TrendingUp, Camera, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { comment } from "postcss"
import PostCard  from "@/components/ui/PostCard"

export default function HomePage() {
  const posts = [
    {
      id: 1,
      user: { name: "Temiloluwa", username: "@temiloluwa", avatar: "/cht.png?height=60&width=60" },
      image: "/salad.jpg?height=400&width=400",
      title: "Homemade Avocado Toast",
      description: "Perfect breakfast with sourdough, avocado, cherry tomatoes, and a poached egg!",
      calories: 320,
      tags: ["breakfast", "healthy", "vegetarian"],
      likes: 38,
      comments: 29,
      timeAgo: "2h ago",
    },
    {
      id: 2,
      user: { name: "Mike Rodriguez", username: "@mikeats", avatar: "/cht.png?height=40&width=40" },
      image: "/salad.jpg?height=100&width=200",
      title: "Grilled Salmon Bowl",
      description: "Fresh salmon with quinoa, roasted vegetables, and tahini dressing. Post-workout fuel!",
      calories: 485,
      tags: ["dinner", "protein", "healthy"],
      likes: 42,
      comments: 12,
      timeAgo: "4h ago",
    },

    {
      id: 3,
      user: {name: "Joy Wilson", username: "@joywilson", avatar: ""},
      image: "/salad.jpg?height=400&width=400",
      title: "Cake",
      description: "Vanilla cake with orange juice",
      calories : 300,
      tags: ["dessert", "sweet"],
      likes: 87,
      comments: 23,
      timeAgo: "12h Ago",
    },

    {
      id: 4,
      user: { name: "Emma Wilson", username: "@emmaeats", avatar: "/placeholder.svg?height=40&width=40" },
      image: "/placeholder.svg?height=500&width=500",
      title: "Chocolate Lava Cake",
      description: "Indulgent dessert night! Sometimes you just need to treat yourself 🍫",
      calories: 420,
      tags: ["dessert", "chocolate", "indulgent"],
      likes: 67,
      comments: 15,
      timeAgo: "6h ago",
    },
  ]

  return (
  <div className="min-h-screen bg-gray-950">
    {/* Header Stats */}

    {/* Main Content */}
    < main className="flex-1 ml-0 lg:ml-64">

      {/* Main Feed */}
      <div className="border border-red-500">
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-0">
        <div className="space-y-6">
          {posts.map(post => (
        <PostCard key={post.id} {...post} />
      ))}
      </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-300 text-gray-100 bg-transparent">
            Load More Posts
          </Button>
        </div>
      </div>
      </div>
      </main>
    </div>
  
  )
}
