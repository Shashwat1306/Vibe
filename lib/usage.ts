import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 5;
const PRO_POINTS = 100;
const DURATION = 60 * 60 * 24 * 30; // 30 days in seconds
const GENERATION_COST=1;

export async function getUsageTracker(){
    const { has } = await auth();
    let hasProAccess = false;
    try {
        hasProAccess = has({ plan: "pro" });
    } catch {
        // Clerk dev keys or no billing configured — default to free tier
        hasProAccess = false;
    }
    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "usage",
        points: hasProAccess ? PRO_POINTS : FREE_POINTS,
        duration: DURATION,
    });
    return usageTracker;
};

export async function consumeCredits(){
    const { userId } = await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST);
    return result;
};

export async function getUsageStatus(){
    const { userId }= await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result; 
}