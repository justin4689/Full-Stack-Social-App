"use server";

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { getDbUserId } from "./user.action";

export type ConversationsResponse = {
  success: boolean;
  conversations: Array<{
    id: string;
    participants: Array<{
      user: {
        id: string;
        name: string | null;
        username: string;
        image: string | null;
        isOnline: boolean;
        lastSeen: Date;
      };
    }>;
    messages: Array<{
      id: string;
      content: string;
      senderId: string;
      createdAt: Date;
      sender: {
        id: string;
        name: string | null;
        username: string;
        image: string | null;
      };
    }>;
  }>;
  currentUserId: string;
};

export async function createConversation(participantId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return { success: true, conversation: existingConversation };
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: currentUserId },
            { userId: participantId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return { success: true, conversation };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return { success: false, error: "Failed to create conversation" };
  }
}

export async function sendMessage(conversationId: string, content: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("Not authenticated");

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { userId: { not: currentUserId } },
          select: { userId: true },
        },
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: currentUserId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Create notifications for other participants
    await prisma.notification.createMany({
      data: conversation.participants.map((participant) => ({
        userId: participant.userId,
        creatorId: currentUserId,
        type: NotificationType.MESSAGE,
        messageId: message.id,
      })),
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getConversations() {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("Not authenticated");

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: currentUserId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, conversations, currentUserId };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { success: false, error: "Failed to fetch conversations" };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("Not authenticated");

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Update lastReadAt for current user
    await prisma.conversationParticipant.update({
      where: {
        userId_conversationId: {
          userId: currentUserId,
          conversationId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    return { success: true, messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function getUnreadMessagesCount() {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return 0;

    // Get all conversations where the user is a participant
    const userParticipations = await prisma.conversationParticipant.findMany({
      where: { userId: currentUserId },
      select: {
        conversationId: true,
        lastReadAt: true,
      },
    });

    let totalUnread = 0;

    // For each conversation, count unread messages
    for (const participation of userParticipations) {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: participation.conversationId,
          senderId: { not: currentUserId },
          createdAt: { gt: participation.lastReadAt },
        },
      });
      totalUnread += unreadCount;
    }

    return totalUnread;
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
}
