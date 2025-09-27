/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useUserData } from "@/context/UserDataProvider";

type Profile = {
  id: any;
  name: string;
  email: string;
  avatar?: string | null;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  receiver_type: "peer" | "mentor";
  content: string;
  created_at: string;
};

const MessagesId = () => {
  const params = useParams();
  const supabase = createClient();
  const { user } = useUserData();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const profileType = params.type === "peer" ? "peer" : "mentor";
  const profileId = params.id;

  useEffect(() => {
    if (!params?.type || !params?.id) return;

    const fetchProfile = async () => {
      setLoading(true);

      if (params.type === "peer") {
        // Fetch from users table
        const { data, error } = await supabase
          .from("users")
          .select(" id, userName, userEmail, avatar")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        } else {
          setProfile({
            id: data.id.toString(),
            name: data.userName,
            email: data.userEmail,
            avatar: data.avatar,
          });
        }
      } else {
        // Fetch from mentors table
        const { data, error } = await supabase
          .from("mentors")
          .select("id, full_name, email, avatar")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching mentor profile:", error);
          setProfile(null);
        } else {
          setProfile({
            id: data.id,
            name: data.full_name,
            email: data.email,
            avatar: data.avatar,
          });
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [params]);

  useEffect(() => {
  if (!profileId || !profileType || !user?.id) return;

  //Fetch existing messages (keep your existing logic)
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${profileId},receiver_type.eq.${profileType}),` +
        `and(sender_id.eq.${profileId},receiver_id.eq.${user.id},receiver_type.eq.${profileType})`
      )
      .order("created_at", { ascending: true });

    if (error) console.error("Fetch error:", error);
    else setMessages(data || []);
  };

  fetchMessages();

  // Realtime subscription — subscribe to all inserts in messages table
  const subscription = supabase
    .channel("messages") 
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const newMessage = payload.new as Message;

        // Only add if it belongs to this conversation
        if (
          (newMessage.sender_id === String(user.id) && newMessage.receiver_id === profileId) ||
          (newMessage.sender_id === profileId && newMessage.receiver_id === String(user.id))
        ) {
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(subscription);
  };
}, [profileId, profileType, user?.id]);


  const sendMessage = async () => {
    if (!text.trim() || !user?.id || !profileId || !profileType) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: profileId,
      receiver_type: profileType,
      content: text,
    });

    if (error) {
      console.error("Send error:", error);
    } else {
      setText(""); 
    }
  };

  return (
    <div className="w-full bg-white border rounded-md h-full overflow-hidden">
      {/* Profile Header */}
      <div className="flex items-center gap-3 mb-5 bg-blue-500 py-2 px-6">
        <Image
          src={profile?.avatar || "/user.png"}
          alt={profile?.name || "User"}
          width={100}
          height={100}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-xl text-white font-inter">
            {profile?.name}
          </p>
          <p className="text-base text-gray-200 font-sora">{profile?.email}</p>
        </div>
      </div>
      <p className="text-muted-foreground text-base font-inter px-6 my-2">
        Keep the conversation formal and professional. Any inappropriate
        messages will be Reported.
      </p>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-blue-50 h-[470px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xl font-sora">
            No old messages found
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender_id === String(user?.id)
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-[60%] font-raleway text-base ${
                  m.sender_id === String(user?.id)
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex border-t p-3 gap-2 ">
        <Input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-blue-100"
        />
        <Button onClick={sendMessage}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default MessagesId;
