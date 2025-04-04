"use client";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { SmileIcon } from "lucide-react";

export const reactions = [
  { emoji: "👍", name: "like" },
  { emoji: "❤️", name: "love" },
  { emoji: "😄", name: "haha" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😡", name: "angry" },
] as const;

export type ReactionType = typeof reactions[number]["name"];

interface ReactionPickerProps {
  onReactionSelect: (reaction: ReactionType) => void;
  currentReaction?: ReactionType;
  disabled?: boolean;
}

export function ReactionPicker({
  onReactionSelect,
  currentReaction,
  disabled,
}: ReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={disabled}
        >
          {currentReaction ? (
            <span className="text-lg">
              {reactions.find((r) => r.name === currentReaction)?.emoji}
            </span>
          ) : (
            <SmileIcon className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <div className="flex gap-2 flex-wrap">
          {reactions.map((reaction) => (
            <Button
              key={reaction.name}
              variant="ghost"
              size="sm"
              className={cn(
                "text-lg p-2 h-auto hover:bg-muted",
                currentReaction === reaction.name && "bg-muted"
              )}
              onClick={() => onReactionSelect(reaction.name)}
            >
              {reaction.emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
