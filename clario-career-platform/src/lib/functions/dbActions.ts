/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/client";
import {
  DBUser,
  DBMentor,
  UserQuizData,
  MentorProfile,
  College,
} from "../types/allTypes";
import { redis } from "@/lib/redis";
import { useNotificationStore } from "../store/NotificationStore";

// Interface for the response structure
interface PaginatedMentors {
  mentors: DBMentor[];
  hasMore: boolean;
  total: number;
  exactMatches: number;
}
export interface MentorVideo {
  id: string;
  video_url: string;
}

const RELATED_CAREERS: Record<string, string[]> = {
  "data scientist": [
    "ml engineer",
    "ai engineer",
    "data analyst",
    "software engineer",
  ],
  "data analyst": ["data scientist", "ai engineer", "ml engineer", "software engineer"],
  "ml engineer": ["data scientist", "ai engineer", "data engineer"],
  "software engineer": [
    "frontend engineer",
    "backend engineer",
    "full stack engineer",
    "backend developer",
    "cloud engineer",
  ],
  "frontend engineer": ["software engineer", "backend engineer"],
  "backend engineer": [
    "software engineer",
    "data engineer",
    "backend developer",
  ],
  "ethical hacker": ["software engineer", "cybersecurity analyst"],
};

export async function getMatchingMentors(
  userMainFocus: string
): Promise<DBMentor[]> {
  const supabase = createClient();

  const focus = userMainFocus.toLowerCase().trim();
  const cacheKey = `mentors:${focus}`;

  const cachedMentors = await redis.get(cacheKey);

  if (cachedMentors) {
    console.log(`---- Mentors HIT from Redis for key---: ${cacheKey}`);
    // Ensure cachedMentors is an array
    if (Array.isArray(cachedMentors)) {
      return cachedMentors as DBMentor[];
    }
    console.warn(
      `Invalid cache data for key: ${cacheKey}, fetching from Supabase`
    );
  } else {
    console.log(`Cache miss for key: ${cacheKey}, querying Supabase`);
  }

  const { data, error } = await supabase
    .from("mentors")
    .select("*")
    .gt("rating", 4)
    .order("rating", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Mentors fetch error:", error);
    return [];
  }

  // 10-minute TTL (600 seconds)
  if (data && data.length > 0) {
    await redis.set(cacheKey, JSON.stringify(data), { ex: 600 });
    console.log("Mentors fetched db, cached in redis");
  }

  return data || [];
}


export async function getAllMentorsPaginated(
  page: number = 1,
  limit: number = 6,
  userCareer: string
): Promise<PaginatedMentors> {
  const supabase = createClient();

  const { data: mentors, error } = await supabase.from("mentors").select("*");

  if (error || !mentors) {
    console.error("Mentors fetch error:", error);
    return { mentors: [], hasMore: false, total: 0, exactMatches: 0 };
  }

  const relatedCareers = RELATED_CAREERS[userCareer.toLowerCase()] || [];

  const scoreMentor = (mentor: DBMentor) => {
    const position = mentor.current_position.toLowerCase();
    const user = userCareer.toLowerCase();

    if (position.includes(user)) return 3;
    if (relatedCareers.some((rc) => position.includes(rc))) return 2;
    return 1;
  };

  const sorted = mentors
    .map((m) => ({ ...m, score: scoreMentor(m) }))
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...rest }) => rest);

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginated = sorted.slice(start, end);
  const hasMore = end < sorted.length;
  const total = sorted.length;

  // ✅ COUNT EXACT MATCHES
  const exactMatches = mentors.filter(
    (m) => m.current_position?.toLowerCase() === userCareer?.toLowerCase()
  ).length;

  return {
    mentors: paginated,
    hasMore,
    total,
    exactMatches,
  };
}


export async function getRandomUsersByInstitution(
  institutionName: string,
  currentUserId: number
): Promise<DBUser[]> {
  const supabase = createClient();

  // fetch users from same institution
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("institutionName", institutionName)
    .neq("id", currentUserId)
    .limit(10);

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }

  if (!data) return [];

  // shuffle + take 5
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

