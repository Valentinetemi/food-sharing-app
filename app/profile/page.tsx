import { Calendar, MapPin, Heart, MessageCircle, Settings, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"

export default function ProfilePage() {
  const userPosts = [
    {
      id: 1,
      image: "/img.jpeg?height=300&width=300",
      title: "Spaghetti with chicken",
      calories: 320,
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      image: "/90.jpeg?height=300&width=300",
      title: "Protein Bowl",
      calories: 485,
      likes: 42,
      comments: 12,
    },
    {
      id: 3,
      image: "img1.jpeg?height=300&width=300",
      title: "Green Smoothie",
      calories: 180,
      likes: 31,
      comments: 6,
    },
    {
      id: 4,
      image: "/img2.jpeg?height=300&width=300",
      title: "Pasta Primavera",
      calories: 420,
      likes: 56,
      comments: 18,
    },
  ]

  const achievements = [
    { name: "Food Explorer", description: "Shared 50+ different cuisines", icon: "🌍" },
    { name: "Healthy Eater", description: "Posted 100+ healthy meals", icon: "🥗" },
    { name: "Community Star", description: "Received 1000+ likes", icon: "⭐" },
    { name: "Calorie Counter", description: "Tracked 30 days straight", icon: "📊" },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-gray-700">
                  <AvatarImage src="/cht.png?height=96&width=96" alt="Profile" />
                  <AvatarFallback className="bg-gray-700 text-gray-200 text-2xl">SC</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gray-800 border-2 border-gray-900"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-100">Blessing Joshua</h1>
                    <p className="text-gray-400">@bj</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Abuja, Nigeria
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined July 2025
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-700 text-gray-300 bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Link href="/create">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500">
                        <Camera className="h-4 w-4 mr-2" />
                        New Post
                      </Button>
                    </Link>
                  </div>
                </div>

                <p className="text-gray-300 mt-4">
                  Food enthusiast 🍽️ | Healthy living advocate | Sharing my culinary adventures one meal at a time ✨
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-100">30</div>
                <div className="text-sm text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-100">250</div>
                <div className="text-sm text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-100">230</div>
                <div className="text-sm text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">4200</div>
                <div className="text-sm text-gray-400">Avg Calories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="posts" className="data-[state=active]:bg-gray-100">
              Posts
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gray-100">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-gray-100">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-gray-900 border-gray-800 overflow-hidden group cursor-pointer hover:ring-2 hover:ring-orange-500/50 transition-all"
                >
                  <div className="relative">
                    <Image
                      src={post.image || "/img.jpeg"}
                      alt={post.title}
                      width={300}
                      height={300}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-100 truncate">{post.title}</h3>
                      <Badge variant="secondary" className="bg-green-900/30 text-green-400 text-xs">
                        {post.calories} cal
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.name} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-100">{achievement.name}</h3>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <h3 className="font-semibold text-gray-100">Weekly Calorie Intake</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                      const calories = [1800, 2100, 1950, 2200, 1750, 2400, 2000][index]
                      const percentage = (calories / 2400) * 100
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <div className="w-8 text-sm text-gray-400">{day}</div>
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm text-gray-300 text-right">{calories}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <h3 className="font-semibold text-gray-100">Favorite Cuisines</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Italian", count: 23, color: "bg-red-500" },
                      { name: "Asian", count: 19, color: "bg-yellow-500" },
                      { name: "Mediterranean", count: 15, color: "bg-blue-500" },
                      { name: "Mexican", count: 12, color: "bg-green-500" },
                      { name: "American", count: 8, color: "bg-purple-500" },
                    ].map((cuisine) => (
                      <div key={cuisine.name} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${cuisine.color}`} />
                        <div className="flex-1 text-gray-300">{cuisine.name}</div>
                        <div className="text-gray-400">{cuisine.count} posts</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
