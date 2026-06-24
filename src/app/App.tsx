import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera, Mail, Briefcase, Sparkles, ChevronRight,
  ArrowLeft, X, Plus,
  SlidersHorizontal, Layers, LayoutGrid, RotateCcw, RotateCw, Trophy, BookOpen,
} from "lucide-react";
import HomeScreen from "@/imports/Home/index";
import {
  EVENT_ID,
  PHOTO_BUCKET,
  RESULTS_EVENT_ID,
  cardToInsert,
  isSupabaseConfigured,
  rowToCard,
  supabase,
  type ParticipantRow,
} from "./lib/supabase";
import type { PlacedSticker, VCardData } from "./types";

// ─── Font stacks ──────────────────────────────────────────────────────────────
// Figma Sans Text = body/UI font (matches import font-['Figma_Sans_Text:Regular'])
// Plus Jakarta Sans = bold labels/buttons
const F  = "'Figma Sans Text', 'Plus Jakarta Sans', system-ui, sans-serif";
const FB = "'Plus Jakarta Sans', 'Figma Sans Text', system-ui, sans-serif"; // bold UI
const ADMIN_CODE = (import.meta.env.VITE_ADMIN_CODE as string | undefined) || "config2026";

// ─── Palette ─────────────────────────────────────────────────────────────────
const ORANGE = "#FF7237";
const DARK   = "#1E1E1E";
const SURFACE = "#2a2a2a";

// ─── Card dims ────────────────────────────────────────────────────────────────
const CW    = 252;
const CH    = 372;
const HH    = 148;
const AV    = 68;
const AV_OVER = 32;

// ─── Data ─────────────────────────────────────────────────────────────────────

const INTEREST_OPTIONS = [
  { id: "make",  label: "Figma Make",  color: "#7B61FF", bg: "#f0ecff" },
  { id: "buzz",  label: "Figma Buzz",  color: ORANGE,    bg: "#fff3ee" },
  { id: "sites", label: "Figma Sites", color: "#14AE5C", bg: "#e8f9f0" },
  { id: "figma", label: "Figma",       color: "#0D99FF", bg: "#e5f4ff" },
];

const SKILL_OPTIONS = [
  { id: "ds",          label: "Design System",          color: "#7B61FF" },
  { id: "interaction", label: "Interaction Design",      color: "#0D99FF" },
  { id: "vibecoding",  label: "Vibe Coder ✦",           color: ORANGE    },
  { id: "autolayout",  label: "Autolayout Ninja",        color: "#14AE5C" },
  { id: "variables",   label: "Padawan delle Variabili", color: "#A259FF" },
  { id: "brand",       label: "Brand Identity Master",   color: "#F24E1E" },
  { id: "prototyping", label: "Prototyping Pro",         color: "#0ACF83" },
  { id: "a11y",        label: "A11y Champion",           color: "#1BC47D" },
];

const FUTURE_EVENT_OPTIONS = [
  { id: "ai-product-design", label: "AI & Product Design", color: "#7B61FF" },
  { id: "design-systems", label: "Design Systems", color: "#14AE5C" },
  { id: "figma-make", label: "Figma Make", color: ORANGE },
  { id: "ux-research", label: "UX Research", color: "#0D99FF" },
  { id: "motion-prototyping", label: "Motion & Prototyping", color: "#A259FF" },
  { id: "brand-identity", label: "Brand Identity", color: "#F24E1E" },
  { id: "accessibility", label: "Accessibility", color: "#1BC47D" },
  { id: "product-strategy", label: "Product Strategy", color: "#122F76" },
  { id: "no-code", label: "No-code tools", color: "#24CB71" },
  { id: "dev-handoff", label: "Developer Handoff", color: "#33DFDF" },
];

const FUTURE_BET_OPTIONS = [
  { id: "figma-agents", label: "AI integrata e nuovi Figma Agents", description: "L'AI smette di essere solo prompt-to-design e diventa un assistente di sistema dentro file, componenti e handoff.", color: "#7B61FF" },
  { id: "smart-variant-adaptation", label: "Smart Variant Adaptation", description: "Crei un componente desktop e Figma genera varianti responsive per mobile, tablet e altri canali.", color: "#0D99FF" },
  { id: "agent-accessibility-review", label: "Agenti per accessibilità e design tokens", description: "Agenti che controllano contrasto, leggibilità e coerenza con i token aziendali prima dell'handoff.", color: "#A259FF" },
  { id: "advanced-prototyping", label: "Prototipazione avanzata stile Framer", description: "Figma prova a chiudere il gap con strumenti più fluidi per prototipi realistici e interattivi.", color: ORANGE },
  { id: "scroll-animations", label: "Scroll-based animations native", description: "Animazioni e transizioni che reagiscono direttamente allo scrolling della pagina.", color: "#F24E1E" },
  { id: "relative-variables-logic", label: "Variabili relative e logica avanzata", description: "Percentuali, REM, fr e trigger logici quando una variabile cambia durante il prototipo.", color: "#14AE5C" },
  { id: "design-dev-pipeline", label: "Pipeline unica tra design e sviluppo", description: "Figma diventa meno tela statica e più sistema di produzione per definire regole e output.", color: "#33DFDF" },
  { id: "mcp-ide-agents", label: "MCP più integrato con IDE e agenti AI", description: "Connessioni più forti con VS Code, Cursor e ambienti agentici per trasformare regole in codice.", color: "#33DFDF" },
  { id: "devmode-clean-code", label: "Dev Mode genera codice più pronto all'uso", description: "Handoff più vicino alla produzione, con componenti e specifiche leggibili dagli sviluppatori.", color: "#F9DC1F" },
  { id: "figma-weave-ai-native", label: "Figma Weave per immagini, video e motion", description: "Dopo l'acquisizione di Weavy, Figma porta immagini, video, animazioni e VFX dentro la canvas.", color: "#7B61FF" },
  { id: "machine-readable-ds", label: "Design system leggibili dagli agenti AI", description: "Token e componenti strutturati perché gli agenti li capiscano e li usino senza fare errori.", color: "#14AE5C" },
];

const RESOURCE_LINKS = [
  {
    id: "glossary",
    title: "Glossario Config",
    description: "Parole, feature e concetti nuovi spiegati senza fuffa, da tenere aperto mentre si commenta.",
    label: "Apri glossario",
    href: "#",
    color: "#7B61FF",
  },
  {
    id: "timeline",
    title: "Timeline delle novità",
    description: "La sequenza degli annunci: cosa è uscito, quando, e perché conta per designer e team.",
    label: "Apri timeline",
    href: "#",
    color: ORANGE,
  },
  {
    id: "recap",
    title: "Recap del keynote",
    description: "Un riassunto leggibile da mandare al team o riprendere il giorno dopo senza riguardare tutto.",
    label: "Apri recap",
    href: "#",
    color: "#14AE5C",
  },
  {
    id: "references",
    title: "Link utili e materiali",
    description: "Video, talk, documentazione, thread e riferimenti raccolti in un posto solo.",
    label: "Apri link utili",
    href: "#",
    color: "#33DFDF",
  },
];

const RESOLVED_BETS: string[] = [];

const BG_PALETTE = [
  "#7B61FF", ORANGE, "#14AE5C", "#0D99FF",
  "#A259FF", "#F24E1E", "#F9DC1F", "#33DFDF",
  "#FF7676", "#122F76", "#24CB71", DARK,
];

// ─── 24 Scontornate sticker SVGs ──────────────────────────────────────────────

type StickerDef = { id: string; label: string; w: number; h: number; el: React.ReactNode };

