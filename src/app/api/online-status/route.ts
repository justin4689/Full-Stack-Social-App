import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isOnline } = await req.json();

    const user = await db.user.update({
      where: { clerkId: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating online status:", error);
    return NextResponse.json(
      { error: "Failed to update online status" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        isOnline: true,
        lastSeen: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error getting user online status:", error);
    return NextResponse.json(
      { error: "Failed to get user online status" },
      { status: 500 }
    );
  }
}
