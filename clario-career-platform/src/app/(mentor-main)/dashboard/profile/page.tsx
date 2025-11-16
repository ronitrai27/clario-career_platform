/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useUserData } from "@/context/UserDataProvider";

export default function MentorAvatar() {
  const { mentor } = useUserData();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(mentor?.avatar || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${mentor?.id}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update local state for instant preview
      setAvatarUrl(publicUrl);

      // Update DBMentor record with avatar url
      const { error: dbError } = await supabase
        .from("mentors")
        .update({ avatar: publicUrl })
        .eq("id", mentor?.id);

      if (dbError) throw dbError;

      alert("Avatar updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={avatarUrl || "/user.png"}
        alt="Avatar"
        width={100}
        height={100}
        className="w-32 h-32 rounded-full object-cover"
      />
      <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded">
        {uploading ? "Uploading..." : "Upload Avatar"}
        <input type="file" hidden accept="image/*" onChange={handleUpload} />
      </label>
    </div>
  );
}
