export type GameStage =
  | 'PROLOGUE'          // Phase 0: Interactive Story Dialogue with Fortune Teller
  | 'INPUT_FORM'        // Phase 1: Altar Quick Focus Chips & Optional Name/Question
  | 'SHUFFLING'         // Phase 2: Card Fan Arc Carousel
  | 'CARD_LOCKING'      // Phase 2b: Card selection docking into slot
  | 'FETCHING_READING'  // Phase 3: Mascot Mind Reading Transition & Gemini AI Call
  | 'REVEALING_CARDS'   // Phase 4: Manual Tap-to-Reveal 3 cards
  | 'CARDS_REVEALED_HOLD' // Phase 4b: Hold gate showing 3 open cards + "Baca Penjelasan Lengkap"
  | 'READING_COMPLETE'; // Phase 5: Unified Reading Sheet & Share Card

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