export async function getRandomUsersByCareer(
  career: string,
  currentUserId: any
): Promise<UserQuizData[]> {
  const supabase = createClient();

  console.log("🎓 Career:", career);

  const { data, error } = await supabase
    .from("userQuizData")
    .select("*")
    .eq("selectedCareer", career)
    .neq("userId", currentUserId)
    .limit(20);

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }

  // console.log("🎓 Randomly selected users:", data);

  if (!data) return [];

  const shuffled = data.sort(() => Math.random() - 0.5);
  // console.log("🎓 Randomly selected users:", shuffled);
  return shuffled.slice(0, 10);
}

export async function getUserQuizData(userId: any): Promise<UserQuizData[]> {
  const supabase = createClient();
  const cacheKey = `quizdata:${userId}`; // create a unique key based on the user ID

  try {
    const cached = await redis.get<UserQuizData[]>(cacheKey);
    if (cached) {
      console.log(`✅ Quiz data Hit in Redis for user: ${userId}`);
      return cached;
    }

    console.log(`❌ Cache miss for user: ${userId}, querying Supabase...`);

    const { data, error } = await supabase
      .from("userQuizData")
      .select("*")
      .eq("userId", userId);

    if (error) {
      console.error("Error fetching quiz data:", error);
      return [];
    }

    const quizData = (data || []) as UserQuizData[];

    if (quizData.length > 0) {
      await redis.set(cacheKey, quizData, { ex: 600 });
      console.log(`✅ Quiz data cached in Redis for user: ${userId}`);
    }

    return quizData;
  } catch (err) {
    console.error(`Redis/Supabase error for user ${userId}:`, err);
    return [];
  }
}

// export async function clearMentorCache(focus: string) {
//   const cacheKey = `mentors:${focus.toLowerCase().trim()}`;
//   try {
//     await redis.del(cacheKey);
//     console.log(`✅ Redis cache cleared for key: ${cacheKey}`);
//   } catch (error) {
//     console.error(`❌ Failed to clear Redis cache for key: ${cacheKey}`, error);
//   }
// }

export async function getRandomMentorVideos(): Promise<MentorVideo[]> {
  const supabase = createClient();
  const cacheKey = `mentorVideos`;

  const cachedVideos = await redis.get(cacheKey);

  if (cachedVideos) {
    console.log(`----✅ Mentor Videos HIT from Redis for key: ${cacheKey}`);
    try {
      let parsed: MentorVideo[];

      if (typeof cachedVideos === "object" && cachedVideos !== null) {
        parsed = cachedVideos as MentorVideo[];
      } else if (typeof cachedVideos === "string") {
        parsed = JSON.parse(cachedVideos) as MentorVideo[];
      } else {
        throw new Error("Cached data is neither an object nor a string");
      }

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.warn(`❌ Invalid cache data for key: ${cacheKey}`, err);
    }
  } else {
    console.log(`--- Cache miss for mentor videos: ${cacheKey} ---`);
  }

  const { data, error } = await supabase
    .from("mentors")
    .select("id, video_url")
    .not("video_url", "is", null);

  if (error) {
    console.error("Error fetching mentor videos:", error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ No mentor videos found in DB");
    return [];
  }

  // pick 6 random videos
  const shuffled = data.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 6);

  await redis.set(cacheKey, JSON.stringify(selected), { ex: 300 });
  console.log("📦 Mentor videos fetched from DB and cached in Redis");

  return selected;
}

export async function getAllMentorProfiles(): Promise<MentorProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("mentors")
    .select(
      `id, full_name, email, phone, linkedin, bio, expertise, current_position, availability, rating, avatar`
    );

  if (error) {
    console.error("Error fetching mentor profiles:", error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ No mentor profiles found in DB");
    return [];
  }

  return data as MentorProfile[];
}

// export async function getSuggestedCollegeData(
//   userDegrees: string[],
//   userState: string
// ): Promise<College[]> {
//   const supabase = createClient();

