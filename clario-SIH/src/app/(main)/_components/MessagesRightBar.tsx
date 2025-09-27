"use client";
import { useUserData } from "@/context/UserDataProvider";
import { getRandomUsersByInstitution } from "@/lib/functions/dbActions";
import { createClient } from "@/lib/supabase/client";
import { DBUser } from "@/lib/types/allTypes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import MessageNamesList from "../home/test/showchats/page";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  receiver_type: "peer" | "mentor";
  content: string;
  created_at: string;
};

const MessagesRightBar = () => {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading } = useUserData();
  const [discoverUsers, setDiscoverUsers] = useState<DBUser[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  // DISCOVER USERS FROM SAME INSTITUTION---------------------------
  useEffect(() => {
    if (!user || !user.institutionName) return;
    if (discoverUsers.length > 0) return;

    setDiscoverLoading(true);
    getRandomUsersByInstitution(user.institutionName, user.id)
      .then((data) => setDiscoverUsers(data))
      .finally(() => setDiscoverLoading(false));
  }, [user]);

  // ------------------------------------------------------

  return (
    <div className="h-full flex flex-col gap-5 w-[30%]">
      <div className="bg-white w-full p-2 rounded-lg h-[70%] overflow-y-scroll border shadow">
        <p className="font-medium text-xl text-center tracking-tight font-inter mb-4">
          Previous Chats
        </p>

        <MessageNamesList />
      </div>
      <div className="bg-gradient-to-tl from-white to-blue-200 w-full p-2 rounded-lg h-full border shadow">
        <p className="font-medium text-xl text-center tracking-tight font-inter">
          Discover Users
        </p>
        <p className="text-sm text-center tracking-tight font-inter mt-1 mb-3 text-muted-foreground">
          discover others from same institution
        </p>
        <div>
          {discoverUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No users found
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {discoverUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between  p-2 "
                >
                  {/* Left: avatar + details */}
                  <div className="flex items-center gap-3">
                    <Image
                      src={u.avatar || "/user.png"}
                      alt={u.userName}
                      width={35}
                      height={35}
                      className=" rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm tracking-tight font-inter">
                        {u.userName}
                      </p>
                      <p className="text-sm text-muted-foreground font-inter max-w-[120px] truncate">
                        {u.institutionName}
                      </p>
                    </div>
                  </div>

                  {/* Right: message button */}
                  <button
                    onClick={() => router.push(`/home/messages/peer/${u.id}`)}
                    className="px-3 py-1 text-xs tracking-tight font-inter bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition"
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesRightBar;
