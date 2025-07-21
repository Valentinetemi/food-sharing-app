"use client"

import React from "react"

import { useState } from "react"
import { Camera, Upload, Search, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function CreatePostPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [calories, setCalories] = useState("")
  const [foodName, setFoodName] = useState("")
  const [description, setDescription] = useState("");

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}



Button.displayName = "Button";

  async function handleShare() {
    if (!foodName || !description || !calories) {
      alert("Please fill all fields! ");
      return;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {"Content-Type" : "application/json" },
      body: JSON.stringify({foodName, description, calories}),
    });

    if (res.ok) {
      const newPost = await res.json();
      console.log("Post shared successfully: ", newPost);
      alert("Shared Successfully! ");
      //optional clear the form
      setFoodName("");
      setDescription("");
      setCalories("");
    } else{
      alert("Failed to share post.")
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const suggestedFoods = [
    { name: "Grilled Chicken Breast", calories: 165 },
    { name: "Avocado Toast", calories: 320 },
    { name: "Caesar Salad", calories: 280 },
    { name: "Salmon Fillet", calories: 206 },
    { name: "Greek Yogurt Bowl", calories: 150 },
    {name: "Fried Egg(1 large)", calories: 90},
    {name: "Pork Chop(100g)", calories: 250 },
    {name: "Salmon Fillet(100g)", calories: 206},
    {name: "Tuna(canned in water 100g)", calories: 132}
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Share Your Food</h1>
            <p className="text-gray-400">Show the community what you're eating!</p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400">
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Food Photo</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedImage ? (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Upload a photo of your food</p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photo
                      </label>
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected food"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Food Details */}
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
              </div>

              <div>
                <Label htmlFor="meal-type" className="text-gray-200">
                  Meal Type
                </Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="Sweet">Sweet</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Calorie Calculator */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Calorie Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Enter calories manually"
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
                <Button variant="outline" className="border-gray-700 text-gray-300 bg-transparent">
                  Calculate
                </Button>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Quick suggestions:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedFoods.map((food) => (
                    <Button
                      key={food.name}
                      variant="ghost"
                      className="justify-between text-gray-300 hover:bg-gray-800"
                      onClick={() => {
                        setFoodName(food.name)
                        setCalories(food.calories.toString())
                      }}
                    >
                      <span>{food.name}</span>
                      <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                        {food.calories} cal
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
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
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} size="icon" variant="outline" className="border-gray-700 bg-transparent">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-800">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-300">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            onClick={() => alert("Post Shared Successfully!")}>
              Share with Community
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 bg-transparent">
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
