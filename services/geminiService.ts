import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptVariant, TrendsData, TimelineEvent } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('GEMINI_API_KEY not configured');
}

const client = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = client ? client.getGenerativeModel({ model: 'gemini-pro' }) : null;

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
    if (!model) {
      console.warn('Gemini model not available, using mock data');
      return mockScripts;
    }

    const systemPrompt = `You are a professional short-form video script writer. Generate a detailed script for a ${language} short-form video (YouTube Shorts/TikTok style, 30 seconds max).

Return a valid JSON object with this structure:
{
  "variant_id": "generated-1",
  "duration_s": 30,
  "timeline": [
    {
      "sec_start": 0,
      "sec_end": 10,
      "visual": "description of visual content",
      "audio": "audio description or dialogue",
      "caption": "text overlay",
      "triggers": ["hook"],
      "suggested_triggers": [],
      "isWeak": false
    }
  ],
  "loopability_analysis": {
    "score": 8,
    "analysis": "how well this loops",
    "transition_point_analysis": {
      "last_event_visual": "final visual",
      "first_event_visual": "first visual",
      "visual_match_score": 8,
      "last_event_audio": "final audio",
      "first_event_audio": "first audio",
      "audio_match_score": 7,
      "suggestion_for_improvement": "any improvements"
    }
  }
}`;

    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `${systemPrompt}\n\nGenerate a script for: ${prompt}`
        }]
      }]
    });

    const responseText = response.response.text();
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not parse JSON from response, using mock data');
      return mockScripts;
    }

    const parsedScript = JSON.parse(jsonMatch[0]) as ScriptVariant;
    return [parsedScript];
  } catch (error: any) {
    console.error('Generation error:', error);
    // Fallback to mock data on error
    return mockScripts;
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
    if (!model) {
      console.warn('Gemini model not available, using mock data');
      return mockScripts;
    }

    const prompt = `Generate 3 different script variations for a short-form video.
Idea: ${idea}
Niche: ${niche.join(', ')}
Content Types: ${contentTypes.join(', ')}
Visual Style: ${visualStyle.join(', ')}
Language: ${language}
Optimize for loop: ${optimizeForLoop}

For each variation, return a JSON object with the timeline structure. Return valid JSON array.`;

    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }]
    });

    const responseText = response.response.text();
    
    // Try to parse as array
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/) || responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return mockScripts;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return mockScripts;
    }
  } catch (error: any) {
    console.error('Generation error:', error);
    return mockScripts;
  }
}

export async function fetchTrends(languageCode: string): Promise<TrendsData> {
  try {
    if (!model) {
      console.warn('Gemini model not available, using mock data');
      return mockTrends;
    }

    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `List current trending topics for short-form videos (YouTube Shorts, TikTok) in language ${languageCode}. 
Return as JSON with structure:
{
  "youtube_shorts": [{"title": "...", "description": "...", "niche": "..."}],
  "tiktok": [{"title": "...", "description": "...", "niche": "..."}],
  "google_trends": [{"title": "...", "description": "...", "niche": "..."}]
}`
        }]
      }]
    });

    const responseText = response.response.text();
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return mockTrends;
      }

      return JSON.parse(jsonMatch[0]) as TrendsData;
    } catch {
      return mockTrends;
    }
  } catch (error: any) {
    console.error('Fetch trends error:', error);
    return mockTrends;
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
