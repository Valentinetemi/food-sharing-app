"use client";

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
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-hidden bg-gray-950"
    >
      <div className="pointer-events-none absolute -top-56 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-[-10%] h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-10%] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative z-10 flex-1 ml-0 lg:ml-64">
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="
              text-4xl
              font-bold
              bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient
            "
              >
                Community
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-lg"
              >
                Connect, grow, and share with others who love food just like
                you.
              </motion.p>
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
          </motion.div>

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
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-3"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <TabsList
                  className="
                bg-gradient-to-r from-gray-900 to-gray-800
                border-gray-700
                flex flex-col sm:flex-row
                w-full
                h-auto
                flex-wrap
                gap-4           
               p-4
               shadow-xl
              "
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TabsTrigger
                      value="join"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white w-full sm:w-auto transition-all duration-200"
                    >
                      Join Communities
                    </TabsTrigger>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TabsTrigger
                      value="usercommunity"
                      className="
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white
                w-full sm:w-auto
                transition-all duration-200
                "
                    >
                      Your Communities
                    </TabsTrigger>
                  </motion.div>
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
              </motion.div>

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
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <AnimatePresence>
                    {communityList.map(
                      (communityItem: Community, index: number) => (
                        <motion.div
                          key={communityItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                       border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
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
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => handleJoin(communityItem)}
                                    className={
                                      joinedIds.includes(communityItem.id)
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                                    }
                                  >
                                    {joinedIds.includes(communityItem.id) ? (
                                      <span className="flex items-center gap-2">
                                        <CheckIcon className="w-4 h-4 text-white" />
                                        Joined
                                      </span>
                                    ) : (
                                      "Join Community"
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>

              <TabsContent value="usercommunity">
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <AnimatePresence>
                    {userCommunities.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-xl">
                          <CardContent
                            className="flex
                           mt-4
                            justify-center
                             items-center
                              gap-2
                               text-gray-200 
                               font-semibold py-12"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 }}
                              className="text-center"
                            >
                              <div className="text-6xl mb-4">😢</div>
                              <p>You haven't joined any community yet</p>
                              <p className="text-sm text-gray-400 mt-2">
                                Join communities to start connecting with other
                                food lovers!
                              </p>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ) : (
                      userCommunities.map(
                        (usercommunityItem: Community, index: number) => (
                          <motion.div
                            key={usercommunityItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                       border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
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
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      onClick={() =>
                                        router.push(
                                          `/community/${usercommunityItem.id}`
                                        )
                                      }
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                                    >
                                      View Community
                                    </Button>
                                  </motion.div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      )
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
