import { Heart, MessageCircle, Share2, Users, TrendingUp, Camera } from "lucide-react"
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
      image: "/placeholder.svg?height=400&width=400",
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
    <div className=" min-h-screen bg-gray-950 ">
      {/* Header Stats */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 left-0 right-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">3.4k online</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">68 posts today</span>
              </div>
            </div>
            <Link href="/create">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Camera className="h-4 w-4 mr-2" />
                Share Food
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6 mobile-content-padding">
        <div className="space-y-6">
          {posts.map(post => (
        <PostCard key={post.id} {...post} />
      ))}
          {posts.map((post) => (
            <Card key={post.id} className="bg-gray-900 border-gray-800 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-gray-700">
                      <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                      <AvatarFallback className="bg-gray-700 text-gray-200">
                        {post.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-100">{post.user.name}</p>
                      <p className="text-sm text-gray-400">
                        {post.user.username} • {post.timeAgo}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-800">
                    {post.calories} cal
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-100 mb-2">{post.title}</h3>
                  <p className="text-gray-300 mb-3">{post.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-gray-700 text-gray-400">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 hover:bg-red-950/20"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-400 hover:bg-blue-950/20"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-green-400 hover:bg-green-950/20"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
  )
}
