import { ScriptVariant, TrendsData, TimelineEvent } from '../types';

// Mock data for development
const mockScripts: ScriptVariant[] = [
  {
    variant_id: 'mock-1',
    duration_s: 30,
    timeline: [
      {
        sec_start: 0,
        sec_end: 5,
        visual: 'Wide shot of city',
        audio: 'Upbeat music starts',
        caption: 'Here we go',
        triggers: ['hook'],
        suggested_triggers: ['music_cue'],
        isWeak: false,
      },
      {
        sec_start: 5,
        sec_end: 15,
        visual: 'Close-up action scene',
        audio: 'Sound effects',
        caption: 'Something happens',
        triggers: ['shock'],
        suggested_triggers: ['jump_cut'],
        isWeak: false,
      },
      {
        sec_start: 15,
        sec_end: 30,
        visual: 'Final reveal',
        audio: 'Music crescendo',
        caption: 'The end',
        triggers: ['cta'],
        suggested_triggers: [],
        isWeak: false,
      },
    ],
    loopability_analysis: {
      score: 8,
      analysis: 'Good loop transition',
      transition_point_analysis: {
        last_event_visual: 'Final reveal',
        first_event_visual: 'Wide shot of city',
        visual_match_score: 8,
        last_event_audio: 'Music crescendo',
        first_event_audio: 'Upbeat music starts',
        audio_match_score: 7,
        suggestion_for_improvement: 'N/A',
      }
    }
  },
];

const mockTrends: TrendsData = {
  youtube_shorts: [
    { title: 'Viral Challenge 2025', description: 'Latest trending challenge', niche: 'entertainment' },
    { title: 'Life Hack Compilation', description: 'Quick useful tips', niche: 'lifestyle' },
  ],
  tiktok: [
    { title: 'Dance Trend', description: 'Popular dance moves', niche: 'entertainment' },
    { title: 'Comedy Sketches', description: 'Funny short clips', niche: 'comedy' },
  ],
  google_trends: [
    { title: 'AI Technology', description: 'Latest AI innovations', niche: 'technology' },
    { title: 'Sustainable Living', description: 'Eco-friendly tips', niche: 'lifestyle' },
  ],
};

export async function generateScript(prompt: string, language: string = 'en'): Promise<ScriptVariant[]> {
  try {
    return mockScripts;
  } catch (error: any) {
    console.error('Generation error:', error);
    throw error;
  }
}

export async function generateScripts(
  idea: string,
  niche: string[],
  contentTypes: string[],
  language: string,
  optimizeForLoop: boolean,
  visualStyle: string[]
): Promise<ScriptVariant[]> {
  try {
    return mockScripts;
  } catch (error: any) {
    console.error('Generation error:', error);
    throw error;
  }
}

export async function fetchTrends(languageCode: string): Promise<TrendsData> {
  try {
    return mockTrends;
  } catch (error: any) {
    console.error('Fetch trends error:', error);
    throw error;
  }
}

export async function generateVideoFromScript(script: ScriptVariant): Promise<string> {
  try {
    return 'https://example.com/video.mp4';
  } catch (error: any) {
    console.error('Video generation error:', error);
    throw error;
  }
}

export async function enhanceVisualDescription(
  event: TimelineEvent,
  scriptContext: ScriptVariant,
  languageName: string,
  enhancementType: 'weakness' | 'cinematic'
): Promise<string> {
  try {
    return event.visual + ' (enhanced)';
  } catch (error: any) {
    console.error('Enhancement error:', error);
    throw error;
  }
}

export async function refineTimelineEvent(
  event: TimelineEvent,
  scriptContext: ScriptVariant,
  instruction: string,
  languageName: string
): Promise<TimelineEvent> {
  try {
    return { ...event, visual: event.visual + ' (refined)' };
  } catch (error: any) {
    console.error('Refinement error:', error);
    throw error;
  }
}