const STICKERS: StickerDef[] = [
  { id:"arch",    label:"Arco",       w:80, h:46,
    el:<svg viewBox="0 0 80 46" width="80" height="46" style={{overflow:"visible"}}>
      <path d="M0,42 A40,40 0 0,1 80,42 Z" fill="#FF7237"/>
      <path d="M8,42 A32,32 0 0,1 72,42" stroke="#0A5C35" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M18,42 A22,22 0 0,1 62,42" stroke="#0A5C35" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M28,42 A12,12 0 0,1 52,42" stroke="#0A5C35" strokeWidth="6" fill="none" strokeLinecap="round"/>
    </svg> },
  { id:"circle-radial", label:"Radiale", w:68, h:68,
    el:<svg viewBox="0 0 68 68" width="68" height="68">
      <circle cx="34" cy="34" r="34" fill="#33DFDF"/>
      {Array.from({length:12}).map((_,i)=>{const a=(i*30*Math.PI)/180;return<line key={i} x1={34+13*Math.cos(a)} y1={34+13*Math.sin(a)} x2={34+31*Math.cos(a)} y2={34+31*Math.sin(a)} stroke="#874FFF" strokeWidth="4" strokeLinecap="round"/>})}
    </svg> },
  { id:"triangle", label:"Triangolo", w:76, h:68,
    el:<svg viewBox="0 0 76 68" width="76" height="68" style={{overflow:"visible"}}>
      <polygon points="38,2 74,66 2,66" fill="#FF7676"/>
      <polygon points="38,18 58,52 18,52" fill="#122F76"/>
      <circle cx="38" cy="42" r="5" fill="#FF7676"/>
    </svg> },
  { id:"hex",     label:"Esagono",    w:70, h:64,
    el:<svg viewBox="0 0 70 64" width="70" height="64">
      <polygon points="35,2 66,19 66,48 35,62 4,48 4,19" fill="#24CB71"/>
      <circle cx="22" cy="33" r="9" fill="#122F76"/>
      <circle cx="48" cy="33" r="9" fill="#122F76"/>
      <circle cx="35" cy="18" r="9" fill="#122F76"/>
    </svg> },
  { id:"para",    label:"Parallelo",  w:84, h:50,
    el:<svg viewBox="0 0 84 50" width="84" height="50">
      <polygon points="16,0 84,0 68,50 0,50" fill="#4D49FC"/>
      <line x1="18" y1="10" x2="72" y2="10" stroke="#E9312A" strokeWidth="5" strokeLinecap="round"/>
      <line x1="12" y1="25" x2="66" y2="25" stroke="#E9312A" strokeWidth="5" strokeLinecap="round"/>
      <line x1="6"  y1="40" x2="60" y2="40" stroke="#E9312A" strokeWidth="5" strokeLinecap="round"/>
    </svg> },
  { id:"pill",    label:"Pillola",    w:80, h:40,
    el:<svg viewBox="0 0 80 40" width="80" height="40">
      <rect width="80" height="40" rx="20" fill="#FF7237"/>
      <path d="M10,14 C22,6 30,34 42,26 C54,18 64,34 72,28" stroke="#1E1E1E" strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg> },
  { id:"rnd-sq",  label:"Quadrato",   w:66, h:66,
    el:<svg viewBox="0 0 66 66" width="66" height="66">
      <rect width="66" height="66" rx="14" fill="#E9312A"/>
      <circle cx="14" cy="14" r="11" fill="#4D49FC"/>
      <circle cx="52" cy="14" r="11" fill="#4D49FC"/>
      <circle cx="14" cy="52" r="11" fill="#4D49FC"/>
      <circle cx="52" cy="52" r="11" fill="#4D49FC"/>
    </svg> },
  { id:"target",  label:"Target",     w:68, h:68,
    el:<svg viewBox="0 0 68 68" width="68" height="68">
      <circle cx="34" cy="34" r="34" fill="#95B9AC"/>
      <circle cx="34" cy="34" r="24" fill="none" stroke="#721C1C" strokeWidth="5"/>
      <circle cx="34" cy="34" r="13" fill="none" stroke="#721C1C" strokeWidth="5"/>
      <circle cx="34" cy="34" r="4"  fill="#721C1C"/>
    </svg> },
  { id:"blob",    label:"Blob",       w:72, h:68,
    el:<svg viewBox="0 0 72 68" width="72" height="68">
      <path d="M36,4 C55,0 74,14 70,34 C74,52 58,70 38,68 C18,70 0,55 2,36 C-2,16 14,8 36,4 Z" fill="#874FFF"/>
      {[20,36,52].flatMap(cx=>[18,34,50].map(cy=><circle key={`${cx}${cy}`} cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.3)"/>))}
    </svg> },
  { id:"hourglass", label:"Clessidra", w:60, h:76,
    el:<svg viewBox="0 0 60 76" width="60" height="76">
      <path d="M0,0 L60,0 L30,38 L60,76 L0,76 L30,38 Z" fill="#33DFDF"/>
      <path d="M8,0 L52,0 L30,33 Z" fill="rgba(0,0,0,0.1)"/>
      <path d="M8,76 L52,76 L30,43 Z" fill="rgba(0,0,0,0.1)"/>
    </svg> },
  { id:"diamond", label:"Diamante",   w:70, h:70,
    el:<svg viewBox="0 0 70 70" width="70" height="70">
      <polygon points="35,2 68,35 35,68 2,35" fill="#F9DC1F"/>
      <polygon points="35,13 57,35 35,57 13,35" fill="none" stroke="#E9312A" strokeWidth="4"/>
      <circle cx="35" cy="35" r="7" fill="#E9312A"/>
    </svg> },
  { id:"cross",   label:"Croce",      w:70, h:70,
    el:<svg viewBox="0 0 70 70" width="70" height="70">
      <path d="M21,0 L49,0 L49,21 L70,21 L70,49 L49,49 L49,70 L21,70 L21,49 L0,49 L0,21 L21,21 Z" fill="#33DFDF"/>
      <circle cx="35" cy="35" r="9" fill="#874FFF"/>
    </svg> },
  { id:"star",    label:"Stella",     w:72, h:68,
    el:<svg viewBox="0 0 72 68" width="72" height="68">
      <polygon points="36,2 44,26 70,26 49,42 57,66 36,51 15,66 23,42 2,26 28,26" fill="#F9DC1F"/>
      <polygon points="36,14 41,28 56,28 44,37 49,51 36,42 23,51 28,37 16,28 31,28" fill="#E9312A"/>
    </svg> },
  { id:"speech",  label:"Fumetto",    w:74, h:66,
    el:<svg viewBox="0 0 74 66" width="74" height="66">
      <path d="M6,0 Q0,0 0,8 L0,42 Q0,50 6,50 L26,50 L34,66 L42,50 L68,50 Q74,50 74,42 L74,8 Q74,0 68,0 Z" fill="#4D49FC"/>
      <text x="37" y="32" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="900" fontFamily="sans-serif">!</text>
    </svg> },
  { id:"shield",  label:"Scudo",      w:64, h:76,
    el:<svg viewBox="0 0 64 76" width="64" height="76">
      <path d="M32,2 L62,14 L62,38 Q62,62 32,74 Q2,62 2,38 L2,14 Z" fill="#24CB71"/>
      <path d="M32,12 L52,22 L52,40 Q52,56 32,64 Q12,56 12,40 L12,22 Z" fill="none" stroke="#0A5C35" strokeWidth="4"/>
      <circle cx="32" cy="40" r="6" fill="#0A5C35"/>
    </svg> },
  { id:"arrow",   label:"Freccia",    w:78, h:50,
    el:<svg viewBox="0 0 78 50" width="78" height="50">
      <polygon points="0,17 48,17 48,4 78,25 48,46 48,33 0,33" fill="#E9312A"/>
    </svg> },
  { id:"bolt",    label:"Fulmine",    w:48, h:78,
    el:<svg viewBox="0 0 48 78" width="48" height="78">
      <polygon points="28,0 2,42 22,42 20,78 46,36 26,36" fill="#F9DC1F"/>
    </svg> },
  { id:"heart",   label:"Cuore",      w:72, h:64,
    el:<svg viewBox="0 0 72 64" width="72" height="64">
      <path d="M36,60 C14,44 2,32 2,20 C2,10 10,2 20,2 C26,2 32,6 36,12 C40,6 46,2 52,2 C62,2 70,10 70,20 C70,32 58,44 36,60 Z" fill="#FF7676"/>
      <path d="M36,48 C22,36 14,27 14,20 C14,15 17,11 22,11 C26,11 30,14 32,18 L36,24 L40,18 C42,14 46,11 50,11 C55,11 58,15 58,20 C58,27 50,36 36,48 Z" fill="#721C1C"/>
    </svg> },
  { id:"leaf",    label:"Foglia",     w:56, h:72,
    el:<svg viewBox="0 0 56 72" width="56" height="72">
      <path d="M28,70 C8,50 0,30 4,14 C8,0 18,0 28,0 C38,0 48,0 52,14 C56,30 48,50 28,70 Z" fill="#33DFDF"/>
      <path d="M28,70 L28,8" stroke="#0A5C35" strokeWidth="3" strokeLinecap="round"/>
      <path d="M28,40 C18,32 12,24 14,14" stroke="#0A5C35" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M28,40 C38,32 44,24 42,14" stroke="#0A5C35" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg> },
  { id:"moon",    label:"Luna",       w:60, h:72,
    el:<svg viewBox="0 0 60 72" width="60" height="72">
      <path d="M42,4 A34,34 0 1,0 42,68 A26,26 0 1,1 42,4 Z" fill="#122F76"/>
      <circle cx="44" cy="14" r="3" fill="#F9DC1F"/>
      <circle cx="50" cy="28" r="2" fill="#F9DC1F"/>
      <circle cx="52" cy="44" r="3" fill="#F9DC1F"/>
    </svg> },
  { id:"wave",    label:"Onda",       w:86, h:42,
    el:<svg viewBox="0 0 86 42" width="86" height="42">
      <path d="M2,20 Q18,2 34,20 Q50,38 66,20 Q82,2 84,20 L84,42 L2,42 Z" fill="#FF7237"/>
      <path d="M2,20 Q18,2 34,20 Q50,38 66,20 Q82,2 84,20" stroke="#E9312A" strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg> },
  { id:"clover",  label:"Trifoglio",  w:70, h:70,
    el:<svg viewBox="0 0 70 70" width="70" height="70">
      <circle cx="35" cy="18" r="18" fill="#24CB71"/>
      <circle cx="35" cy="52" r="18" fill="#24CB71"/>
      <circle cx="18" cy="35" r="18" fill="#24CB71"/>
      <circle cx="52" cy="35" r="18" fill="#24CB71"/>
      <circle cx="35" cy="35" r="12" fill="#0A5C35"/>
    </svg> },
  { id:"eye",     label:"Occhio",     w:78, h:44,
    el:<svg viewBox="0 0 78 44" width="78" height="44">
      <path d="M39,0 C14,0 2,22 2,22 C2,22 14,44 39,44 C64,44 76,22 76,22 C76,22 64,0 39,0 Z" fill="#F0ECFF"/>
      <circle cx="39" cy="22" r="13" fill="#874FFF"/>
      <circle cx="39" cy="22" r="7"  fill={DARK}/>
      <circle cx="43" cy="18" r="3"  fill="#fff"/>
    </svg> },
  { id:"ribbon",  label:"Fiocco",     w:72, h:56,
    el:<svg viewBox="0 0 72 56" width="72" height="56">
      <path d="M36,22 L4,2 L14,28 L4,54 L36,34 L68,54 L58,28 L68,2 Z" fill="#E9312A"/>
      <circle cx="36" cy="28" r="9" fill="#122F76"/>
    </svg> },
];

const STICKER_MAP = Object.fromEntries(STICKERS.map(s => [s.id, s]));

function StickerEl({ id, scale = 1 }: { id: string; scale?: number }) {
  const st = STICKER_MAP[id];
  if (!st) return null;
  return (
    <div style={{ width: st.w * scale, height: st.h * scale, lineHeight: 0, flexShrink: 0 }}>
      <div style={{ width: st.w, height: st.h, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {st.el}
      </div>
    </div>
  );
}

// ─── Editable sticker — drag with one finger, pinch to scale, no control strip ─

function EditableSticker({ sticker, onRemove, onMove, onScale, onRotate, cardScale }: {
  sticker: PlacedSticker;
  onRemove: () => void;
  onMove: (x: number, y: number) => void;
  onScale: (factor: number) => void;
  onRotate: (degrees: number) => void;
  cardScale: number;
}) {
  const st = STICKER_MAP[sticker.type];
  const divRef = useRef<HTMLDivElement>(null);

  // Keep latest values accessible inside non-reactive native listeners
  const sRef   = useRef(sticker);   sRef.current   = sticker;
  const csRef  = useRef(cardScale); csRef.current  = cardScale;
  const omRef  = useRef(onMove);    omRef.current  = onMove;
  const osRef  = useRef(onScale);   osRef.current  = onScale;
  const orRef  = useRef(onRotate);  orRef.current  = onRotate;

  // Native non-passive touch events for mobile pinch-to-scale + drag
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    let dist0: number | null = null;
    let angle0: number | null = null;
    let dragStart: { px: number; py: number; sx: number; sy: number } | null = null;
    const angle = (a: Touch, b: Touch) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;

    const onTS = (e: TouchEvent) => {
      e.stopPropagation();
      if (e.touches.length === 2) {
        dist0 = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        angle0 = angle(e.touches[0], e.touches[1]);
        dragStart = null;
      } else if (e.touches.length === 1) {
        const s = sRef.current;
        dragStart = { px: e.touches[0].clientX, py: e.touches[0].clientY, sx: s.x, sy: s.y };
      }
    };

    const onTM = (e: TouchEvent) => {
      e.preventDefault(); // non-passive: must use native listener
      e.stopPropagation();
      if (e.touches.length >= 2 && dist0 !== null && dist0 > 5) {
        const d = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        const ratio = d / dist0;
        if (ratio > 0.75 && ratio < 1.4) osRef.current(ratio);
        const a = angle(e.touches[0], e.touches[1]);
        if (angle0 !== null) {
          const delta = a - angle0;
          if (Math.abs(delta) < 45) orRef.current(delta);
        }
        dist0 = d;
        angle0 = a;
      } else if (e.touches.length === 1 && dragStart) {
        const sc = csRef.current;
        const dx = (e.touches[0].clientX - dragStart.px) / sc;
        const dy = (e.touches[0].clientY - dragStart.py) / sc;
        omRef.current(dragStart.sx + dx, dragStart.sy + dy);
      }
    };

    const onTE = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        dist0 = null;
        angle0 = null;
      }
      if (e.touches.length === 0) dragStart = null;
    };

    el.addEventListener("touchstart",  onTS, { passive: false });
    el.addEventListener("touchmove",   onTM, { passive: false });
    el.addEventListener("touchend",    onTE);
    el.addEventListener("touchcancel", onTE);
    return () => {
      el.removeEventListener("touchstart",  onTS);
      el.removeEventListener("touchmove",   onTM);
      el.removeEventListener("touchend",    onTE);
      el.removeEventListener("touchcancel", onTE);
    };
  }, []); // empty deps — use refs for latest values

  if (!st) return null;

  return (
    <div
      ref={divRef}
      style={{
        position: "absolute",
        left: sticker.x * cardScale,
        top: sticker.y * cardScale,
        transform: `rotate(${sticker.rotation}deg)`,
        transformOrigin: "center center",
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
        zIndex: 10,
      }}
    >
      <StickerEl id={sticker.type} scale={sticker.scale * cardScale} />
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onRemove(); }}
        style={{
          position: "absolute", top: -7, right: -7,
          width: 18, height: 18, borderRadius: "50%",
          background: DARK, color: "#fff",
          border: "2px solid rgba(255,255,255,0.25)",
          cursor: "pointer", fontSize: 11, fontWeight: 700, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20,
        }}
      >×</button>
      <div style={{ position: "absolute", right: -8, bottom: -8, display: "flex", gap: 4, zIndex: 20 }}>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRotate(-15); }}
          aria-label="Ruota sticker a sinistra"
          style={{
            width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)",
            background: DARK, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
          }}
        ><RotateCcw size={13} /></button>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRotate(15); }}
          aria-label="Ruota sticker a destra"
          style={{
            width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)",
            background: DARK, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
          }}
        ><RotateCw size={13} /></button>
      </div>
    </div>
  );
}

