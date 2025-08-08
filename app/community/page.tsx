import {
  Users,
  TrendingUp,
  Award,
  MessageSquare,
  UserPlus,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommunityPage() {
  const topUsers = [
    {
      id: 1,
      name: "John Killin",
      username: "@emmaeats",
      avatar: "/placeholder.svg?height=40&width=40",
      posts: 156,
      followers: 3200,
      badge: "Top Chef",
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      username: "@mikeats",
      avatar: "/placeholder.svg?height=40&width=40",
      posts: 142,
      followers: 2800,
      badge: "Fitness Guru",
    },
    {
      id: 3,
      name: "Sarah Chen",
      username: "@sarahc",
      avatar: "/placeholder.svg?height=40&width=40",
      posts: 127,
      followers: 2400,
      badge: "Healthy Living",
    },
  ];

  const trendingTopics = [
    { name: "Meal Prep Sunday", posts: 234, trend: "+12%" },
    { name: "Keto Recipes", posts: 189, trend: "+8%" },
    { name: "Plant Based", posts: 167, trend: "+15%" },
    { name: "Quick Breakfast", posts: 145, trend: "+5%" },
    { name: "Dessert Goals", posts: 123, trend: "+20%" },
  ];

  const suggestedUsers = [
    {
      id: 1,
      name: "Alex Thompson",
      username: "@alexcooks",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Italian Cuisine",
      mutualFollowers: 12,
    },
    {
      id: 2,
      name: "Lisa Park",
      username: "@lisaeats",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Vegan Recipes",
      mutualFollowers: 8,
    },
    {
      id: 3,
      name: "David Kim",
      username: "@davidfood",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Asian Fusion",
      mutualFollowers: 15,
    },
  ];

  const community = [
    {
      id: 1,
      title: "🍳 Everyday Eats",
      description: "For casual meals, what people are really eating daily.",
      members: 127,
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

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-6 mobile-content-padding">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Community</h1>
            <p className="text-gray-400">
              Connect, grow, and share with others who love food just like you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users, topics..."
                className="pl-10 bg-gray-900 border-gray-700 text-gray-100 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-gray-100">20</div>
                  <div className="text-sm text-gray-400">Active Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-gray-100">26</div>
                  <div className="text-sm text-gray-400">Posts Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-gray-100">10</div>
                  <div className="text-sm text-gray-400">Trending Topics</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-gray-100">0</div>
                  <div className="text-sm text-gray-400">Active Challenges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="community" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-gray-200"
            >
              Join Communities
            </TabsTrigger>
            <TabsTrigger
              value="yours"
              className="data-[state=active]:bg-gray-200"
            >
              Your Communities
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gray-200"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="data-[state=active]:bg-slate-200 data-[state=active]:text-white"
            >
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-gray-200" 
            >
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-lg font-bold text-gray-400 w-6">
                          #{index + 1}
                        </div>
                        <Avatar className="h-10 w-10 ring-2 ring-gray-700">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-gray-700 text-gray-200">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-100">
                              {user.name}
                            </p>
                            <Badge
                              variant="secondary"
                              className="bg-yellow-900/30 text-yellow-400 text-xs"
                            >
                              {user.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {user.username}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-100">
                          {user.posts} posts
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.followers} followers
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={topic.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-gray-400 w-6">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-100">
                            {topic.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {topic.posts} posts
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-green-700 text-green-400"
                      >
                        {topic.trend}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges">
            <CardHeader>
              <CardTitle className="text-gray-100  flex items-center justify-center gap-2">
                🧪 Challenges Coming Soon
              </CardTitle>
              <CardContent className="text-gray-300 flex items-center justify-center pt-4 gap-2 ">
                Fun food challenges are on the way. Stay tuned! 🚀
              </CardContent>
            </CardHeader>
          </TabsContent>

          <TabsContent value="discover">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                  Suggested Users to Follow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg bg-gray-800/50 text-center"
                    >
                      <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-gray-700">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-gray-700 text-gray-200">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-gray-100">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-1">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-300 mb-2">
                        {user.specialty}
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        {user.mutualFollowers} mutual followers
                      </p>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <div className="space-y-4">
              {community.map((communityItem) => (
                <Card
                  key={communityItem.id}
                  className="bg-gray-900 border-gray-800"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">
                          {communityItem.title}
                        </h3>
                        <p className="text-gray-300 mb-3">
                          {communityItem.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {communityItem.members} Members
                          </div>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Join Communities
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
