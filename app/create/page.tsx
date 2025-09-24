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
import { usePosts } from "@/context/PostsContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAuth } from "firebase/auth";

//get name and email from firebase
const auth = getAuth();

// Animation variants for smooth transitions
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

export default function CreatePostPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [foodName, setFoodName] = useState("");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("");
  const [calories, setCalories] = useState<number>(0);
  const [isSharing, setIsSharing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<any[]>([]);

  // Get the addPost function from context
  const { addPost } = usePosts();
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      const currentUser = auth.currentUser;
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts.", error.message);
        return;
      }

      if (data) {
        const uiPost = data.map((dbPost) =>
          mapDbPostToUiPost(dbPost, currentUser)
        );
        setPosts(uiPost);
      }
    };
    fetchPost();
  }, []);

  // Function to save draft to localStorage
  const saveDraft = () => {
    const draft = {
      foodName,
      description,
      mealType,
      calories,
      tags,
      imageDataUrl: selectedImage,
    };

    localStorage.setItem("foodShareDraft", JSON.stringify(draft));
    alert("Draft saved successfully!");
  };

  // Load draft from localStorage on component mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem("foodShareDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFoodName(draft.foodName || "");
        setDescription(draft.description || "");
        setMealType(draft.mealType || "");
        setCalories(draft.calories || 0);
        setTags(draft.tags || []);
        setSelectedImage(draft.imageDataUrl || null);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedImage) {
      newErrors.image = "Please upload a food photo.";
    }
    if (!foodName.trim()) {
      newErrors.foodName = "Food name is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required.";
    }
    if (calories <= 0) {
      newErrors.calories =
        "Please select at least one food item for calorie information.";
    }
    if (!mealType) {
      newErrors.mealType = "Please select a meal type.";
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
    setTags([]);
    setNewTag("");
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Clear the draft from localStorage
    localStorage.removeItem("foodShareDraft");
  };

  // Generate an initial avatar (SVG data URL) from user's display name
  const getInitialAvatar = (name: string) => {
    if (!name || name === "Anonymous") {
      return "/default.png";
    }

    const firstLetter = name.trim().charAt(0).toUpperCase();

    const colors = [
      "#F87171",
      "#FB923C",
      "#FBBF24",
      "#A3E635",
      "#34D399",
      "#22D3EE",
      "#60A5FA",
      "#A78BFA",
      "#F472B6",
    ];
    const colorIndex = firstLetter.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="${bgColor}" />
        <text x="50" y="50" font-family="Arial" font-size="50" fill="white" text-anchor="middle" dominant-baseline="central">
          ${firstLetter}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  function mapDbPostToUiPost(dbPost: any, currentUser: any) {
    const userName = currentUser?.displayName || "Anonymous";
    return {
      id: dbPost.id,
      title: dbPost.title,
      description: dbPost.caption,
      imageUrl: dbPost.image_url,
      calories: dbPost.calories,
      tags: dbPost.tags ? dbPost.tags.split(",") : [],
      mealType: dbPost.mealtype,
      user: {
        name: currentUser?.displayName || "Anonymous",
        username: currentUser?.email || "example@gmail.com",
        avatar: currentUser?.photoURL || getInitialAvatar(userName),
      },
    };
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      setIsSharing(true);
      const currentUser = auth.currentUser;

      // For now, use a placeholder image URL since imageUrl is not defined
      const imageUrl = selectedImage || "/placeholder-food.jpg";

      const supabasePost = {
        firebase_uid: currentUser?.uid || "anonymous", // Use actual user ID from firebase
        caption: description,
        image_url: imageUrl,
        calories: calories,
        title: foodName,
        tags: tags.join(","),
        mealtype: mealType,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([supabasePost])
        .select();

      if (!error && data) {
        const dbPost = data[0];
        const userName = currentUser?.displayName || "Anonymous";

        addPost({
          id: dbPost.id, // Preserve Supabase UUID for likes/comments
          title: dbPost.title,
          description: dbPost.caption,
          image: dbPost.image_url,
          calories: dbPost.calories,
          tags: dbPost.tags ? dbPost.tags.split(",") : [],
          user: {
            name: currentUser?.displayName || "Anonymous",
            username: currentUser?.email || "example@gmail.com",
            avatar: currentUser?.photoURL || getInitialAvatar(userName),
          },
        });

        // Show success message
        setTimeout(() => {
          alert("Post shared successfully!");
          setIsSharing(false);
          resetForm();
          router.push("/");
        }, 1500);
      } else {
        alert("Error creating post: " + error?.message);
        setIsSharing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div
        className="
      .flex-1 ml-0 lg:ml-64"
      >
        <div className="max-w-2xl mx-auto px-4 py-6 pb-20 lg:pb-6 mobile-content-padding">
          {/* Header */}
          <motion.div
            {...fadeInUp}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                Share Your Food
              </h1>
              <p className="text-gray-400">
                Show the community what you're eating!
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-gray-400">
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
            {/* Image Upload */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">Food Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedImage ? (
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center relative">
                      <CameraIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">
                        Upload a photo of your food
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-orange-500 to-red-500"
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
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Selected food"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Food Details */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-gray-900 border-gray-800">
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
                      className="bg-gray-800 border-gray-700 text-gray-100"
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
                      className="bg-gray-800 border-gray-700 text-gray-100 min-h-[100px]"
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
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
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

            {/* Calorie Dropdown */}
            <motion.div variants={fadeInUp}>
              <CalorieDropdown onCalorieChange={setCalories} />
              {errors.calories && (
                <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
              )}
            </motion.div>

            {/* Tags */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-100">Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="bg-gray-800 border-gray-700 text-gray-100"
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button
                      onClick={addTag}
                      size="icon"
                      variant="outline"
                      className="border-gray-700 bg-transparent"
                      type="button" // Important to prevent form submission
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

            {/* Submit */}
            <motion.div variants={fadeInUp} className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
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
                className="background-gray-700 text-gray-300 bg-transparent"
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