// ─── Portrait VCard ───────────────────────────────────────────────────────────

function PortraitCard({ card, scale = 1, editMode = false, placedStickers, containerRef, onRemove, onMove, onScale, onRotate, onShowAllSkills }: {
  card: Omit<VCardData, "x"|"y"|"rotation">; scale?: number; editMode?: boolean;
  placedStickers?: PlacedSticker[]; containerRef?: React.RefObject<HTMLDivElement | null>;
  onRemove?: (id: string) => void;
  onMove?:   (id: string, x: number, y: number) => void;
  onScale?:  (id: string, factor: number) => void;
  onRotate?: (id: string, degrees: number) => void;
  onShowAllSkills?: (card: Omit<VCardData, "x"|"y"|"rotation">) => void;
}) {
  const s = scale;
  const stickers = placedStickers ?? card.placedStickers;
  // Avatar: left-aligned, straddling header/body boundary
  const avLeft = 14 * s;
  const avTop  = (HH - AV_OVER) * s;
  // Name row starts beside the avatar: left-pad = avatar left + avatar size + gap
  const namePL = (14 + AV + 8) * s;
  // Name row top-pad to vertically align with avatar center in body space
  const namePT = Math.max(0, (AV / 2 - AV_OVER + 6)) * s;

  return (
    <div style={{ width: CW * s, height: CH * s, borderRadius: 16 * s, overflow: "visible", background: "#fff", position: "relative", flexShrink: 0, fontFamily: F }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 16 * s, overflow: "hidden" }}>

        {/* Coloured header */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: HH * s, background: card.cardBg || card.accentColor, overflow: "hidden" }}>
          {stickers.map(st =>
            editMode && containerRef && onRemove && onMove && onScale && onRotate ? (
              <EditableSticker
                key={st.instanceId} sticker={st}
                onRemove={() => onRemove(st.instanceId)}
                onMove={(x, y) => onMove(st.instanceId, x, y)}
                onScale={f => onScale(st.instanceId, f)}
                onRotate={degrees => onRotate(st.instanceId, degrees)}
                cardScale={s}
              />
            ) : (
              <div key={st.instanceId} style={{ position: "absolute", left: st.x * s, top: st.y * s, transform: `rotate(${st.rotation}deg)`, zIndex: 5, pointerEvents: "none" }}>
                <StickerEl id={st.type} scale={st.scale * s} />
              </div>
            )
          )}
        </div>

        {/* Card body */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: HH * s, background: "#fff" }}>

          {/* Name + profession — beside the avatar */}
          <div style={{ paddingLeft: namePL, paddingRight: 12 * s, paddingTop: namePT, paddingBottom: 4 * s }}>
            <div style={{ fontWeight: 800, fontSize: 18 * s, color: DARK, letterSpacing: "-0.5px", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {card.name || "Il tuo nome"}
            </div>
            <div style={{ fontSize: 11 * s, color: "#8b8a97", lineHeight: 1.3 }}>
              {card.profession || "Cosa fai"}
            </div>
          </div>

          {/* Email + chips */}
          <div style={{ padding: `${4 * s}px ${14 * s}px ${10 * s}px` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 * s }}>
              <Mail size={9 * s} color="#b0afbc" />
              <span style={{ fontSize: 10 * s, color: "#b0afbc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.email}</span>
            </div>

            {/* Interest chips — radius 4 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 * s, marginBottom: 5 * s }}>
              {card.interests.map(id => {
                const o = INTEREST_OPTIONS.find(x => x.id === id);
                return o ? <span key={id} style={{ fontSize: 9 * s, padding: `${2*s}px ${6*s}px`, borderRadius: 4, fontWeight: 700, color: o.color, background: o.bg }}>{o.label}</span> : null;
              })}
            </div>

            {/* Skill chips — radius 4 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 * s }}>
              {card.skills.slice(0, 3).map(id => {
                const sk = SKILL_OPTIONS.find(x => x.id === id);
                return sk ? <span key={id} style={{ fontSize: 9 * s, padding: `${2*s}px ${6*s}px`, borderRadius: 4, fontWeight: 700, color: sk.color, background: sk.color + "15", border: `1px solid ${sk.color}40` }}>{sk.label}</span> : null;
              })}
              {card.skills.length > 3 && (
                <button
                  onClick={e => { e.stopPropagation(); onShowAllSkills?.(card); }}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: onShowAllSkills ? "pointer" : "default",
                    fontSize: 8 * s,
                    fontWeight: 800,
                    color: "#B0AFBC",
                    fontFamily: FB,
                  }}>
                  +{card.skills.length - 3}
                </button>
              )}
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 8 * s, left: 14 * s, right: 14 * s, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 7 * s, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#d0cfe0" }}>Config 2025</span>
            <span style={{ fontSize: 7 * s, fontWeight: 700, color: "#d0cfe0" }}>◆ Figma</span>
          </div>
        </div>
      </div>

      {/* Avatar — left-aligned, outside clip so it's fully visible */}
      <div style={{ position: "absolute", left: avLeft, top: avTop, zIndex: 20, borderRadius: "50%", border: `${3 * s}px solid #fff`, overflow: "hidden", width: AV * s, height: AV * s, background: card.accentColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {card.photo
          ? <img src={card.photo} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ color: "#fff", fontWeight: 800, fontSize: AV * s * 0.33, fontFamily: F }}>
              {card.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
            </span>
        }
      </div>
    </div>
  );
}

// ─── Canvas card ──────────────────────────────────────────────────────────────

function CanvasCard({ card, isNew = false, index = 0, onShowAllSkills }: { card: VCardData; isNew?: boolean; index?: number; onShowAllSkills?: (card: Omit<VCardData, "x"|"y"|"rotation">) => void }) {
  return (
    <motion.div
      initial={isNew
        ? { scale: 0, opacity: 0, rotate: -12 }
        : { opacity: 0, scale: 0.9, y: 16 }
      }
      animate={{ rotate: card.rotation, opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
      transition={isNew
        ? { type: "spring", stiffness: 260, damping: 22, delay: 0.1 }
        : { type: "spring", stiffness: 280, damping: 24, delay: index * 0.06 }
      }
      style={{ position: "absolute", left: card.x, top: card.y, filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.3))" }}
    >
      <PortraitCard card={card} scale={0.84} onShowAllSkills={onShowAllSkills} />
    </motion.div>
  );
}

// ─── Existing cards ───────────────────────────────────────────────────────────

const EXISTING_CARDS: VCardData[] = [
  { id:"c1", name:"Sara Bianchi", photo:null, email:"sara@design.co", profession:"Product Designer", interests:["make","figma"], skills:["ds","autolayout"], futureInterests:["design-systems","ai-product-design"], futureBets:["machine-readable-ds","agent-accessibility-review","smart-variant-adaptation"], placedStickers:[{instanceId:"i1",type:"arch",x:22,y:10,rotation:-6,scale:1},{instanceId:"i2",type:"circle-radial",x:140,y:55,rotation:8,scale:0.9}], accentColor:"#7B61FF", cardBg:"#7B61FF", x:60, y:80, rotation:-2.5 },
  { id:"c2", name:"Marco Ferretti", photo:null, email:"marco@webstudio.io", profession:"Frontend Dev", interests:["sites","make"], skills:["vibecoding","prototyping"], futureInterests:["figma-make","dev-handoff"], futureBets:["mcp-ide-agents","design-dev-pipeline","devmode-clean-code"], placedStickers:[{instanceId:"i3",type:"para",x:100,y:18,rotation:10,scale:1}], accentColor:"#14AE5C", cardBg:"#14AE5C", x:340, y:40, rotation:1.8 },
  { id:"c3", name:"Giulia Romano", photo:null, email:"giulia@ux.it", profession:"UX Researcher", interests:["buzz","figma"], skills:["interaction","a11y"], futureInterests:["ux-research","accessibility"], futureBets:["figma-agents","agent-accessibility-review","relative-variables-logic"], placedStickers:[{instanceId:"i4",type:"heart",x:20,y:50,rotation:-5,scale:1},{instanceId:"i5",type:"star",x:125,y:80,rotation:12,scale:0.85}], accentColor:ORANGE, cardBg:ORANGE, x:640, y:100, rotation:-1.2 },
  { id:"c4", name:"Luca Esposito", photo:null, email:"luca@creative.design", profession:"Creative Director", interests:["figma","make","buzz"], skills:["brand","ds"], futureInterests:["brand-identity","product-strategy"], futureBets:["figma-weave-ai-native","advanced-prototyping","scroll-animations"], placedStickers:[{instanceId:"i6",type:"bolt",x:88,y:28,rotation:6,scale:1.1}], accentColor:"#0D99FF", cardBg:"#122F76", x:160, y:340, rotation:2.1 },
  { id:"c5", name:"Chiara Conti", photo:null, email:"chiara@studio.it", profession:"Brand Designer", interests:["sites","figma"], skills:["brand","variables"], futureInterests:["brand-identity","no-code"], futureBets:["figma-weave-ai-native","machine-readable-ds","figma-agents"], placedStickers:[{instanceId:"i7",type:"eye",x:130,y:20,rotation:-9,scale:1},{instanceId:"i8",type:"blob",x:16,y:60,rotation:6,scale:0.9}], accentColor:"#F24E1E", cardBg:"#F24E1E", x:470, y:300, rotation:-1.8 },
  { id:"c6", name:"Alessandro Manzoni", photo:null, email:"alex@figmadesign.com", profession:"DS Lead", interests:["make","sites"], skills:["ds","variables","autolayout"], futureInterests:["design-systems","figma-make"], futureBets:["machine-readable-ds","mcp-ide-agents","agent-accessibility-review"], placedStickers:[{instanceId:"i9",type:"diamond",x:38,y:8,rotation:5,scale:1},{instanceId:"i10",type:"speech",x:130,y:65,rotation:-8,scale:0.85}], accentColor:"#A259FF", cardBg:"#33DFDF", x:790, y:360, rotation:1.5 },
  { id:"c7", name:"Federica Ricci", photo:null, email:"federica@motion.studio", profession:"Motion Designer", interests:["buzz","make"], skills:["prototyping","interaction"], futureInterests:["motion-prototyping","ai-product-design"], futureBets:["figma-weave-ai-native","scroll-animations","advanced-prototyping"], placedStickers:[{instanceId:"i11",type:"wave",x:60,y:55,rotation:-10,scale:1}], accentColor:"#1BC47D", cardBg:"#1BC47D", x:940, y:100, rotation:-2 },
  { id:"c8", name:"Davide Moretti", photo:null, email:"davide@type.it", profession:"Type Designer", interests:["figma","sites"], skills:["brand","a11y"], futureInterests:["accessibility","dev-handoff"], futureBets:["relative-variables-logic","design-dev-pipeline","devmode-clean-code"], placedStickers:[{instanceId:"i12",type:"cross",x:148,y:14,rotation:-7,scale:1},{instanceId:"i13",type:"moon",x:18,y:52,rotation:10,scale:1}], accentColor:"#0ACF83", cardBg:"#0ACF83", x:1100, y:280, rotation:1.2 },
];

const BOARD_LAYOUT = [
  { x: 90,   y: 120, rotation: -2.5 },
  { x: 405,  y: 72,  rotation: 1.8 },
  { x: 715,  y: 150, rotation: -1.2 },
  { x: 1040, y: 84,  rotation: 2.4 },
  { x: 190,  y: 455, rotation: 1.6 },
  { x: 520,  y: 390, rotation: -2.1 },
  { x: 835,  y: 480, rotation: 1.3 },
  { x: 1160, y: 360, rotation: -1.7 },
  { x: 60,   y: 690, rotation: 2.1 },
  { x: 390,  y: 650, rotation: -1.5 },
  { x: 730,  y: 720, rotation: 2.5 },
  { x: 1085, y: 670, rotation: -2.3 },
];

function boardPose(index: number) {
  const base = BOARD_LAYOUT[index % BOARD_LAYOUT.length];
  const cycle = Math.floor(index / BOARD_LAYOUT.length);
  return {
    x: base.x + cycle * 34,
    y: base.y + cycle * 26,
    rotation: base.rotation + ((cycle % 3) - 1) * 0.6,
  };
}

// ─── Shared UI components ─────────────────────────────────────────────────────

// Step dots — active dot is orange (#FF7237) per diff
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 6, borderRadius: 99, transition: "all 0.3s", width: i + 1 === current ? 24 : 8, background: i + 1 <= current ? ORANGE : "rgba(255,255,255,0.2)" }} />
      ))}
    </div>
  );
}

