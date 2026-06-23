export interface PlacedSticker {
  instanceId: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface VCardData {
  id: string;
  name: string;
  photo: string | null;
  email: string;
  profession: string;
  interests: string[];
  skills: string[];
  futureInterests: string[];
  placedStickers: PlacedSticker[];
  accentColor: string;
  cardBg: string;
  x: number;
  y: number;
  rotation: number;
}
