"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ReactionType } from "@/components/ReactionPicker";

export async function toggleReaction(postId: string, reactionType: ReactionType) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existingReaction = await db.reaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        // Si la même réaction existe, on la supprime
        await db.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        // Si une réaction différente existe, on la met à jour
        await db.reaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            type: reactionType,
          },
        });
      }
    } else {
      // Si aucune réaction n'existe, on en crée une nouvelle
      await db.reaction.create({
        data: {
          type: reactionType,
          postId,
          userId,
        },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in toggleReaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

export async function getPostReactions(postId: string) {
  try {
    const reactions = await db.reaction.findMany({
      where: {
        postId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    return { success: true, reactions };
  } catch (error) {
    console.error("Error in getPostReactions:", error);
    return { success: false, error: "Failed to get reactions" };
  }
}