//   const normalizedDegrees = userDegrees.map((d) => d.toLowerCase().trim());
//   const normalizedState = userState.toLowerCase().trim();

//   console.log("Normalized degrees:", normalizedDegrees);
//   console.log("User state:", normalizedState);

//   const { data, error } = await supabase
//     .from("colleges")
//     .select("*")
//     .overlaps("best_suit_for", normalizedDegrees)
//     .ilike("location", `%${normalizedState}%`) // filter by state in location
//     .limit(10);

//   if (error) {
//     console.error("Error fetching suggested colleges:", error);
//     return [];
//   }

//   if (!data || data.length === 0) {
//     console.warn("No colleges found for state:", normalizedState);
//     return [];
//   }

//   console.log("✅ Colleges fetched for state:", normalizedState);
//   return data as College[];
// }

// ============================================================
// export async function getSuggestedCollegeData(
//   userDegrees: string[],
//   userState: string
// ): Promise<College[]> {
//   const supabase = createClient();

//   const normalizedDegrees = userDegrees.map((degree) => {
//     return degree.toLowerCase().trim().split(" ")[0];
//   });

//   const normalizedState = userState.toLowerCase().trim();

//   console.log("🎓 Normalized degrees:", normalizedDegrees);
//   console.log("📍 User state:", normalizedState);

//   const { data, error } = await supabase
//     .from("colleges")
//     .select("*")
//     .overlaps("best_suit_for", normalizedDegrees)
//     .ilike("location", `%${normalizedState}%`)
//     .limit(10);

//   if (error) {
//     console.error("❌ Error fetching suggested colleges:", error);
//     return [];
//   }

//   if (!data || data.length === 0) {
//     console.warn("⚠️ No colleges found for state:", normalizedState);
//     return [];
//   }

//   console.log("✅ Colleges fetched for state:", normalizedState);
//   return data as College[];
// }
// =======================================================================

export async function getSuggestedCollegeData(
  userDegrees: string[],
  userState: string
): Promise<College[]> {
  const supabase = createClient();

  const normalizedDegrees = userDegrees.map(
    (degree) => degree.toLowerCase().trim().split(" ")[0]
  );

  const normalizedState = userState.toLowerCase().trim();

  console.log("🎓 Normalized degrees:", normalizedDegrees);
  console.log("📍 User state/city:", normalizedState);

  const { data: colleges, error } = await supabase
    .from("colleges")
    .select("*")
    .overlaps("best_suit_for", normalizedDegrees);

  if (error) {
    console.error("❌ Error fetching suggested colleges:", error);
    return [];
  }

  // console.log("Total colleges from DB:", colleges?.length);

  const filtered = colleges.filter((college) => {
    if (!college.location) return false;

    // console.log("RAW LOCATION:", JSON.stringify(college.location));

    const parts = college.location
      .split(",")
      .map((p: any) => p.toLowerCase().trim());

    // console.log("📍 College location parts:", parts);

    return parts.some(
      (part: any) =>
        part === normalizedState ||
        part.includes(normalizedState) ||
        normalizedState.includes(part)
    );
  });

  if (filtered.length === 0) {
    console.warn(`⚠️ No colleges found for: ${normalizedState}`);
    return [];
  }

  return filtered.slice(0, 10);
}

// 1. GET selectedCareer
export async function getSelectedCareer(userId: any): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("userQuizData")
    .select("selectedCareer")
    .eq("userId", userId)
    .single();

  if (error) {
    console.error("❌ Error fetching selectedCareer:", error);
    return null;
  }

  return data?.selectedCareer || null;
}

// 2. INSERT selectedCareer
export async function insertSelectedCareer(
  userId: any,
  selectedCareer: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("userQuizData")
    .insert([{ userId, selectedCareer }])
    .select("selectedCareer")
    .single();

  if (error) {
    console.error("❌ Error inserting selectedCareer:", error);
    return null;
  }

  return data?.selectedCareer || null;
}

