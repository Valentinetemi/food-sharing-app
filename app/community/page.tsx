'use client';

import { UsersIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/solid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/NotificationsContext";

export default function CommunityPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addNotification } = useNotifications();

  type Community = {
    id: number;
    title: string;
    description: string;
    members: number;
  };

  const [activeTab, setActiveTab] = useState("join");
  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);

  //communityList is an array of community
  const communityList: Community[] = [
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

  const handleJoin = (community: Community) => {
    // Check if community is already joined
    if (joinedIds.includes(community.id)) {
      return;
    }

    // Add to joined IDs
    setJoinedIds((prev) => [...prev, community.id]);

    // Add to user communities
    setUserCommunities((prev) => {
      if (prev.some((com) => com.id === community.id)) {
        return prev;
      }
      return [...prev, { ...community }];
    });

    // Show toast notification
    toast({
      title: "Community Joined",
      description: `You have joined ${community.title}`,
      duration: 3000,
    });

    // Add a notification
    addNotification({
      type: "system",
      message: `You have joined the ${community.title} community. Start connecting with other members!`,
    });

    // Switch to user communities tab
    setActiveTab("usercommunity");
  };

  return (
    <div
      className="
      min-h-screen
      bg-gray-950
    "
    >
      <div className="flex-1 ml-0 lg:ml-64">
        <div
          className="
        max-w-6xl
        mx-auto
        px-4
        py-6
        pb-20 lg:pb-6
        mobile-content-padding
      "
        >
          {/* Header */}
          <div
            className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-12
          mb-8
        "
          >
            <div>
              <h1
                className="
              text-3xl
              font-bold
              text-gray-100
            "
              >
                Community
              </h1>
              <p className="text-gray-400">
                Connect, grow, and share with others who love food just like
                you.
              </p>
            </div>
            {/* Search bar - commented out (part of Discover) */}
            {/*
            <div
              className="
            flex
            items-center
            gap-3
          "
            >
              <div className="relative">
                <MagnifyingGlassIcon
                  className="
                absolute
                left-3
                top-1/2
                transform
                -translate-y-1/2
                h-4
                w-4
                text-gray-400
              "
                />
                <Input
                  placeholder="Search users, topics..."
                  className="
                  pl-10
                  bg-gray-900
                  border-gray-700
                  text-gray-100
                  w-64
                "
                />
              </div>
            </div>
            */}
          </div>

          {/* Stats Cards - commented out (Statistics and Achievements) */}
          {/*
          <div
            className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
          mb-6
        "
          >
            <Card
              className="
            bg-gray-900
            border-gray-800
          "
            >
              <CardContent className="p-4">
                <div
                  className="
                flex
                items-center
                gap-3
              "
                >
                  <UsersIcon
                    className="
                  h-8
                  w-8
                  text-blue-400
                "
                  />
                  <div>
                    <div
                      className="
                    text-2xl
                    font-bold
                    text-gray-100
                  "
                    >
                      20
                    </div>
                    <div
                      className="
                    text-sm
                    text-gray-400
                  "
                    >
                      Active Members
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="
            bg-gray-900
            border-gray-800
          "
            >
              <CardContent className="p-4">
                <div
                  className="
                flex
                items-center
                gap-3
              "
                >
                  <ChatBubbleLeftIcon
                    className="
                  h-8
                  w-8
                  text-green-400
                "
                  />
                  <div>
                    <div
                      className="
                    text-2xl
                    font-bold
                    text-gray-100
                  "
                    >
                      26
                    </div>
                    <div
                      className="
                    text-sm
                    text-gray-400
                  "
                    >
                      Posts Today
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="
            bg-gray-900
            border-gray-800
          "
            >
              <CardContent className="p-4">
                <div
                  className="
                flex
                items-center
                gap-3
              "
                >
                  <ArrowTrendingUpIcon
                    className="
                  h-8
                  w-8
                  text-orange-400
                "
                  />
                  <div>
                    <div
                      className="
                    text-2xl
                    font-bold
                    text-gray-100
                  "
                    >
                      10
                    </div>
                    <div
                      className="
                    text-sm
                    text-gray-400
                  "
                    >
                      Trending Topics
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="
            bg-gray-900
            border-gray-800
          "
            >
              <CardContent className="p-4">
                <div
                  className="
                flex
                items-center
                gap-3
              "
                >
                  <TrophyIcon
                    className="
                  h-8
                  w-8
                  text-purple-400
                "
                  />
                  <div>
                    <div
                      className="
                    text-2xl
                    font-bold
                    text-gray-100
                  "
                    >
                      0
                    </div>
                    <div
                      className="
                    text-sm
                    text-gray-400
                  "
                    >
                      Upcoming Challenges
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          */}

          {/* Main Content */}
          <div className="w-full">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-3"
            >
              <TabsList
                className="
            bg-gray-900
            border-gray-800
            flex flex-col sm:flex-row
            w-full
            h-auto
            flex-wrap
            gap-4           
           p-4
          "
              >
                <TabsTrigger
                  value="join"
                  className="data-[state=active]:bg-gray-200 w-full sm:w-auto"
                >
                  Join Communities
                </TabsTrigger>
                <TabsTrigger
                  value="usercommunity"
                  className="
              data-[state=active]:bg-slate-200
              w-full sm:w-auto
              "
                >
                  Your Communities
                </TabsTrigger>
                {/* Commented out non-MVP tabs */}
                {/*
                <TabsTrigger
                  value="leaderboard"
                  className="
              data-[state=active]:bg-slate-200
              w-full sm:w-auto
              "
                >
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger
                  value="discover"
                  className="
              data-[state=active]:bg-slate-200
              w-full sm:w-auto
              "
                >
                  Discover
                </TabsTrigger>
                <TabsTrigger
                  value="challenges"
                  className="
              data-[state=active]:bg-slate-200
              w-full sm:w-auto
              "
                >
                  Challenges
                </TabsTrigger>
                */}
              </TabsList>

              {/* Leaderboard - commented out (non-MVP) */}
              {/*
              <TabsContent value="leaderboard">
                <div
                  className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-6
            "
                >
                  <Card
                    className="
                bg-gray-900
                border-gray-800
              "
                  >
                    <CardHeader>
                      <CardTitle
                        className="
                    text-gray-100
                    flex
                    items-center
                    gap-2
                  "
                      >
                        <TrophyIcon
                          className="
                      h-5
                      w-5
                      text-yellow-400
                    "
                        />
                        Top Contributors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {topUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-lg
                        bg-gray-800/50
                      "
                        >
                          <div
                            className="
                        flex
                        items-center
                        gap-3
                        flex-1
                      "
                          >
                            <div
                              className="
                          text-lg
                          font-bold
                          text-gray-400
                          w-6
                        "
                            >
                              #{index + 1}
                            </div>
                            <Avatar
                              className="
                          h-10
                          w-10
                          ring-2
                          ring-gray-700
                        "
                            >
                              <AvatarImage
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                              />
                              <AvatarFallback
                                className="
                            bg-gray-700
                            text-gray-200
                          "
                              >
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div
                                className="
                            flex
                            items-center
                            gap-2
                          "
                              >
                                <p
                                  className="
                              font-semibold
                              text-gray-100
                            "
                                >
                                  {user.name}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className="
                                bg-yellow-900/30
                                text-yellow-400
                                text-xs
                              "
                                >
                                  {user.badge}
                                </Badge>
                              </div>
                              <p
                                className="
                            text-sm
                            text-gray-400
                          "
                              >
                                {user.username}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="
                          text-sm
                          font-semibold
                          text-gray-100
                        "
                            >
                              {user.posts} posts
                            </div>
                            <div
                              className="
                          text-xs
                          text-gray-400
                        "
                            >
                              {user.followers} followers
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card
                    className="
                bg-gray-900
                border-gray-800
              "
                  >
                    <CardHeader>
                      <CardTitle
                        className="
                    text-gray-100
                    flex
                    items-center
                    gap-2
                  "
                      >
                        <ArrowTrendingUpIcon
                          className="
                      h-5
                      w-5
                      text-green-400
                    "
                        />
                        Trending Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {trendingTopics.map((topic, index) => (
                        <div
                          key={topic.name}
                          className="
                        flex
                        items-center
                        justify-between
                        p-3
                        rounded-lg
                        bg-gray-800/50
                        hover:bg-gray-800
                        cursor-pointer
                        transition-colors
                      "
                        >
                          <div
                            className="
                        flex
                        items-center
                        gap-3
                      "
                          >
                            <div
                              className="
                          text-sm
                          font-bold
                          text-gray-400
                          w-6
                        "
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <p
                                className="
                            font-medium
                            text-gray-100
                          "
                              >
                                {topic.name}
                              </p>
                              <p
                                className="
                            text-sm
                            text-gray-400
                          "
                              >
                                {topic.posts} posts
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="
                          border-green-700
                          text-green-400
                        "
                          >
                            {topic.trend}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              */}

              {/* Challenges - commented out (non-MVP) */}
              {/*
              <TabsContent value="challenges">
                <CardHeader>
                  <CardTitle
                    className="
              text-gray-100
                flex
                items-center
                  justify-center
                  gap-2"
                  >
                    🧪 Challenges Coming Soon
                  </CardTitle>
                  <CardContent
                    className="
              text-gray-300 
              flex
               items-center
                justify-center
                 pt-4 
                 gap-2 "
                  >
                    Fun food challenges are on the way. Stay tuned! 🚀
                  </CardContent>
                </CardHeader>
              </TabsContent>
              */}

              {/* Discover - commented out (non-MVP) */}
              {/*
              <TabsContent value="discover">
                <Card
                  className="
            bg-gray-900
             border-gray-800"
                >
                  <CardHeader>
                    <CardTitle
                      className="
                text-gray-100 
                flex
                 items-center
                 gap-2"
                    >
                      <UserPlusIcon className="h-5 w-5 text-blue-400" />
                      People You May Know
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="grid
                 grid-cols-1
                  md:grid-cols-2 
                  lg:grid-cols-3
                   gap-4"
                    >
                      {suggestedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="p-4 
                      rounded-lg 
                      bg-gray-800/50 
                      text-center"
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
                            {user.mutualFollowers} Your followers
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
              */}

              <TabsContent value="join">
                <div className="space-y-4">
                  {communityList.map((communityItem: Community) => (
                    <Card
                      key={communityItem.id}
                      className="bg-gray-900
                   border-gray-800"
                    >
                      <CardContent className="p-6">
                        <div
                          className="flex
                     flex-col
                      md:flex-row md:items-center
                       md:justify-between 
                       gap-4"
                        >
                          <div className="flex-1">
                            <h3
                              className="text-lg
                         font-semibold
                          text-gray-100 
                         mb-2"
                            >
                              {communityItem.title}
                            </h3>
                            <p className="text-gray-300 mb-3">
                              {communityItem.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <UsersIcon className="h-4 w-4" />
                                {communityItem.members} Members
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoin(communityItem)}
                            className={
                              joinedIds.includes(communityItem.id)
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            }
                          >
                            {joinedIds.includes(communityItem.id) ? (
                              <span className="flex items-center gap-2">
                                <CheckIcon className="w-4 h-4 text-white" />
                                Joined
                              </span>
                            ) : (
                              "Join Communities"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="usercommunity">
                <div className="space-y-4">
                  {userCommunities.length === 0 ? (
                    <CardContent
                      className=" flex
                 mt-4
                  justify-center
                   items-center
                    gap-2
                     text-gray-200 
                     font-semibold"
                    >
                      You haven't joined any community yet 😢
                    </CardContent>
                  ) : (
                    userCommunities.map((usercommunityItem: Community) => (
                      <Card
                        key={usercommunityItem.id}
                        className="bg-gray-900
                   border-gray-800"
                      >
                        <CardContent className="p-6">
                          <div
                            className="flex
                     flex-col
                      md:flex-row 
                      md:items-center
                       md:justify-between 
                       gap-4"
                          >
                            <div className="flex-1">
                              <h3
                                className="text-lg
                         font-semibold
                          text-gray-100 
                         mb-2"
                              >
                                {usercommunityItem.title}
                              </h3>
                              <p className="text-gray-300 mb-3">
                                {usercommunityItem.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <UsersIcon className="h-4 w-4" />
                                  {usercommunityItem.members} Members
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() =>
                                router.push(
                                  `/community/${usercommunityItem.id}`
                                )
                              }
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              View Community
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}