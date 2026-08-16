/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { useRouter } from "next/navigation";
import { Ghost } from "lucide-react";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  receiver_type: "peer" | "mentor";
  content: string;
  created_at: string;
};

type UserDisplay = {
  id: string;
  name: string;
  avatar: string | null;
  type: "peer" | "mentor";
};

const MessageNamesList: React.FC = () => {
  const { user, loading: userLoading } = useUserData();
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;

    const fetchMessageNames = async () => {
      const supabase = createClient();

      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
        return;
      }

      if (!messages || messages.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const peerIds = new Set<string>();
      const mentorIds = new Set<string>();

      messages.forEach((msg) => {
        if (msg.sender_id !== user.id) {
          msg.receiver_type === "peer"
            ? peerIds.add(msg.sender_id)
            : mentorIds.add(msg.sender_id);
        }
        if (msg.receiver_id !== user.id) {
          msg.receiver_type === "peer"
            ? peerIds.add(msg.receiver_id)
            : mentorIds.add(msg.receiver_id);
        }
      });

      // Fetch peers
      const { data: peers } = await supabase
        .from("users")
        .select("id, userName, avatar")
        .in("id", Array.from(peerIds));

      // Fetch mentors
      const { data: mentors } = await supabase
        .from("mentors")
        .select("id, full_name, avatar")
        .in("id", Array.from(mentorIds));

      // Combine and assign type dynamically
      const allUsers: UserDisplay[] = [
        ...(peers?.map((p) => ({
          id: p.id,
          name: p.userName,
          avatar: p.avatar,
          type: "peer" as const, 
        })) || []),
        ...(mentors?.map((m) => ({
          id: m.id,
          name: m.full_name,
          avatar: m.avatar,
          type: "mentor" as const, 
        })) || []),
      ];

      setUsers(allUsers);
      setLoading(false);
    };

    fetchMessageNames();
  }, [user?.id]);

  if (userLoading || loading) return (
    <div className="flex items-center justify-center h-full">
     <p className="font-inter text-lg">Loading...</p>
    </div>
  )
  if (users.length === 0)
    return (
      <div className="flex flex-col items-center justify-center -mt-20 h-full text-gray-500">
        <Ghost className="" size={50} />
        <p className="text-base font-inter mt-3">No messages yet...</p>
      </div>
    );

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex flex-col gap-1 bg-gray-50 rounded-md p-2"
             onClick={() => router.push(`/home/messages/${u.type}/${u.id}`)}
          >
            <div
              className="flex items-center gap-3 cursor-pointer "
              onClick={() => router.push(`/home/messages/${u.type}/${u.id}`)}
            >
              <Image
                src={u.avatar || "/user.png"}
                alt={u.name}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
              <span className="font-medium font-sora text-sm ">{u.name}</span>
            </div>
            <span className="text-sm ml-12 -mt-3 text-muted-foreground font-inter cursor-pointer ">
              Click to respond back
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageNamesList;
