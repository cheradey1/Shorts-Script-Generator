export type Trigger = 
  | 'hook' 
  | 'shock' 
  | 'context' 
  | 'cta' 
  | 'loop_hint' 
  | 'curiosity_question'
  | 'jump_cut'
  | 'music_cue'
  | 'text_overlay_bold'
  | 'poignant_pov'
  | 'surprise_reveal'
  | 'sound_effect'
  | 'pattern_interrupt'
  | 'quick_zoom'
  | 'point_of_view_shot'
  | 'satisfying_visual'
  | 'callback_joke'
  | 'foreshadowing'
  | 'visual_metaphor';

export interface TimelineEvent {
  sec_start: number;
  sec_end: number;
  visual: string;
  audio: string;
  caption: string;
  triggers: Trigger[];
  suggested_triggers?: Trigger[];
  isWeak?: boolean;
}

export interface LoopabilityAnalysis {
  score: number;
  analysis: string;
  transition_point_analysis: {
    last_event_visual: string;
    first_event_visual: string;
    visual_match_score: number;
    last_event_audio: string;
    first_event_audio: string;
    audio_match_score: number;
    suggestion_for_improvement: string;
  };
}

export interface ScriptVariant {
  variant_id: string;
  duration_s: number;
  timeline: TimelineEvent[];
  sources?: { uri: string; title: string; }[];
  loopability_analysis: LoopabilityAnalysis;
}

export interface MarkovAnalysisResult {
    predicted_P_stay: number[];
    predicted_finish_rate: number;
    predicted_replay_score: number;
}

export interface Trend {
  title: string;
  description: string;
  niche: string;
}

export interface TrendsData {
  youtube_shorts: Trend[];
  tiktok: Trend[];
  google_trends: Trend[];
}

export interface VideoGenerationState {
  isLoading: boolean;
  error: string | null;
  videoUrl: string | null;
}