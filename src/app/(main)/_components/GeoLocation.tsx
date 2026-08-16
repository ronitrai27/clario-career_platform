"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";

export default function GetUserLocation() {
  const { user } = useUserData();

  useEffect(() => {
    if (!user?.id) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          console.log("User coordinates:", lat, lon);

          // Save in Supabase
          const supabase = createClient();
          const { error } = await supabase
            .from("users")
            .update({ latitude: lat, longitude: lon })
            .eq("id", user.id);

          if (error) {
            console.error("Error updating user location:", error.message || error);
          }
        },
        (error) => {
          console.error("Location permission denied/error:", error.message || error);
        }
      );
    } else {
      console.error("Geolocation not supported by this browser");
    }
  }, [user?.id]);

  return null;
}
