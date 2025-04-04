import { getConversations } from "@/actions/message.action";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const { conversations } = await getConversations() ?? { conversations: [] };
  
  return <MessagesClient initialConversations={conversations} />;
}
