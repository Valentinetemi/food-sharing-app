"use client";

import { UsersIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/NotificationsContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Community = {
  id: number;
  title: string;
  description: string;
  members: number;
  emoji?: string;
};

export default function CommunityPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState("join");
  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joiningCommunity, setJoiningCommunity] = useState<number | null>(null);

  // Load all communities with real member counts from database
  const loadAllCommunities = async () => {
    try {
      // Get communities from database
      const { data: dbCommunities, error } = await supabase
        .from('communities')
        .select('*')
        .order('id');
      
      if (error) throw error;

      if (dbCommunities) {
        // Get real member counts for each community
        const communitiesWithCounts = await Promise.all(
          dbCommunities.map(async (community) => {
            const { count } = await supabase
              .from('community_members')
              .select('*', { count: 'exact', head: true })
              .eq('community_id', community.id);
            
            return {
              id: community.id,
              title: community.emoji ? `${community.emoji} ${community.title}` : community.title,
              description: community.description || '',
              members: count || 0,
              emoji: community.emoji
            };
          })
        );
        
        setAllCommunities(communitiesWithCounts);
      }
    } catch (error) {
      console.error("Error loading communities:", error);
    }
  };

  // Get current user and load their communities
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await loadUserCommunities(user.id);
      }
      setLoading(false);
    };

    getUser();
    loadAllCommunities();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserCommunities(session.user.id);
      } else {
        setJoinedIds([]);
        setUserCommunities([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserCommunities = async (userId: string) => {
    try {
      // Fetch user's community memberships from database
      const { data: memberships, error } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId);

      if (error) throw error;

      if (memberships && memberships.length > 0) {
        const communityIds = memberships.map((m) => m.community_id);
        setJoinedIds(communityIds);

        // Get full community details with real member counts
        const { data: dbCommunities } = await supabase
          .from('communities')
          .select('*')
          .in('id', communityIds);

        if (dbCommunities) {
          const communitiesWithCounts = await Promise.all(
            dbCommunities.map(async (community) => {
              const { count } = await supabase
                .from('community_members')
                .select('*', { count: 'exact', head: true })
                .eq('community_id', community.id);
              
              return {
                id: community.id,
                title: community.emoji ? `${community.emoji} ${community.title}` : community.title,
                description: community.description || '',
                members: count || 0,
                emoji: community.emoji
              };
            })
          );
          
          setUserCommunities(communitiesWithCounts);
        }
      } else {
        setJoinedIds([]);
        setUserCommunities([]);
      }
    } catch (error) {
      console.error("Error loading user communities:", error);
    }
  };

  const handleJoin = async (community: Community) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to join communities",
        variant: "destructive",
      });
      return;
    }

    if (joinedIds.includes(community.id)) {
      return;
    }

    setJoiningCommunity(community.id);

    try {
      // Insert membership into database
      const { error } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user.id,
        });

      if (error) throw error;

      // Update local state
      setJoinedIds((prev) => [...prev, community.id]);
      
      // Reload communities to get updated member counts
      await loadAllCommunities();
      await loadUserCommunities(user.id);

      toast({
        title: "Community Joined",
        description: `You have joined ${community.title}`,
        duration: 3000,
      });

      addNotification({
        type: "system",
        message: `You have joined the ${community.title} community. Start connecting with other members!`,
      });

      setActiveTab("usercommunity");
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast({
        title: "Error",
        description: "Failed to join community: " + error.message,
        variant: "destructive",
      });
    } finally {
      setJoiningCommunity(null);
    }
  };

  const handleLeave = async (communityId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;

      setJoinedIds((prev) => prev.filter((id) => id !== communityId));
      setUserCommunities((prev) => prev.filter((c) => c.id !== communityId));

      // Reload to update member counts
      await loadAllCommunities();

      toast({
        title: "Left Community",
        description: "You have left the community",
      });
    } catch (error: any) {
      console.error("Error leaving community:", error);
      toast({
        title: "Error",
        description: "Failed to leave community: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto px-4 py-6 pb-20 lg:pb-6 mobile-content-padding">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 mb-8"
          >
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient"
              >
                Community
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-lg"
              >
                Connect, grow, and share with others who love food just like you.
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <TabsList className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700 flex flex-col sm:flex-row w-full h-auto flex-wrap gap-4 p-4 shadow-xl">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <TabsTrigger
                      value="join"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white w-full sm:w-auto transition-all duration-200"
                    >
                      Join Communities
                    </TabsTrigger>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <TabsTrigger
                      value="usercommunity"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white w-full sm:w-auto transition-all duration-200"
                    >
                      Your Communities ({userCommunities.length})
                    </TabsTrigger>
                  </motion.div>
                </TabsList>
              </motion.div>

              <TabsContent value="join">
                <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <AnimatePresence>
                    {allCommunities.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 mt-4">Loading communities...</p>
                      </motion.div>
                    ) : (
                      allCommunities.map((communityItem: Community, index: number) => (
                        <motion.div
                          key={communityItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                                    {communityItem.title}
                                  </h3>
                                  <p className="text-gray-300 mb-3">{communityItem.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <UsersIcon className="h-4 w-4" />
                                      {communityItem.members} Members
                                    </div>
                                  </div>
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    onClick={() => handleJoin(communityItem)}
                                    disabled={joinedIds.includes(communityItem.id) || joiningCommunity === communityItem.id}
                                    className={
                                      joinedIds.includes(communityItem.id)
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                                    }
                                  >
                                    {joiningCommunity === communityItem.id ? (
                                      <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Joining...
                                      </span>
                                    ) : joinedIds.includes(communityItem.id) ? (
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
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>

              <TabsContent value="usercommunity">
                <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <AnimatePresence>
                    {userCommunities.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-xl">
                          <CardContent className="flex mt-4 justify-center items-center gap-2 text-gray-200 font-semibold py-12">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 }}
                              className="text-center"
                            >
                              <div className="text-6xl mb-4">😢</div>
                              <p>You haven't joined any community yet</p>
                              <p className="text-sm text-gray-400 mt-2">
                                Join communities to start connecting with other food lovers!
                              </p>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ) : (
                      userCommunities.map((usercommunityItem: Community, index: number) => (
                        <motion.div
                          key={usercommunityItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                                    {usercommunityItem.title}
                                  </h3>
                                  <p className="text-gray-300 mb-3">{usercommunityItem.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <UsersIcon className="h-4 w-4" />
                                      {usercommunityItem.members} Members
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      onClick={() => router.push(`/community/${usercommunityItem.id}`)}
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                                    >
                                      View Community
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      onClick={() => handleLeave(usercommunityItem.id)}
                                      variant="outline"
                                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                      Leave
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
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