// 3. UPDATE selectedCareer
export async function updateSelectedCareer(
  userId: any,
  selectedCareer: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("userQuizData")
    .update({ selectedCareer })
    .eq("userId", userId)
    .select("selectedCareer")
    .single();

  if (error) {
    console.error("❌ Error updating selectedCareer:", error);
    return null;
  }

  return data?.selectedCareer || null;
}

export async function paginatedColleges(
  page: number = 1,
  limit: number = 6,
  locationQuery?: string | null,
  collegeType?: string | null
): Promise<College[]> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("colleges").select("*");

  if (collegeType) {
    query = query.eq("type", collegeType.toLowerCase());
  }

  if (locationQuery && locationQuery.trim() !== "") {
    query = query.ilike("location", `%${locationQuery.trim()}%`);
  }

  const { data, error } = await query
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Error fetching colleges:", error);
    return [];
  }

  return data as College[];
}

// ---------------------------------------CACHED VERSION MENTORS PAGINATED
// export async function getAllMentorsPaginated(
//   page: number = 1,
//   limit: number = 6
// ): Promise<PaginatedMentors> {
//   const supabase = createClient();
//   const cacheKey = `mentors:page:${page}:limit:${limit}`;
//   const cachedData = await redis.get(cacheKey);

//   if (cachedData) {
//     try {
//       let parsed: PaginatedMentors;

//       // Check if cachedData is already an object (e.g., Redis client auto-parsed)
//       if (typeof cachedData === "object" && cachedData !== null) {
//         parsed = cachedData as PaginatedMentors;
//       } else if (typeof cachedData === "string") {
//         // Parse if it's a string
//         parsed = JSON.parse(cachedData) as PaginatedMentors;
//       } else {
//         throw new Error(
//           "Cached data is neither an object nor a valid JSON string"
//         );
//       }

//       // Validate the parsed data structure
//       if (
//         parsed &&
//         Array.isArray(parsed.mentors) &&
//         typeof parsed.hasMore === "boolean" &&
//         typeof parsed.total === "number"
//       ) {
//         console.log(`--- ✅HIT from Redis for mentors-connect ${cacheKey} ---`);
//         return parsed;
//       }
//       console.warn(`Invalid cache data structure for key: ${cacheKey}`);
//     } catch (err) {
//       console.warn(`Invalid cache data for key: ${cacheKey}`, err);
//     }
//   }

//   console.log(`--- Cache miss for mentors-connect ${cacheKey} ---`);

//   const start = (page - 1) * limit;
//   const end = start + limit - 1;

//   const { data, error, count } = await supabase
//     .from("mentors")
//     .select("*", { count: "exact" })
//     .order("created_at", { ascending: false })
//     .range(start, end);

//   if (error) {
//     console.error("Mentors fetch error:", error);
//     return { mentors: [], hasMore: false, total: 0 };
//   }

//   const hasMore = count !== null ? end + 1 < count : false;
//   const total = count || 0;

//   const result: PaginatedMentors = { mentors: data || [], hasMore, total };

//   await redis.set(cacheKey, JSON.stringify(result), { ex: 600 });
//   console.log(`--- Cached mentors for ${cacheKey} ---`);

//   return result;
// }

// -----------------------------------------------------
// 4. GET all reviews by mentor_id
export async function getReviewsByMentorId(mentorId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("mentor_sessions")
    .select("reviews")
    .eq("mentor_id", mentorId)
    .not("reviews", "is", null);

  if (error) {
    console.error("❌ Error fetching reviews:", error);
    return null;
  }

  return data || [];
}

// NOTIFICATION FROM SESSION BOOKING
export async function triggerSessionNotification({
  userId,
  sessionType,
  mentorName,
  scheduledAt,
}: {
  userId: any;
  sessionType: string;
  mentorName: string;
  scheduledAt: Date;
}) {
  const message = `You have requested a ${sessionType} session with ${mentorName} (status: pending) on ${scheduledAt.toLocaleString()}`;

  useNotificationStore.getState().addNotification({
    userId,
    message,
  });
}