// FormInput — radius 4, Figma Sans Text font (diff #28 #29)
function FormInput({ value, onChange, placeholder, type = "text", icon }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string; icon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focused ? ORANGE : "#666", pointerEvents: "none" }}>{icon}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", paddingLeft: icon ? 44 : 16, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
          borderRadius: 4, // diff #28 — was 12
          fontSize: 14, outline: "none", boxSizing: "border-box" as const,
          background: focused ? "#2e2e2e" : SURFACE,
          color: "#fff",
          border: `2px solid ${focused ? ORANGE : "transparent"}`,
          fontFamily: F, // diff #29 — Figma Sans Text
          transition: "all 0.15s",
        }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// PrimaryBtn — orange bg, radius 4, dark text (diff #3 #10 #11 #30)
function PrimaryBtn({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <motion.button onClick={onClick} disabled={!!disabled}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{
        width: "100%", padding: "16px 0",
        borderRadius: 4,
        fontSize: 14, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: disabled ? "default" : "pointer",
        background: ORANGE,
        color: DARK,
        opacity: disabled ? 0.45 : 1,
        fontFamily: FB,
      }}>
      {children}
    </motion.button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

type View = "welcome" | "form" | "canvas" | "admin";

export default function App() {
  const [view, setView]           = useState<View>(() => window.location.pathname === "/admin" ? "admin" : "welcome");
  const [step, setStep]           = useState(1);
  const [cards, setCards]         = useState<VCardData[]>(EXISTING_CARDS);
  const [resolvedBets, setResolvedBets] = useState<string[]>(RESOLVED_BETS);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminSaving, setAdminSaving] = useState(false);
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterOpen, setFilterOpen]       = useState(false);
  const [skillsCard, setSkillsCard]       = useState<Omit<VCardData, "x"|"y"|"rotation"> | null>(null);
  const [betDetailCard, setBetDetailCard] = useState<VCardData | null>(null);
  const [decorateModal, setDecorateModal] = useState<"color" | "sticker" | null>(null);
  const [stackDir, setStackDir]           = useState(0); // 1=forward -1=backward
  const [viewMode, setViewMode]         = useState<"board" | "stack" | "insights" | "bets" | "resources">("board");
  const [stackIndex, setStackIndex]     = useState(0);

  const [name, setName]             = useState("");
  const [photo, setPhoto]           = useState<string | null>(null);
  const [photoFile, setPhotoFile]   = useState<File | null>(null);
  const [email, setEmail]           = useState("");
  const [profession, setProfession] = useState("");
  const [interests, setInterests]   = useState<string[]>([]);
  const [skills, setSkills]         = useState<string[]>([]);
  const [futureInterests, setFutureInterests] = useState<string[]>([]);
  const [futureBets, setFutureBets] = useState<string[]>([]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [cardBg, setCardBg]         = useState(BG_PALETTE[0]);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const fileRef      = useRef<HTMLInputElement>(null);
  const cardEditorRef = useRef<HTMLDivElement>(null);

  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPhotoFile(f);
    const r = new FileReader(); r.onload = ev => setPhoto(ev.target?.result as string); r.readAsDataURL(f);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    const loadParticipants = async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("event_id", EVENT_ID)
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        setSaveError("Non riesco a caricare la board live. Controlla la configurazione Supabase.");
        return;
      }

      setCards((data as ParticipantRow[]).map(rowToCard));
    };

    const loadResults = async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("future_bets")
        .eq("event_id", RESULTS_EVENT_ID)
        .order("created_at", { ascending: false })
        .limit(1);

      if (cancelled || error) return;
      const latest = data?.[0] as Pick<ParticipantRow, "future_bets"> | undefined;
      if (latest?.future_bets) setResolvedBets(latest.future_bets);
    };

    void loadParticipants();
    void loadResults();

    const participantChannel = supabase
      .channel(`participants:${EVENT_ID}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participants", filter: `event_id=eq.${EVENT_ID}` },
        payload => {
          const card = rowToCard(payload.new as ParticipantRow);
          setCards(prev => prev.some(existing => existing.id === card.id) ? prev : [...prev, card]);
        }
      )
      .subscribe();

    const resultsChannel = supabase
      .channel(`future-bet-results:${EVENT_ID}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participants", filter: `event_id=eq.${RESULTS_EVENT_ID}` },
        payload => {
          const row = payload.new as ParticipantRow;
          setResolvedBets(row.future_bets || []);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(participantChannel);
      void supabase.removeChannel(resultsChannel);
    };
  }, []);

  const addSticker = (type: string) => {
    const st = STICKER_MAP[type]; if (!st) return;
    setPlacedStickers(prev => [...prev, { instanceId: `${type}-${Date.now()}`, type, scale: 1, rotation: (Math.random() - 0.5) * 20, x: 10 + Math.random() * (CW - st.w - 20), y: 6 + Math.random() * (HH - st.h - 12) }]);
  };

  const removeSticker = (id: string) => setPlacedStickers(p => p.filter(s => s.instanceId !== id));
  const moveSticker   = (id: string, x: number, y: number) => setPlacedStickers(p => p.map(s => s.instanceId === id ? { ...s, x, y } : s));
  const scaleSticker  = (id: string, f: number)            => setPlacedStickers(p => p.map(s => s.instanceId === id ? { ...s, scale: Math.min(2.5, Math.max(0.35, s.scale * f)) } : s));
  const rotateSticker = (id: string, degrees: number)      => setPlacedStickers(p => p.map(s => s.instanceId === id ? { ...s, rotation: s.rotation + degrees } : s));

  const uploadPhoto = useCallback(async (participantId: string) => {
    if (!supabase || !photoFile) return photo;

    const ext = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${EVENT_ID}/${participantId}.${ext}`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, photoFile, { contentType: photoFile.type || "image/jpeg" });

    if (error) throw error;

    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, [photo, photoFile]);

  const handleJoin = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const id = crypto.randomUUID();
      const nextIndex = cards.length;
      const pose = boardPose(nextIndex);
      const photoUrl = await uploadPhoto(id);
      const nextCard: VCardData = {
        id,
        name: name.trim(),
        photo: photoUrl,
        email: email.trim(),
        profession: profession.trim(),
        interests,
        skills,
        futureInterests,
        futureBets,
        placedStickers,
        accentColor: cardBg,
        cardBg,
        ...pose,
      };

      if (supabase) {
        const { error } = await supabase.from("participants").insert(cardToInsert(nextCard));
        if (error) throw error;
      }

      setCards(prev => prev.some(existing => existing.id === nextCard.id) ? prev : [...prev, nextCard]);
      setView("canvas");
    } catch (error) {
      const message = typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message)
        : "Non riesco a salvare la card. Riprova tra poco.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, cards.length, uploadPhoto, name, photo, email, profession, interests, skills, futureInterests, futureBets, placedStickers, cardBg]);

  const saveResolvedBets = useCallback(async () => {
    if (adminSaving) return;
    setAdminSaving(true);
    setAdminMessage(null);

    try {
      if (!supabase) {
        setAdminMessage("Supabase non è configurato: posso mostrare la selezione, ma non salvarla online.");
        return;
      }

      const resultCard: VCardData = {
        id: crypto.randomUUID(),
        name: "Future Bets Results",
        photo: null,
        email: "admin@config.local",
        profession: "Admin",
        interests: [],
        skills: [],
        futureInterests: [],
        futureBets: resolvedBets,
        placedStickers: [],
        accentColor: ORANGE,
        cardBg: ORANGE,
        x: 0,
        y: 0,
        rotation: 0,
      };

      const { error } = await supabase.from("participants").insert(cardToInsert(resultCard, RESULTS_EVENT_ID));
      if (error) throw error;
      setAdminMessage("Classifica aggiornata. La board usa già queste feature come risultati ufficiali.");
    } catch (error) {
      const message = typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message)
        : "Non riesco a salvare i risultati. Riprova tra poco.";
      setAdminMessage(message);
    } finally {
      setAdminSaving(false);
    }
  }, [adminSaving, resolvedBets]);

  const resetForm = () => {
    setStep(1); setName(""); setPhoto(null); setPhotoFile(null); setEmail(""); setProfession("");
    setInterests([]); setSkills([]); setFutureInterests([]); setFutureBets([]); setPlacedStickers([]); setCardBg(BG_PALETTE[0]);
    if (!isSupabaseConfigured) setCards(EXISTING_CARDS);
    setFilterSkills([]);
  };

  const TOTAL = 7;
  const slide = { initial: { opacity: 0, x: 28 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -28 }, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] as number[] } };

  // heading style — diff #19 #20 #21 #24 #26 #32
  const H2 = {
    fontSize: 48,
    fontWeight: 400,           // diff #24 — weight removed
    color: "#D9D9D9",          // diff #4
    letterSpacing: "-1.44px",  // -3% of 48px
    lineHeight: "45px",
    marginBottom: 14,
    fontFamily: F,             // diff #26 — Figma Sans Text
    textBoxTrim: "trim-both",  // diff #32
    textBoxEdge: "cap alphabetic",
  } as React.CSSProperties;

  // subtitle style — diff #22 #23 #25 #27 #33
  const SUB = {
    fontSize: 20,
    fontWeight: 400,
    color: "#fff",             // diff #5
    letterSpacing: "-0.6px",   // -3% of 20px
    lineHeight: 1,             // diff #23
    padding: "16px 0",         // diff #17
    fontFamily: F,             // diff #27 — Figma Sans Text
    textBoxTrim: "trim-both",  // diff #33
    textBoxEdge: "cap alphabetic",
  } as React.CSSProperties;

  if (view === "admin") return (
    <div style={{ width: "100vw", minHeight: "100dvh", overflow: "auto", background: DARK, color: "#fff", fontFamily: F, padding: "28px 20px 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button
          onClick={() => { window.history.pushState(null, "", "/"); setView("canvas"); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.64)", borderRadius: 99, padding: "10px 14px", fontSize: 13, fontWeight: 800, fontFamily: FB, cursor: "pointer", marginBottom: 28 }}>
          <ArrowLeft size={14} /> Vai alla board
        </button>

        <p style={{ margin: "0 0 12px", color: ORANGE, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12, fontWeight: 900, fontFamily: FB }}>
          Admin segreto
        </p>
        <h1 style={{ margin: "0 0 12px", color: "#D9D9D9", fontSize: 46, lineHeight: 0.96, letterSpacing: "-1.38px", fontWeight: 400, fontFamily: F }}>
          Risultati Figma Future Bets
        </h1>
        <p style={{ margin: "0 0 26px", color: "rgba(255,255,255,0.56)", fontSize: 16, lineHeight: 1.4, maxWidth: 560 }}>
          Dopo gli annunci, seleziona le feature uscite davvero. La leaderboard userà queste risposte come risultati ufficiali.
        </p>

        {!adminUnlocked ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (adminCode.trim() === ADMIN_CODE) {
                setAdminUnlocked(true);
                setAdminMessage(null);
              } else {
                setAdminMessage("Codice non corretto.");
              }
            }}
            style={{ background: "#2A2A2A", borderRadius: 10, padding: 18, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.54)", fontSize: 13, fontWeight: 800, fontFamily: FB, marginBottom: 10 }}>
              Codice admin
            </label>
            <input
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
              placeholder="Inserisci codice"
              type="password"
              autoFocus
              style={{ width: "100%", height: 54, borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0 14px", fontSize: 16, fontWeight: 800, fontFamily: FB, marginBottom: 14 }}
            />
            <PrimaryBtn>Entra</PrimaryBtn>
            {adminMessage && (
              <p style={{ margin: "14px 0 0", color: ORANGE, fontSize: 13, fontWeight: 800, fontFamily: FB }}>{adminMessage}</p>
            )}
          </form>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
              <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 13, lineHeight: 1.35 }}>
                {resolvedBets.length === 0 ? "Nessuna feature confermata." : `${resolvedBets.length} feature confermate.`}
              </div>
              <button
                onClick={() => setResolvedBets([])}
                style={{ border: "none", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.56)", borderRadius: 99, padding: "9px 12px", fontSize: 12, fontWeight: 800, fontFamily: FB, cursor: "pointer" }}>
                Reset
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              {FUTURE_BET_OPTIONS.map((bet) => {
                const active = resolvedBets.includes(bet.id);
                return (
                  <button
                    key={bet.id}
                    onClick={() => setResolvedBets(prev => active ? prev.filter(id => id !== bet.id) : [...prev, bet.id])}
                    style={{ textAlign: "left", borderRadius: 10, border: active ? `1.5px solid ${bet.color}` : "1.5px solid rgba(255,255,255,0.1)", background: active ? `${bet.color}24` : "#2A2A2A", color: "#fff", padding: 14, cursor: "pointer", boxShadow: active ? `0 0 0 1px ${bet.color}33` : "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                    <span style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? bet.color : "rgba(255,255,255,0.24)"}`, background: active ? bet.color : "transparent", flexShrink: 0, marginTop: 1 }} />
                      <span>
                        <span style={{ display: "block", fontSize: 15, fontWeight: 900, lineHeight: 1.12, fontFamily: FB }}>{bet.label}</span>
                        <span style={{ display: "block", marginTop: 6, color: "rgba(255,255,255,0.48)", fontSize: 12, lineHeight: 1.35 }}>{bet.description}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <PrimaryBtn onClick={saveResolvedBets} disabled={adminSaving}>
              {adminSaving ? "Salvo..." : "Salva risultati ufficiali"}
            </PrimaryBtn>
            {adminMessage && (
              <p style={{ margin: "14px 0 0", color: adminMessage.includes("aggiornata") ? "#14AE5C" : ORANGE, fontSize: 13, fontWeight: 800, lineHeight: 1.35, fontFamily: FB }}>
                {adminMessage}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ── WELCOME — render Figma Home import with interactive buttons overlaid ──

  if (view === "welcome") return (
    <div style={{ width: "100%", minHeight: "100dvh", display: "flex", justifyContent: "center", overflow: "hidden", background: ORANGE }}>
      <div style={{ position: "relative", width: "min(100vw, 393px)", height: "100dvh", overflow: "hidden", background: ORANGE }}>
        {/* Figma Home design (fills container) */}
        <HomeScreen />

        {/* Transparent click overlays matching Frame2 position in Home design. */}
        <div style={{ position: "absolute", top: "min(391px, calc(100dvh - 150px))", left: "50%", transform: "translateX(-50%)", width: "min(360px, calc(100% - 32px))", display: "flex", flexDirection: "column", gap: 16, zIndex: 10 }}>
          <button onClick={() => setView("form")}   style={{ height: 54.5, opacity: 0, cursor: "pointer", border: "none", width: "100%", background: "transparent" }} aria-label="Crea la tua card" />
          <button onClick={() => setView("canvas")} style={{ height: 54.5, opacity: 0, cursor: "pointer", border: "none", width: "100%", background: "transparent" }} aria-label="Vai alla board" />
        </div>
      </div>
    </div>
  );

  // ── FORM — dark theme (#1E1E1E background) ────────────────────────────────

  if (view === "form") return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: DARK, fontFamily: F }}>
      {/* Nav header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : setView("welcome")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 8px", color: "#888" }}>
          {step > 1 ? <ArrowLeft size={20} /> : <X size={20} />}
        </button>
        <StepDots current={step} total={TOTAL} />
        {/* diff #15 #16 — counter in Plus Jakarta Sans Bold, color #C0BFCC */}
        <span style={{ fontSize: 11, fontWeight: 700, color: "#C0BFCC", fontFamily: FB }}>{step}/{TOTAL}</span>
      </motion.div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px 40px" }}>
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          <AnimatePresence mode="wait">

            {/* Step 1 */}
            {step === 1 && (
              <motion.div key="s1" {...slide}>
                <h2 style={H2}>Partiamo da te</h2>
                <p style={SUB}>Scegli come vuoi apparire sulla board.</p>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => fileRef.current?.click()}
                      style={{ width: 96, height: 96, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden",
                        border: photo ? "none" : "2px dashed " + ORANGE,  // diff #7
                        background: photo ? "transparent" : "#353535",    // diff #6
                        cursor: "pointer" }}>
                      {photo
                        ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: ORANGE }}> {/* diff #8 #9 */}
                            <Camera size={22} /><span style={{ fontSize: 11, fontWeight: 700, fontFamily: F }}>Foto</span>
                          </div>
                      }
                    </button>
                    {photo && (
                      <button onClick={() => { setPhoto(null); setPhotoFile(null); }} style={{ position: "absolute", top: -4, right: -4, width: 24, height: 24, borderRadius: "50%", background: "#444", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12} />
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                  </div>
                </div>

                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#D9D9D9", marginBottom: 8, fontFamily: F }}>Nome o nickname *</label>
                <FormInput value={name} onChange={setName} placeholder="Come ti chiami?" />
                <div style={{ marginTop: 32 }}>
                  <PrimaryBtn onClick={() => name.trim().length >= 2 && setStep(2)} disabled={name.trim().length < 2}>
                    Avanti <ChevronRight size={17} />
                  </PrimaryBtn>
                </div>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div key="s2" {...slide}>
                <h2 style={H2}>Restiamo in contatto</h2>
                <p style={{ ...SUB, lineHeight: 1.15 }}>
                  Useremo la mail solo per mandarti il Notion con recap, link utili e materiali della serata.
                </p>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#D9D9D9", marginBottom: 8, fontFamily: F }}>La tua email *</label>
                <div style={{ marginBottom: 20 }}>
                  <FormInput value={email} onChange={setEmail} placeholder="nome@studio.com" type="email" icon={<Mail size={15} />} />
                  {email.trim().length > 0 && !isEmailValid && (
                    <p style={{ margin: "8px 0 0", color: "#ff8f70", fontSize: 12, lineHeight: 1.35, fontFamily: F }}>
                      Prova con una mail valida, così riusciamo a mandarti il Notion.
                    </p>
                  )}
                </div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#D9D9D9", marginBottom: 8, fontFamily: F }}>Cosa fai o cosa stai esplorando? *</label>
                <FormInput value={profession} onChange={setProfession} placeholder="UI Designer, studentessa, dev..." icon={<Briefcase size={15} />} />
                <div style={{ marginTop: 32 }}>
                  <PrimaryBtn onClick={() => isEmailValid && profession.trim().length >= 2 && setStep(3)} disabled={!isEmailValid || profession.trim().length < 2}>
                    Avanti <ChevronRight size={17} />
                  </PrimaryBtn>
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div key="s3" {...slide}>
                <h2 style={H2}>Il tuo mondo Figma</h2>
                <p style={SUB}>Cosa ti incuriosisce di più?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                  {INTEREST_OPTIONS.map((opt, i) => {
                    const sel = interests.includes(opt.id);
                    return (
                      <motion.button key={opt.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07, type: "spring", stiffness: 420, damping: 24 }}
                        whileTap={{ scale: 0.91 }}
                        onClick={() => setInterests(p => p.includes(opt.id) ? p.filter(x => x !== opt.id) : [...p, opt.id])}
                        style={{
                          padding: "9px 18px", borderRadius: 4, cursor: "pointer",
                          fontSize: 14, fontWeight: 700, fontFamily: FB,
                          border: sel ? "none" : "1.5px solid rgba(255,255,255,0.14)",
                          background: sel ? opt.color : "transparent",
                          color: sel ? "#fff" : "rgba(255,255,255,0.55)",
                        }}>
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
                <PrimaryBtn onClick={() => interests.length > 0 && setStep(4)} disabled={interests.length === 0}>
                  Avanti <ChevronRight size={17} />
                </PrimaryBtn>
              </motion.div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <motion.div key="s4" {...slide}>
                <h2 style={H2}>Cosa puoi condividere</h2>
                <p style={SUB}>Su quali temi puoi condividere la tua conoscenza?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                  {SKILL_OPTIONS.map((sk, i) => {
                    const sel = skills.includes(sk.id);
                    return (
                      <motion.button key={sk.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.055, type: "spring", stiffness: 420, damping: 24 }}
                        whileTap={{ scale: 0.91 }}
                        onClick={() => setSkills(p => p.includes(sk.id) ? p.filter(x => x !== sk.id) : [...p, sk.id])}
                        style={{
                          padding: "9px 18px", borderRadius: 4, cursor: "pointer",
                          fontSize: 14, fontWeight: 700, fontFamily: FB,
                          border: sel ? "none" : "1.5px solid rgba(255,255,255,0.14)",
                          background: sel ? sk.color : "transparent",
                          color: sel ? "#fff" : "rgba(255,255,255,0.55)",
                        }}>
                        {sk.label}
                      </motion.button>
                    );
                  })}
                </div>
                <PrimaryBtn onClick={() => skills.length > 0 && setStep(5)} disabled={skills.length === 0}>
                  Avanti <ChevronRight size={17} />
                </PrimaryBtn>
              </motion.div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <motion.div key="s5" {...slide} style={{ paddingBottom: 96 }}>
                <h2 style={H2}>Prossimi incontri</h2>
                <p style={SUB}>Che temi ti piacerebbe trovare più avanti?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                  {FUTURE_EVENT_OPTIONS.map((topic, i) => {
                    const sel = futureInterests.includes(topic.id);
                    return (
                      <motion.button key={topic.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.045, type: "spring", stiffness: 420, damping: 24 }}
                        whileTap={{ scale: 0.91 }}
                        onClick={() => setFutureInterests(p => p.includes(topic.id) ? p.filter(x => x !== topic.id) : [...p, topic.id])}
                        style={{
                          padding: "9px 18px", borderRadius: 4, cursor: "pointer",
                          fontSize: 14, fontWeight: 700, fontFamily: FB,
                          border: sel ? "none" : "1.5px solid rgba(255,255,255,0.14)",
                          background: sel ? topic.color : "transparent",
                          color: sel ? "#fff" : "rgba(255,255,255,0.55)",
                        }}>
                        {topic.label}
                      </motion.button>
                    );
                  })}
                </div>
                <PrimaryBtn onClick={() => futureInterests.length > 0 && setStep(6)} disabled={futureInterests.length === 0}>
                  Avanti <ChevronRight size={17} />
                </PrimaryBtn>
              </motion.div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <motion.div key="s6" {...slide} style={{ paddingBottom: 96 }}>
                <h2 style={H2}>Figma Future Bets</h2>
                <p style={SUB}>Scegli le prediction che ti sembrano più probabili. Ogni opzione ha un po' di contesto per orientarsi.</p>
                <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                  {FUTURE_BET_OPTIONS.map((bet, i) => {
                    const sel = futureBets.includes(bet.id);
                    const disabled = !sel && futureBets.length >= 5;
                    return (
                      <motion.button key={bet.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04, type: "spring", stiffness: 420, damping: 24 }}
                        whileTap={{ scale: 0.91 }}
                        onClick={() => setFutureBets(p => p.includes(bet.id) ? p.filter(x => x !== bet.id) : p.length >= 5 ? p : [...p, bet.id])}
                        style={{
                          padding: "13px 14px", borderRadius: 8, cursor: disabled ? "default" : "pointer",
                          border: sel ? `1.5px solid ${bet.color}` : "1.5px solid rgba(255,255,255,0.12)",
                          background: sel ? `${bet.color}24` : "rgba(255,255,255,0.03)",
                          color: disabled ? "rgba(255,255,255,0.24)" : "#fff",
                          opacity: disabled ? 0.6 : 1,
                          textAlign: "left",
                          boxShadow: sel ? `0 0 0 1px ${bet.color}33, inset 0 1px 0 rgba(255,255,255,0.08)` : "inset 0 1px 0 rgba(255,255,255,0.04)",
                        }}>
                        <span style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: sel ? bet.color : "rgba(255,255,255,0.16)", flexShrink: 0, marginTop: 4 }} />
                          <span>
                            <span style={{ display: "block", fontSize: 14, fontWeight: 800, lineHeight: 1.12, fontFamily: FB, color: sel ? "#fff" : "rgba(255,255,255,0.72)" }}>
                              {bet.label}
                            </span>
                            <span style={{ display: "block", marginTop: 6, fontSize: 12, lineHeight: 1.35, fontFamily: F, color: sel ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.42)" }}>
                              {bet.description}
                            </span>
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.35, margin: "0 0 32px", fontFamily: F }}>
                  Scegli fino a 5 previsioni. Dopo gli annunci vediamo chi ci ha preso di più.
                </p>
                <PrimaryBtn onClick={() => futureBets.length > 0 && setStep(7)} disabled={futureBets.length === 0}>
                  Avanti <ChevronRight size={17} />
                </PrimaryBtn>
              </motion.div>
            )}

            {/* Step 7 — decora la card */}
            {step === 7 && (
              <motion.div key="s7" {...slide} style={{ paddingBottom: 96 }}>
                <h2 style={H2}>Falla tua</h2>

                <div style={{ height: 24 }} />

                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
                >
                  <div ref={cardEditorRef} style={{ position: "relative" }}>
                    <PortraitCard
                      card={{ id: "preview", name, photo, email, profession, interests, skills, futureInterests, futureBets, placedStickers, accentColor: cardBg, cardBg }}
                      scale={1.3}
                      editMode placedStickers={placedStickers} containerRef={cardEditorRef}
                      onRemove={removeSticker} onMove={moveSticker} onScale={scaleSticker} onRotate={rotateSticker}
                    />
                  </div>
                </motion.div>

                <p style={{ textAlign: "center", fontSize: 12, color: "rgba(238,226,226,0.7)", marginBottom: 20, fontFamily: F }}>
                  Scegli un colore, aggiungi sticker e divertiti un po'.
                </p>
                {saveError && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "#ff8f70", lineHeight: 1.35, margin: "-8px 0 16px", fontFamily: F }}>
                    {saveError}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  <button onClick={() => setDecorateModal("color")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 20px", borderRadius: 176, height: 58, background: "#2A2A2A", border: "none", cursor: "pointer" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: cardBg, border: "3px solid rgba(255,255,255,0.85)", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
                    <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: FB, whiteSpace: "nowrap" as const }}>Colore</span>
                  </button>
                  <button onClick={() => setDecorateModal("sticker")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 20px", borderRadius: 176, height: 58, background: "#2A2A2A", border: "none", cursor: "pointer" }}>
                    <div style={{ width: 48, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <StickerEl id="arch" scale={0.5} />
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: FB, whiteSpace: "nowrap" as const }}>Sticker</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* CTA fissa in fondo — solo allo step 7 */}
      {step === 7 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px 32px", background: "linear-gradient(to top, #1E1E1E 60%, transparent)", zIndex: 20 }}>
          <button onClick={handleJoin} disabled={isSaving}
            style={{ width: "100%", padding: "16px 0", borderRadius: 4, fontSize: 15, fontWeight: 700, border: "none", cursor: isSaving ? "default" : "pointer", background: ORANGE, color: DARK, opacity: isSaving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: FB }}>
            <Sparkles size={18} /> {isSaving ? "La sto salvando..." : "Entra nella board"}
          </button>
        </div>
      )}

      {/* ── Color modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {decorateModal === "color" && (
          <>
            <motion.div key="cm-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDecorateModal(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 60 }}
            />
            <motion.div key="cm-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#242424", borderRadius: "20px 20px 0 0", padding: "12px 20px 44px", zIndex: 61 }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8b8a97", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 16, fontFamily: F }}>Colore sfondo</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {BG_PALETTE.map((c, i) => (
                  <motion.button key={c} onClick={() => setCardBg(c)}
                    aria-label={`Imposta sfondo ${i + 1}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 500, damping: 26 }}
                    whileTap={{ scale: 0.85 }}
                    style={{ width: 42, height: 42, borderRadius: "50%", background: c, border: cardBg === c ? "3px solid #fff" : "3px solid transparent", outline: cardBg === c ? "2px solid rgba(255,255,255,0.35)" : "none", outlineOffset: -4, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", flexShrink: 0 }}
                  />
                ))}
              </div>
              <button onClick={() => setDecorateModal(null)}
                style={{ marginTop: 24, width: "100%", padding: "14px 0", borderRadius: 4, background: ORANGE, color: DARK, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: FB }}>
                Applica
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Sticker modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {decorateModal === "sticker" && (
          <>
            <motion.div key="sm-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDecorateModal(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 60 }}
            />
            <motion.div key="sm-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#242424", borderRadius: "20px 20px 0 0", padding: "12px 20px 44px", zIndex: 61, maxHeight: "65vh", overflowY: "auto" }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8b8a97", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6, fontFamily: F }}>
                <Plus size={12} /> Aggiungi sticker
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, alignItems: "center", justifyItems: "center" }}>
                {STICKERS.map((st, i) => (
                  <motion.button key={st.id} title={st.label} aria-label={`Aggiungi sticker ${st.label}`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03, type: "spring", stiffness: 460, damping: 24 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => { addSticker(st.id); setDecorateModal(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
                      <StickerEl id={st.id} scale={0.52} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );

  // ── CANVAS ────────────────────────────────────────────────────────────────

  const toggleFilter = (id: string) =>
    setFilterSkills(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // OR filter: show cards that have at least one selected skill
  const visibleCards = filterSkills.length === 0
    ? cards
    : cards.filter(c => filterSkills.some(sk => c.skills.includes(sk)));
  const boardCards = visibleCards.map((card, i) => ({ ...card, ...boardPose(i) }));

  const futureStats = FUTURE_EVENT_OPTIONS
    .map(topic => {
      const people = cards.filter(card => card.futureInterests?.includes(topic.id));
      return { ...topic, count: people.length, people };
    })
    .filter(topic => topic.count > 0)
    .sort((a, b) => b.count - a.count);

  const betStats = FUTURE_BET_OPTIONS
    .map(bet => {
      const people = cards.filter(card => card.futureBets?.includes(bet.id));
      return { ...bet, count: people.length, people };
    })
    .filter(bet => bet.count > 0)
    .sort((a, b) => b.count - a.count);

  const betLeaderboard = cards
    .map(card => ({
      ...card,
      score: card.futureBets.filter(id => resolvedBets.includes(id)).length,
    }))
    .sort((a, b) => b.score - a.score);
  const betDetailCorrect = betDetailCard
    ? betDetailCard.futureBets.filter(id => resolvedBets.includes(id))
    : [];
  const betDetailWrong = betDetailCard
    ? betDetailCard.futureBets.filter(id => !resolvedBets.includes(id))
    : [];
  const betDetailMissed = betDetailCard
    ? resolvedBets.filter(id => !betDetailCard.futureBets.includes(id))
    : [];
  const getBetOption = (id: string) => FUTURE_BET_OPTIONS.find(bet => bet.id === id);
  const renderBetRows = (ids: string[], empty: string) => ids.length > 0 ? (
    <div style={{ display: "grid", gap: 8 }}>
      {ids.map(id => {
        const bet = getBetOption(id);
        if (!bet) return null;
        return (
          <div key={id} style={{ borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${bet.color}30`, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: bet.color, flexShrink: 0, marginTop: 4 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.14, color: "#fff", fontFamily: FB }}>{bet.label}</div>
                <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.35, color: "rgba(255,255,255,0.44)", fontFamily: F }}>{bet.description}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div style={{ borderRadius: 8, background: "rgba(255,255,255,0.05)", padding: 12, fontSize: 12, lineHeight: 1.35, color: "rgba(255,255,255,0.44)", fontFamily: F }}>
      {empty}
    </div>
  );

  // Clamp stack index when filter changes
  const safeStackIdx = visibleCards.length > 0 ? stackIndex % visibleCards.length : 0;
  const stackCard    = visibleCards[safeStackIdx] ?? null;

  const goNext = () => { setStackDir(1);  setStackIndex(i => (i + 1) % Math.max(1, visibleCards.length)); };
  const goPrev = () => { setStackDir(-1); setStackIndex(i => (i - 1 + Math.max(1, visibleCards.length)) % Math.max(1, visibleCards.length)); };

  // ── Shared chrome (toolbar + FABs + filter modal) ─────────────────────────

  const isPeopleView = viewMode === "board" || viewMode === "stack";
  const activeSection = isPeopleView ? "people" : viewMode;

  const SharedChrome = () => (
    <>
      {/* Toolbar */}
      <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40, display: "flex", alignItems: "center", gap: 8, padding: "8px 10px 8px 14px", borderRadius: 99, background: DARK, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: F }}>
          {visibleCards.length}{filterSkills.length > 0 ? `/${cards.length}` : ""} persone
        </span>
        <div style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: ORANGE, color: DARK, fontFamily: FB }}>Live</div>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Filtra per skill"
          style={{
            position: "relative",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: filterSkills.length > 0 ? ORANGE : "rgba(255,255,255,0.08)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: filterSkills.length > 0 ? DARK : "rgba(255,255,255,0.68)",
          }}>
          <SlidersHorizontal size={15} color={filterSkills.length > 0 ? DARK : "rgba(255,255,255,0.68)"} />
          {filterSkills.length > 0 && (
            <span style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#fff", color: DARK, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB, lineHeight: 1 }}>
              {filterSkills.length}
            </span>
          )}
        </button>
      </div>

      {isPeopleView && (
        <div style={{ position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)", zIndex: 39, width: 164, height: 42, borderRadius: 99, background: "rgba(30,30,30,0.92)", padding: 4, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", boxShadow: "0 10px 28px rgba(0,0,0,0.22)" }}>
          <motion.div
            aria-hidden
            animate={{ x: viewMode === "stack" ? 78 : 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            style={{ position: "absolute", top: 4, left: 4, width: 78, height: 34, borderRadius: 99, background: ORANGE }}
          />
          <button
            onClick={() => { setViewMode("board"); setStackIndex(0); }}
            aria-label="Vista board"
            style={{ position: "relative", zIndex: 1, border: "none", background: "transparent", color: viewMode === "board" ? DARK : "rgba(255,255,255,0.64)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 900, fontFamily: FB }}>
            <LayoutGrid size={14} /> Board
          </button>
          <button
            onClick={() => { setViewMode("stack"); setStackIndex(0); }}
            aria-label="Vista card"
            style={{ position: "relative", zIndex: 1, border: "none", background: "transparent", color: viewMode === "stack" ? DARK : "rgba(255,255,255,0.64)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 900, fontFamily: FB }}>
            <Layers size={14} /> Stack
          </button>
        </div>
      )}

      {/* Home button */}
      <button onClick={() => { setView("welcome"); resetForm(); }}
        style={{ position: "fixed", top: 20, left: 20, zIndex: 40, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700, border: "none", background: DARK, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontFamily: F }}>
        <ArrowLeft size={13} />
      </button>

      {/* Filter modal */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 50 }}
            />

            {/* Bottom sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#242424", borderRadius: "20px 20px 0 0", padding: "12px 20px 40px", zIndex: 51, maxHeight: "80vh", overflowY: "auto" }}
            >
              {/* Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />

              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 6, fontFamily: F }}>
                Trova persone affini
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20, fontFamily: F }}>
                Scegli una o più skill e guarda chi può darti una mano o fare due chiacchiere.
              </p>

              {/* Skill chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                {SKILL_OPTIONS.map(sk => {
                  const active = filterSkills.includes(sk.id);
                  return (
                    <button key={sk.id} onClick={() => toggleFilter(sk.id)}
                      style={{
                        padding: "9px 16px", borderRadius: 4, border: active ? "none" : "1.5px solid rgba(255,255,255,0.12)",
                        cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: FB,
                        background: active ? sk.color : "transparent",
                        color: active ? "#fff" : "rgba(255,255,255,0.55)",
                        transition: "all 0.15s",
                      }}>
                      {sk.label}
                    </button>
                  );
                })}
              </div>

              {/* CTA row */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setFilterSkills([]); }}
                  style={{ flex: 1, padding: "14px 0", borderRadius: 4, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: FB }}>
                  Togli filtri
                </button>
                <button onClick={() => setFilterOpen(false)}
                  style={{ flex: 2, padding: "14px 0", borderRadius: 4, background: ORANGE, color: DARK, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: FB }}>
                  Mostra{filterSkills.length > 0 ? ` (${filterSkills.length})` : ""}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Skill detail sheet */}
      <AnimatePresence>
        {skillsCard && (
          <>
            <motion.div
              key="skills-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSkillsCard(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.58)", zIndex: 54 }}
            />
            <motion.div
              key="skills-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#242424", borderRadius: "20px 20px 0 0", padding: "12px 20px 40px", zIndex: 55 }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.6px", fontFamily: F }}>
                    Cosa condivide {skillsCard.name}
                  </h2>
                  <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.35, color: "rgba(255,255,255,0.45)", fontFamily: F }}>
                    Tutti i temi su cui puoi chiedere dritte, esempi o una chiacchiera.
                  </p>
                </div>
                <button
                  onClick={() => setSkillsCard(null)}
                  aria-label="Chiudi"
                  style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                {skillsCard.skills.map(id => {
                  const sk = SKILL_OPTIONS.find(x => x.id === id);
                  return sk ? (
                    <span key={id} style={{ fontSize: 13, padding: "9px 12px", borderRadius: 6, fontWeight: 800, color: sk.color, background: sk.color + "16", border: `1px solid ${sk.color}45`, fontFamily: FB }}>
                      {sk.label}
                    </span>
                  ) : null;
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  const BottomNav = () => {
    const icon = (active: boolean) => active ? DARK : "rgba(255,255,255,0.72)";
    const circle = (active: boolean): React.CSSProperties => ({
      width: 54,
      height: 54,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      background: active ? ORANGE : "#2A2A2A",
      color: icon(active),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: active ? "0 8px 28px rgba(255,114,55,0.34)" : "none",
    });

    return (
      <div style={{ position: "fixed", bottom: "calc(18px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", width: "calc(100vw - 20px)", pointerEvents: "none" }}>
        <nav aria-label="Sezioni" style={{ height: 62, borderRadius: 99, background: "#2A2A2A", padding: 5, display: "grid", gridTemplateColumns: "repeat(4, 54px)", gap: 4, pointerEvents: "auto", boxShadow: "0 12px 34px rgba(0,0,0,0.28)" }}>
        <button
          onClick={() => setViewMode(viewMode === "stack" ? "stack" : "board")}
          aria-label="Mostra persone"
          style={circle(activeSection === "people")}>
          <LayoutGrid size={22} color={icon(activeSection === "people")} />
        </button>
        <button
          onClick={() => setViewMode("insights")}
          aria-label="Mostra insights"
          style={circle(activeSection === "insights")}>
          <Sparkles size={22} color={icon(activeSection === "insights")} />
        </button>
        <button
          onClick={() => setViewMode("bets")}
          aria-label="Mostra bets"
          style={circle(activeSection === "bets")}>
          <Trophy size={22} color={icon(activeSection === "bets")} />
        </button>
        <button
          onClick={() => setViewMode("resources")}
          aria-label="Mostra risorse"
          style={circle(activeSection === "resources")}>
          <BookOpen size={22} color={icon(activeSection === "resources")} />
        </button>
        </nav>
      </div>
    );
  };

  // ── INSIGHTS view ─────────────────────────────────────────────────────────

  if (viewMode === "insights") return (
    <div style={{ width: "100vw", minHeight: "100dvh", overflow: "auto", background: DARK, fontFamily: F, color: "#fff", padding: "104px 24px 112px" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 920, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, margin: "0 0 12px", fontFamily: FB }}>
          Prossimi incontri
        </p>
        <h2 style={{ fontSize: 44, lineHeight: 0.96, letterSpacing: "-1.32px", fontWeight: 400, color: "#D9D9D9", margin: "0 0 14px", fontFamily: F }}>
          Argomenti che vi interessano per i prossimi incontri
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.35, color: "rgba(255,255,255,0.56)", maxWidth: 520, margin: "0 0 30px", fontFamily: F }}>
          Qui vedi cosa incuriosisce il gruppo, così i prossimi talk e workshop nascono da interessi reali.
        </p>

        {futureStats.length === 0 ? (
          <div style={{ borderRadius: 8, background: "#2A2A2A", padding: 24, color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
            Ancora nessun tema raccolto. Appena arrivano le card, qui compare il quadro.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {futureStats.map((topic, i) => {
              const pct = Math.round((topic.count / Math.max(1, cards.length)) * 100);
              return (
                <motion.div key={topic.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.045, type: "spring", stiffness: 300, damping: 28 }}
                  style={{ background: "#2A2A2A", borderRadius: 8, padding: 16, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: FB }}>{topic.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{topic.count} persone curiose</div>
                    </div>
                    <div style={{ minWidth: 46, height: 46, borderRadius: 6, background: topic.color, color: topic.color === "#F9DC1F" ? DARK : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, fontFamily: FB }}>
                      {pct}%
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: topic.color }} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {topic.people.slice(0, 5).map(person => (
                      <span key={person.id} style={{ fontSize: 11, fontWeight: 700, padding: "5px 8px", borderRadius: 4, color: "rgba(255,255,255,0.76)", background: "rgba(255,255,255,0.07)", fontFamily: FB }}>
                        {person.name}
                      </span>
                    ))}
                    {topic.people.length > 5 && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 8px", borderRadius: 4, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)", fontFamily: FB }}>
                        +{topic.people.length - 5}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />

      {SharedChrome()}
    </div>
  );

  // ── RESOURCES view ───────────────────────────────────────────────────────

  if (viewMode === "resources") return (
    <div style={{ width: "100vw", minHeight: "100dvh", overflow: "auto", background: DARK, fontFamily: F, color: "#fff", padding: "104px 24px 112px" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, margin: "0 0 12px", fontFamily: FB }}>
          Risorse
        </p>
        <h2 style={{ fontSize: 44, lineHeight: 0.96, letterSpacing: "-1.32px", fontWeight: 400, color: "#D9D9D9", margin: "0 0 14px", fontFamily: F }}>
          Tutto quello che ci portiamo a casa
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.35, color: "rgba(255,255,255,0.56)", maxWidth: 560, margin: "0 0 30px", fontFamily: F }}>
          Qui puoi raccogliere i Notion del post-evento: glossario, timeline degli annunci, recap e materiali utili.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {RESOURCE_LINKS.map((resource, i) => {
            const hasLink = resource.href !== "#";
            return (
              <motion.article
                key={resource.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.045, type: "spring", stiffness: 300, damping: 28 }}
                style={{ minHeight: 210, borderRadius: 8, background: "#2A2A2A", padding: 18, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: `${resource.color}24`, color: resource.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <BookOpen size={19} />
                  </div>
                  <h3 style={{ margin: "0 0 9px", fontSize: 21, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.63px", color: "#fff", fontFamily: FB }}>
                    {resource.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.38, color: "rgba(255,255,255,0.48)", fontFamily: F }}>
                    {resource.description}
                  </p>
                </div>
                <a
                  href={resource.href}
                  target={hasLink ? "_blank" : undefined}
                  rel={hasLink ? "noreferrer" : undefined}
                  onClick={(event) => {
                    if (!hasLink) event.preventDefault();
                  }}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 42, borderRadius: 6, background: hasLink ? resource.color : "rgba(255,255,255,0.08)", color: hasLink && resource.color !== "#F9DC1F" ? "#fff" : "rgba(255,255,255,0.42)", textDecoration: "none", fontSize: 13, fontWeight: 900, fontFamily: FB, cursor: hasLink ? "pointer" : "default" }}>
                  {hasLink ? resource.label : "Link Notion da aggiungere"}
                  {hasLink && <ChevronRight size={15} />}
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>

      <BottomNav />

      {SharedChrome()}
    </div>
  );

  // ── FUTURE BETS view ─────────────────────────────────────────────────────

  if (viewMode === "bets") return (
    <div style={{ width: "100vw", minHeight: "100dvh", overflow: "auto", background: DARK, fontFamily: F, color: "#fff", padding: "104px 24px 112px" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, margin: "0 0 12px", fontFamily: FB }}>
          Figma Future Bets
        </p>
        <h2 style={{ fontSize: 44, lineHeight: 0.96, letterSpacing: "-1.32px", fontWeight: 400, color: "#D9D9D9", margin: "0 0 14px", fontFamily: F }}>
          Le scommesse sulle prossime novità
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.35, color: "rgba(255,255,255,0.56)", maxWidth: 560, margin: "0 0 30px", fontFamily: F }}>
          Ogni partecipante sceglie le feature che secondo lui Figma lancerà quest'anno. Dopo gli annunci, basta segnare quelle corrette e la classifica diventa il premio finale.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 26 }}>
          {betStats.length === 0 ? (
            <div style={{ borderRadius: 8, background: "#2A2A2A", padding: 24, color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              Ancora nessuna previsione. Appena qualcuno punta, la vedrai qui.
            </div>
          ) : betStats.map((bet, i) => {
            const pct = Math.round((bet.count / Math.max(1, cards.length)) * 100);
            return (
              <motion.div key={bet.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.045, type: "spring", stiffness: 300, damping: 28 }}
                style={{ background: "#2A2A2A", borderRadius: 8, padding: 16, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.15, fontFamily: FB }}>{bet.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6, lineHeight: 1.35 }}>{bet.description}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>{bet.count} voti</div>
                  </div>
                  <div style={{ minWidth: 46, height: 46, borderRadius: 6, background: bet.color, color: bet.color === "#F9DC1F" ? DARK : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, fontFamily: FB }}>
                    {pct}%
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: bet.color }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {bet.people.slice(0, 5).map(person => (
                    <span key={person.id} style={{ fontSize: 11, fontWeight: 700, padding: "5px 8px", borderRadius: 4, color: "rgba(255,255,255,0.76)", background: "rgba(255,255,255,0.07)", fontFamily: FB }}>
                      {person.name}
                    </span>
                  ))}
                  {bet.people.length > 5 && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 8px", borderRadius: 4, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)", fontFamily: FB }}>
                      +{bet.people.length - 5}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ background: "#2A2A2A", borderRadius: 8, padding: 18, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.66px", color: "#fff", fontFamily: FB }}>Classifica finale</h3>
              <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: 1.35, color: "rgba(255,255,255,0.46)" }}>
                Si attiva quando aggiorni la lista delle prediction indovinate.
              </p>
            </div>
            <div style={{ borderRadius: 99, background: "rgba(255,114,55,0.14)", color: ORANGE, padding: "7px 10px", fontSize: 11, fontWeight: 800, fontFamily: FB }}>
              {resolvedBets.length === 0 ? "In attesa" : `${resolvedBets.length} confermate`}
            </div>
          </div>

          {resolvedBets.length === 0 ? (
            <div style={{ borderRadius: 6, background: "rgba(255,255,255,0.05)", padding: 14, fontSize: 13, lineHeight: 1.35, color: "rgba(255,255,255,0.56)" }}>
              Dopo Config inseriamo nel codice le feature annunciate davvero e questa card mostra automaticamente chi ha indovinato di più.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {betLeaderboard.slice(0, 8).map((person, i) => (
                <button
                  key={person.id}
                  onClick={() => setBetDetailCard(person)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 6, border: "none", background: "rgba(255,255,255,0.05)", padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? ORANGE : "rgba(255,255,255,0.1)", color: i === 0 ? DARK : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, fontFamily: FB }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: FB }}>{person.name}</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: ORANGE, fontFamily: FB }}>
                    {person.score}
                    <ChevronRight size={14} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {betDetailCard && (
          <>
            <motion.div
              key="bet-detail-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBetDetailCard(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)", zIndex: 54 }}
            />
            <motion.div
              key="bet-detail-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxHeight: "82vh", overflowY: "auto", background: "#242424", borderRadius: "20px 20px 0 0", padding: "12px 20px calc(34px + env(safe-area-inset-bottom, 0px))", zIndex: 55 }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
                <div>
                  <p style={{ margin: "0 0 8px", color: ORANGE, fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FB }}>
                    Dettaglio prediction
                  </p>
                  <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1, fontWeight: 900, color: "#fff", letterSpacing: "-0.72px", fontFamily: FB }}>
                    {betDetailCard.name}
                  </h3>
                  <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.48)", fontSize: 13, lineHeight: 1.35 }}>
                    {betDetailCorrect.length} azzeccate su {resolvedBets.length} feature confermate.
                  </p>
                </div>
                <button
                  onClick={() => setBetDetailCard(null)}
                  aria-label="Chiudi"
                  style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "grid", gap: 18 }}>
                <section>
                  <h4 style={{ margin: "0 0 9px", fontSize: 13, fontWeight: 900, color: "#14AE5C", fontFamily: FB }}>
                    Ha indovinato
                  </h4>
                  {renderBetRows(betDetailCorrect, "Per ora non ha indovinato nessuna feature uscita.")}
                </section>
                <section>
                  <h4 style={{ margin: "0 0 9px", fontSize: 13, fontWeight: 900, color: ORANGE, fontFamily: FB }}>
                    Aveva puntato su queste, ma non sono uscite
                  </h4>
                  {renderBetRows(betDetailWrong, "Non aveva scelto feature rimaste fuori dagli annunci.")}
                </section>
                <section>
                  <h4 style={{ margin: "0 0 9px", fontSize: 13, fontWeight: 900, color: "rgba(255,255,255,0.56)", fontFamily: FB }}>
                    Sono uscite, ma non le aveva scelte
                  </h4>
                  {renderBetRows(betDetailMissed, "Ha scelto tutte le feature che poi sono state confermate.")}
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />

      {SharedChrome()}
    </div>
  );

  // ── BOARD view ────────────────────────────────────────────────────────────

  if (viewMode === "board") return (
    <div style={{ width: "100vw", height: "100dvh", overflow: "auto", background: DARK, fontFamily: F }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "relative", width: 1500, height: 900, minWidth: "100vw", minHeight: "100dvh" }}>
        <AnimatePresence>
          {boardCards.map((card, i) => <CanvasCard key={card.id} card={card} isNew={card.id === "new"} index={i} onShowAllSkills={setSkillsCard} />)}
        </AnimatePresence>
      </div>
      <BottomNav />
      {SharedChrome()}
    </div>
  );

  // ── STACK view ────────────────────────────────────────────────────────────
  // Card scales: front 1.34, mid 1.28, back 1.22 (per diff #1-#8, 338/252≈1.34)

  const S_FRONT = 1.34;
  const S_MID   = 1.28;
  const S_BACK  = 1.22;

  return (
    <div style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: DARK, fontFamily: F, display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Card deck — fills available space between the top controls and bottom tabs */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 116 }}>
        {visibleCards.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            Non ci sono card con questi filtri. Prova ad allargarli un po'.
          </div>
        ) : (
          <div style={{ position: "relative", width: CW * S_FRONT, height: CH * S_FRONT }}>
            {/* Behind cards — smaller, offset, faded */}
            {[2, 1].map(offset => {
              const scale = offset === 2 ? S_BACK : S_MID;
              const idx   = (safeStackIdx + offset) % visibleCards.length;
              const c     = visibleCards[idx];
              if (!c || idx === safeStackIdx) return null;
              return (
                <div key={`behind-${offset}`} style={{
                  position: "absolute",
                  top: offset * 14,
                  left: ((S_FRONT - scale) * CW) / 2 + offset * 10,
                  opacity: 1 - offset * 0.28,
                  zIndex: 3 - offset,
                  pointerEvents: "none",
                }}>
                  <PortraitCard card={c} scale={scale} />
                </div>
              );
            })}

            {/* Front card — direction-aware entrance + swipeable */}
            <AnimatePresence mode="popLayout" custom={stackDir}>
              {stackCard && (
                <motion.div
                  key={stackCard.id}
                  custom={stackDir}
                  variants={{
                    enter:  (d: number) => ({ x: d * 120, opacity: 0, scale: 0.92 }),
                    center: { x: 0, opacity: 1, scale: 1 },
                    exit:   (d: number) => ({ x: d * -120, opacity: 0, scale: 0.88 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  style={{ position: "absolute", top: 0, left: 0, zIndex: 10, cursor: "grab", touchAction: "none" }}
                  drag="x"
                  dragConstraints={{ left: -180, right: 180 }}
                  dragElastic={0.12}
                  whileDrag={{ scale: 1.02 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) goNext();
                    else if (info.offset.x > 70) goPrev();
                  }}
                >
                  <PortraitCard card={stackCard} scale={S_FRONT} onShowAllSkills={setSkillsCard} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Counter only — no arrows (diff #205) */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: F, letterSpacing: "-0.2px" }}>
          {safeStackIdx + 1}{" "}
          <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
          {" "}{visibleCards.length}
        </span>
      </div>

      {/* Spacer for fixed bottom buttons */}
      <div style={{ height: 80 }} />

      <BottomNav />

      {SharedChrome()}
    </div>
  );
}
