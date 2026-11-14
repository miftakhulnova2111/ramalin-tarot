export type GameStage =
  | 'INPUT_FORM'        // Phase 0: Name & Question Input (Akinator Welcome)
  | 'SHUFFLING'         // Phase 1: Card Fan Arc Carousel (Top slots, bottom button)
  | 'CARD_LOCKING'      // Phase 1b: Zoom, Evil Laugh, and swoop UP to slot
  | 'FETCHING_READING'  // Phase 2: Connecting with Gemini Knowledge Base
  | 'REVEALING_CARDS'   // Phase 2b: Sequential 3D Card Flips
  | 'CARDS_REVEALED_HOLD' // Phase 2c: Hold gate showing 3 open cards + "Baca Penjelasannya" CTA
  | 'READING_COMPLETE'; // Phase 3: Unified Reading Sheet & Share Card

export interface TarotCardData {
  id: number;
  slug: string;
  name: string;
  name_id: string;
  arcana: 'Major' | 'Minor';
  suit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles' | null;
  image: string;
  keywords_upright: string[];
  keywords_reversed: string[];
  fallback_upright: string;
  fallback_reversed: string;
}

export interface SelectedCard extends TarotCardData {
  positionIndex: 0 | 1 | 2;
  positionLabel: 'Past' | 'Present' | 'Future';
  isReversed: boolean;
  isFlipped: boolean;
}

export interface CardReadingItem {
  position: 'Past' | 'Present' | 'Future';
  card_title: string;
  interpretation: string;
}

export interface GeminiReadingResponse {
  greeting: string;
  readings: CardReadingItem[];
  final_advice: string;
  share_summary: string;
}

export interface SavedReadingSession {
  id: string;
  timestamp: number;
  userName: string;
  question: string;
  cards: SelectedCard[];
  reading: GeminiReadingResponse;
}
