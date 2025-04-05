"use client";

import { formatDistanceToNow } from "date-fns";

export function formatTimeToNow(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
