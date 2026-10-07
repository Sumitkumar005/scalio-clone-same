"use client";

import useSWR from "swr";
import type { Business, Idea } from "@/lib/domain";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.json !== undefined && { "content-type": "application/json" }), ...init?.headers },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Request failed");
  return data as T;
}

/** JSON-serialised shapes as they arrive in the browser. */
export type BusinessDTO = Omit<Business, "_id" | "createdAt" | "updatedAt" | "onboardedAt"> & { _id: string };
export type IdeaDTO = Omit<Idea, "_id" | "businessId" | "createdAt"> & { _id: string; createdAt: string };
export type Me = {
  user: { id: string; name: string; email: string | null; isGuest: boolean };
  business: BusinessDTO | null;
  credits: number;
  ai: boolean;
};

export function useMe() {
  return useSWR<Me>("/api/me", (p: string) => api<Me>(p));
}

export function useIdeas(limit = 20, status?: string) {
  const key = `/api/ideas?limit=${limit}${status ? `&status=${status}` : ""}`;
  return useSWR<{ ideas: IdeaDTO[] }>(key, (p: string) => api<{ ideas: IdeaDTO[] }>(p));
}
