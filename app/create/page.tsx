"use client";

import React, { useState, useRef, FormEvent, useEffect } from "react";
import {
  CameraIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import CalorieDropdown from "@/components/ui/CalorieDropdown";
import { motion, AnimatePresence } from "framer-motion";
import { usePosts } from "@/components/ui/PostsContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "sweet"
  | "dessert"
  | "";

interface Community {
  id: number;
  title: string;
  description: string;
  emoji?: string;
}

// Fixed avatar generator using UI Avatars API
const getInitialAvatar = (name: string): string => {
  if (!name || name === "Anonymous") {
    return "https://ui-avatars.com/api/?name=Anonymous&background=6B7280&color=fff&size=100";
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=100`;
};

export default function CreatePostPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [foodName, setFoodName] = useState("");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("");
  const [calories, setCalories] = useState<number>(0);
  const [communityId, setCommunityId] = useState<string>("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPost } = usePosts();
  const router = useRouter();

  // Load communities from Supabase
  useEffect(() => {
    const loadCommunities = async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('title', { ascending: true });
      
      if (data) {
        setCommunities(data);
      }
      if (error) {
        console.error('Error loading communities:', error);
      }
    };
    
    loadCommunities();
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      foodName,
      description,
      mealType,
      calories,
      tags,
      communityId,
      imageDataUrl: selectedImage,
    };
    localStorage.setItem("foodShareDraft", JSON.stringify(draft));
    alert("Draft saved successfully!");
  };

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("foodShareDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFoodName(draft.foodName || "");
        setDescription(draft.description || "");
        setMealType(draft.mealType || "");
        setCalories(draft.calories || 0);
        setTags(draft.tags || []);
        setCommunityId(draft.communityId || "");
        setSelectedImage(draft.imageDataUrl || null);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Check auth state with Supabase
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || "Anonymous",
        });
      } else {
        setCurrentUser(null);
        router.push("/login");
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.full_name || "Anonymous",
          });
          setIsLoading(false);
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          router.push("/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!imageFile) {
      newErrors.image = "Please upload a food photo.";
    }
    if (!foodName.trim()) {
      newErrors.foodName = "Food name is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required.";
    }
    if (calories <= 0) {
      newErrors.calories = "Please select at least one food item for calorie information.";
    }
    if (!mealType) {
      newErrors.mealType = "Please select a meal type.";
    }
    if (!communityId) {
      newErrors.communityId = "Please select a community.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImageFile(null);
    setFoodName("");
    setDescription("");
    setMealType("");
    setCalories(0);
    setCommunityId("");
    setTags([]);
    setNewTag("");
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    localStorage.removeItem("foodShareDraft");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
  
    setIsSharing(true);
  
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Not logged in. Please sign in first.");
      }
  
      // Check if profile exists, if not create one with proper avatar
      let { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
  
      if (!existingProfile) {
        const displayName =
          user.user_metadata.full_name ||
          user.email?.split("@")[0] ||
          "Anonymous";
        const baseUsername = user.email?.split("@")?.[0] || "user";
        
        // Generate avatar URL using the API
        const avatarUrl = getInitialAvatar(displayName);
        
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            name: displayName,
            username: baseUsername,
            avatar: avatarUrl,
            email: user.email || "",
          })
          .select()
          .single();
  
        if (insertError) {
          throw new Error("Failed to create profile: " + insertError.message);
        }
  
        existingProfile = newProfile;
      } else if (!existingProfile.avatar || existingProfile.avatar === "/default.png") {
        // Update existing profile with proper avatar if it's missing or using old default
        const avatarUrl = getInitialAvatar(existingProfile.name || "Anonymous");
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar: avatarUrl })
          .eq("id", user.id);
        
        if (!updateError) {
          existingProfile.avatar = avatarUrl;
        }
      }
    
      // Upload image to Supabase Storage
      let imageUrl = "";
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(fileName, imageFile);
  
        if (uploadError) {
          throw new Error("Failed to upload image: " + uploadError.message);
        }
  
        const { data: publicUrlData } = supabase.storage
          .from("food-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
  
      const supabasePost = {
        title: foodName,
        caption: description,
        image_url: imageUrl,
        calories: calories,
        tags: tags.join(","),
        mealtype: mealType,
        community_id: parseInt(communityId),
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
  
      const { data, error } = await supabase
        .from("posts")
        .insert([supabasePost])
        .select();
  
      if (error) {
        throw error;
      }
  
      if (data && data.length > 0) {
        const dbPost = data[0];
  
        addPost({
          id: dbPost.id,
          title: dbPost.title,
          caption: dbPost.caption,
          image_url: dbPost.image_url,
          calories: dbPost.calories,
          tags: dbPost.tags ? dbPost.tags.split(",") : [],
          mealtype: dbPost.mealtype,
          created_at: dbPost.created_at,
          user: {
            id: existingProfile.id,
            name: existingProfile.name || "Anonymous",
            username: existingProfile.username || `user_${existingProfile.id.slice(0, 8)}`,
            avatar: existingProfile.avatar,
            created_at: existingProfile.created_at,
          },
        });
  
        setTimeout(() => {
          alert("Post shared successfully!");
          setIsSharing(false);
          resetForm();
          router.push(`/community/${communityId}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error creating post:", err);
      alert("Error creating post: " + err.message);
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex-1 ml-0 lg:ml-64">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-20 lg:pb-6 mobile-content-padding">
          <motion.div
            {...fadeInUp}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
                Share Your Food
              </h1>
              <p className="text-gray-400">
                Show the community what you're eating!
              </p>
            </div>
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-gray-900 border-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-100">Food Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedImage ? (
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center relative hover:border-gray-600 transition-colors">
                      <CameraIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">
                        Upload a photo of your food
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          asChild
                          className="bg-orange-600 hover:bg-orange-700 shadow-md"
                        >
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer"
                          >
                            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                            Choose photo
                          </label>
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </div>
                      {errors.image && (
                        <p className="text-red-500 text-sm absolute -bottom-6 left-0 right-0">
                          {errors.image}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Selected food"
                        className="w-full aspect-square object-cover rounded-xl hover:scale-[1.01] transition-transform duration-300"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 bg-zinc-800/80 text-white hover:bg-zinc-800"
                        onClick={removeImage}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-gray-900 border-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-100">Choose Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="community" className="text-gray-200">
                    Which community would you like to share this in?
                  </Label>
                  <Select
                    value={communityId}
                    onValueChange={(value: string) => setCommunityId(value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition mt-2">
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      {communities.map((community) => (
                        <SelectItem key={community.id} value={community.id.toString()}>
                          {community.emoji && `${community.emoji} `}{community.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.communityId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.communityId}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-gray-900 border-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-100">Food Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="food-name" className="text-gray-200">
                      Food Name
                    </Label>
                    <Input
                      id="food-name"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      placeholder="e.g., Grilled Salmon with Vegetables"
                      className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition"
                    />
                    {errors.foodName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.foodName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-200">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us about your meal, ingredients, cooking method..."
                      className="bg-gray-800 border-gray-700 text-gray-100 min-h-[100px] focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="meal-type" className="text-gray-200">
                      Meal Type
                    </Label>
                    <Select
                      value={mealType}
                      onValueChange={(value: MealType) => setMealType(value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                        <SelectItem value="sweet">Sweet</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.mealType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mealType}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <CalorieDropdown onCalorieChange={setCalories} />
              {errors.calories && (
                <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
              )}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 border-gray-800/70 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-gray-100">Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="bg-gray-800/80 border-gray-700 text-gray-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      onClick={addTag}
                      size="icon"
                      variant="outline"
                      className="border-gray-700 bg-transparent hover:bg-white/5"
                      type="button"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <AnimatePresence>
                      <motion.div
                        className="flex flex-wrap gap-2"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {tags.map((tag) => (
                          <motion.div key={tag} variants={fadeInUp}>
                            <Badge
                              variant="secondary"
                              className="bg-blue-900/30 text-blue-400 border-blue-800"
                            >
                              #{tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-blue-300"
                                aria-label={`Remove tag ${tag}`}
                                type="button"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                disabled={isSharing}
              >
                {isSharing ? (
                  <>
                    <CheckIcon className="h-4 w-4 animate-pulse mr-2" />
                    Sharing...
                  </>
                ) : (
                  "Share with Community"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-700 text-gray-300 hover:bg-gray-600"
                onClick={saveDraft}
              >
                Save Draft
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}