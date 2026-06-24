import { createClient } from "@supabase/supabase-js";

import type { PlacedSticker, VCardData } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const EVENT_ID = (import.meta.env.VITE_EVENT_ID as string | undefined) || "config-watch-party";
export const RESULTS_EVENT_ID = `${EVENT_ID}:future-bet-results`;
export const PHOTO_BUCKET = (import.meta.env.VITE_SUPABASE_PHOTO_BUCKET as string | undefined) || "participant-photos";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface ParticipantRow {
  id: string;
  event_id: string;
  name: string;
  email: string;
  profession: string;
  photo_url: string | null;
  interests: string[];
  skills: string[];
  future_interests: string[];
  future_bets: string[];
  placed_stickers: PlacedSticker[];
  accent_color: string;
  card_bg: string;
  x: number;
  y: number;
  rotation: number;
  created_at?: string;
}

export function rowToCard(row: ParticipantRow): VCardData {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    profession: row.profession,
    photo: row.photo_url,
    interests: row.interests || [],
    skills: row.skills || [],
    futureInterests: row.future_interests || [],
    futureBets: row.future_bets || [],
    placedStickers: row.placed_stickers || [],
    accentColor: row.accent_color,
    cardBg: row.card_bg,
    x: Number(row.x),
    y: Number(row.y),
    rotation: Number(row.rotation),
  };
}

export function cardToInsert(card: VCardData, eventId = EVENT_ID): Omit<ParticipantRow, "created_at"> {
  return {
    id: card.id,
    event_id: eventId,
    name: card.name,
    email: card.email,
    profession: card.profession,
    photo_url: card.photo,
    interests: card.interests,
    skills: card.skills,
    future_interests: card.futureInterests,
    future_bets: card.futureBets,
    placed_stickers: card.placedStickers,
    accent_color: card.accentColor,
    card_bg: card.cardBg,
    x: card.x,
    y: card.y,
    rotation: card.rotation,
  };
}
