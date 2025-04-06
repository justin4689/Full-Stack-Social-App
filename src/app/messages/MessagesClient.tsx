"use client";

import { getMessages, sendMessage } from "@/actions/message.action";
import type { ConversationsResponse } from "@/actions/message.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimeToNow } from "@/lib/format-date";
import { ArrowLeft, LoaderCircle, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { OnlineStatus } from "@/components/online-status";
// import { useRouter } from "next/navigation";

type Conversation = {
  id: string;
  participants: {
    user: {
      id: string;
      name: string | null;
      username: string;
      image: string | null;
      isOnline: boolean;
      lastSeen: Date;
    };
  }[];
  messages: {
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
  }[];
};

type Message = Conversation["messages"][number];

const MessageHeader = ({ otherUser }: { otherUser: Conversation["participants"][number]["user"] }) => (
  <div className="border-b pb-4 mb-4">
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="size-10">
          <AvatarImage src={otherUser.image ?? "/avatar.png"} />
        </Avatar>
        <div className="absolute bottom-0 right-0 transform translate-x-1/4">
          <OnlineStatus userId={otherUser.id} />
        </div>
      </div>
      <div>
        <h3 className="font-medium">
          {otherUser.name ?? otherUser.username}
        </h3>
      </div>
    </div>
  </div>
);

const MessageBubble = ({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => (
  <div
    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[70%] rounded-lg p-3 ${
        isCurrentUser
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
      }`}
    >
      <p className="break-words">{message.content}</p>
      <p
        className={`text-xs mt-1 ${
          isCurrentUser
            ? "text-primary-foreground/70"
            : "text-muted-foreground"
        }`}
      >
        {formatTimeToNow(message.createdAt)}
      </p>
    </div>
  </div>
);

export default function MessagesClient({
  conversations: initialConversations,
  currentUserId,
}: ConversationsResponse) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      
      // Polling for new messages every 5 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Polling for conversation updates every 10 seconds
    const interval = setInterval(async () => {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const scrollArea = messagesEndRef.current.closest('[role="presentation"]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    const result = await getMessages(conversationId);
    if (result?.success && result.messages) {
      setMessages(result.messages);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const result = await sendMessage(selectedConversation.id, newMessage);
      if (result?.success && result.message) {
        setNewMessage("");
        setMessages((prev: Message[]) => [...prev, result.message]);
        // Update conversation list to show latest message
        setConversations((prev) =>
          prev.map((conv: Conversation) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  messages: [{
                    id: result?.message?.id ?? "",
                    content: result?.message?.content ?? "",
                    senderId: result?.message?.senderId ?? "",
                    createdAt: result?.message?.createdAt ?? new Date(),
                    sender: result?.message?.sender ?? {
                      id: "",
                      name: null,
                      username: "",
                      image: null
                    }
                  }]
                }
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

  const getOtherParticipant = (conversation: Conversation): Conversation["participants"][number]["user"] | undefined => {
    if (!conversation) return undefined;
    return conversation.participants.find(
      (p) => p.user.id !== currentUserId
    )?.user;
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Mobile Header - Only show when conversation is selected on mobile */}
        <div className="md:hidden">
          {selectedConversation && (
            <Card className="p-4 mb-4">
              <button 
                onClick={() => setSelectedConversation(null)} 
                className="flex items-center gap-2 text-muted-foreground mb-2"
              >
                <ArrowLeft className="size-4" />
                <span>Back to conversations</span>
              </button>
              {(() => {
                const otherUser = getOtherParticipant(selectedConversation);
                return otherUser ? <MessageHeader otherUser={otherUser} /> : null;
              })()}
            </Card>
          )}
        </div>
        {/* Conversations List - Hide on mobile when conversation is selected */}
        <Card className={`md:col-span-4 p-4 ${selectedConversation ? 'hidden md:block' : ''}`}>
          <h2 className="font-semibold mb-4">Messages</h2>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              {!conversations?.length ? (
                <p className="text-center text-muted-foreground">No conversations yet</p>
              ) : conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;
                const lastMessage = conversation.messages[0];
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="size-10">
                          <AvatarImage src={otherUser.image ?? "/avatar.png"} />
                        </Avatar>
                        <div className="absolute bottom-0 right-0 transform translate-x-1/4">
                          <OnlineStatus userId={otherUser.id} showLastSeen={false} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {otherUser.name ?? otherUser.username}
                        </p>
                        {lastMessage && (
                          <>
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.content}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeToNow(lastMessage.createdAt)}
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
        <Card className={`md:col-span-8 p-4 ${!selectedConversation ? 'hidden md:block' : ''}`}>
          {!selectedConversation ? (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          ) : (
            <div className="h-[calc(100vh-12rem)] flex flex-col">
              {/* Desktop Header */}
              <div className="hidden md:block">
                {(() => {
                  const otherUser = getOtherParticipant(selectedConversation);
                  return otherUser ? <MessageHeader otherUser={otherUser} /> : null;
                })()}
              </div>

              <ScrollArea className="flex-1 pr-4" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
                <div className="space-y-4 min-h-full">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isCurrentUser={message.sender.id === currentUserId}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                  {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
