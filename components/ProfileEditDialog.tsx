"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/app/firebase/config"; // Import Firebase auth
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  name: string | null;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
  profile: UserProfile | null;
}

export function ProfileEditDialog({ open, onOpenChange, onProfileUpdated, profile }: ProfileEditDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync name with profile changes
  useEffect(() => {
    setName(profile?.name || "User");
    setError(null);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError("User or profile not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use auth.currentUser for Firebase updateProfile
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error("No authenticated Firebase user");
      }
      await updateProfile(firebaseUser, { displayName: name });

      // Update Supabase users table
      const { error: supabaseError } = await supabase
        .from("users")
        .update({ name })
        .eq("firebase_uid", user.id); // user.id is correct per your User type

      if (supabaseError) {
        throw supabaseError;
      }

      onProfileUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter your name"
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-gray-300"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}