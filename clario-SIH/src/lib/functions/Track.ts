// helpers/tracks.ts
import { createClient } from "@/lib/supabase/client";

export const extractCheckpoints = (roadmap_data: any) => {
  if (!roadmap_data?.initialNodes?.length) return [];

  // Simple sequence = array order (good enough for now)
  return roadmap_data.initialNodes.map((node: any, idx: number) => ({
    checkpoint_order: idx + 1,
    title: node?.data?.title ?? `Checkpoint ${idx + 1}`,
    description: node?.data?.description ?? "",
    skills: [],                // will be filled after AI
    topics_covered: [],        // will be filled after AI
    isMockDone: false,         // locked until user passes mock
    subtopics: [],             // will be filled after AI + YT API
  }));
};

/**
 * Ensure a tracks row exists for (roadmap_id, user_id).
 * If not, create it with the extracted checkpoints.
 * Returns the created/found RoadmapTrack and the first checkpoint.
 */
export const getOrCreateRoadmapTrack = async (
  roadmapRow: { id: number; user_id: string; roadmap_data: any },
) => {
  const supabase = createClient();

  // 1) Try to find existing tracks row
  const { data: existing, error: findErr } = await supabase
    .from("tracks")
    .select("*")
    .eq("roadmap_id", roadmapRow.id)
    .eq("user_id", roadmapRow.user_id)
    .limit(1)
    .maybeSingle();

  if (findErr) throw findErr;

  if (existing) {
    // Return what we have + first checkpoint
    const first = existing.checkpoints?.[0] ?? null;
    return { trackRow: existing, firstCheckpoint: first };
  }

  // 2) Create new with checkpoints from roadmap_data
  const checkpoints = extractCheckpoints(roadmapRow.roadmap_data);

  const { data: inserted, error: insertErr } = await supabase
    .from("tracks")
    .insert({
      roadmap_id: roadmapRow.id,
      user_id: roadmapRow.user_id,
      checkpoints,                 // JSONB array
      status: "not_started",       // initial status for the track row
    })
    .select()
    .single();

  if (insertErr) throw insertErr;

  const first = checkpoints[0] ?? null;
  return { trackRow: inserted, firstCheckpoint: first };
};
