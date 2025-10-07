import { redis } from "@/lib/redis"; 

const DAILY_LIMIT = 5;

export async function canSendMessage(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `user:${userId}:dailyMessages:${today}`;

  const count = await redis.get(key);

  if (count && Number(count) >= DAILY_LIMIT) {
    return false; 
  }

  await redis.incr(key);
  if (!count) {
    await redis.expire(key, 60 * 60 * 24);
  }

  return true;
}
