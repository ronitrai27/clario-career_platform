import { create } from "zustand";
import { createClient } from "../supabase/client";

const supabase = createClient();

export type Notification = {
  id?: number;
  userId: any;
  message: string;
  created_at?: string;
};

type NotificationStore = {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  fetchNotifications: (userId: any) => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    // Update local state immediately
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));

    // Async save to Supabase (fire-and-forget)
    (async () => {
      const { error } = await supabase.from("notification").insert([notification]);
      if (error) console.error("Failed to save notification:", error);
    })();
  },

  fetchNotifications: async (userId) => {
    const { data, error } = await supabase
      .from("notification")
      .select("*")
      .eq("userId", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch notifications:", error);
      return;
    }

    set({ notifications: data || [] });
  },
}));
