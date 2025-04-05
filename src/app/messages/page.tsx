import { getConversations } from "@/actions/message.action";
import type { ConversationsResponse } from "@/actions/message.action";
import MessagesClient from "./MessagesClient";

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const result = await getConversations() ?? { success: false, conversations: [], currentUserId: '' };
  
  return <MessagesClient {...(result as unknown as ConversationsResponse)} />;
}
