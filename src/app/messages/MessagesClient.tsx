"use client";

import { getMessages, sendMessage } from "@/actions/message.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Conversation = Awaited<ReturnType<typeof getConversations>>["conversations"][number];
type Message = Awaited<ReturnType<typeof getMessages>>["messages"][number];

export default function MessagesClient({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (conversationId: string) => {
    const result = await getMessages(conversationId);
    if (result?.success) {
      setMessages(result.messages);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const result = await sendMessage(selectedConversation.id, newMessage);
      if (result?.success) {
        setNewMessage("");
        setMessages((prev) => [...prev, result.message]);
        // Update conversation list to show latest message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, messages: [result.message] }
              : conv
          )
        );
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(
      (p) => p.user.id !== initialConversations[0]?.participants[0]?.user.id
    )?.user;
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Conversations List */}
        <Card className="col-span-4 p-4">
          <h2 className="font-semibold mb-4">Messages</h2>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              {conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                const lastMessage = conversation.messages[0];
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors
                      ${
                        selectedConversation?.id === conversation.id
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={otherUser?.image ?? "/avatar.png"} />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {otherUser?.name ?? otherUser?.username}
                        </p>
                        {lastMessage && (
                          <>
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(lastMessage.createdAt))} ago
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Messages Area */}
        <Card className="col-span-8 p-4">
          {selectedConversation ? (
            <div className="h-[calc(100vh-12rem)] flex flex-col">
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={getOtherParticipant(selectedConversation)?.image ?? "/avatar.png"}
                    />
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {getOtherParticipant(selectedConversation)?.name ??
                        getOtherParticipant(selectedConversation)?.username}
                    </h3>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === initialConversations[0]?.participants[0]?.user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender.id === initialConversations[0]?.participants[0]?.user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender.id === initialConversations[0]?.participants[0]?.user.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.createdAt))} ago
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                  <SendIcon className="size-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
