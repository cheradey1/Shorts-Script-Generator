
import { ScriptVariant } from '../types';
import { languages } from '../locales/i18n';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

interface GenerateResponse {
  script: string;
  success: boolean;
  error?: string;
}

export async function generateScript(prompt: string, language: string = 'en'): Promise<ScriptVariant[]> {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, language }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate script');
    }

    const data: GenerateResponse = await response.json();
    
    if (!data.success || !data.script) {
      throw new Error(data.error || 'Failed to generate script');
    }

    return JSON.parse(data.script);
  } catch (error: any) {
    console.error('Generation error:', error);
    throw error;
  }
}

export { generateScript as default };

const scriptResponseSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        variant_id: { type: "string" },
        duration_s: { type: "integer" },
        timeline: {
          type: Type.ARRAY,
          items: timelineEventSchema,
        },
        loopability_analysis: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            analysis: { type: Type.STRING },
            transition_point_analysis: {
              type: Type.OBJECT,
              properties: {
                last_event_visual: { type: Type.STRING },
                first_event_visual: { type: Type.STRING },
                visual_match_score: { type: Type.INTEGER },
                last_event_audio: { type: Type.STRING },
                first_event_audio: { type: Type.STRING },
                audio_match_score: { type: Type.INTEGER },
                suggestion_for_improvement: { type: Type.STRING },
              },
              required: ["last_event_visual", "first_event_visual", "visual_match_score", "last_event_audio", "first_event_audio", "audio_match_score", "suggestion_for_improvement"],
            },
          },
          required: ["score", "analysis", "transition_point_analysis"],
        },
      },
      required: ["variant_id", "duration_s", "timeline", "loopability_analysis"],
    },
};

const trendResponseSchema = {
    type: Type.OBJECT,
    properties: {
        youtube_shorts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    niche: { type: Type.STRING },
                },
                required: ["title", "description", "niche"],
            }
        },
        tiktok: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    niche: { type: Type.STRING },
                },
                required: ["title", "description", "niche"],
            }
        },
        google_trends: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    niche: { type: Type.STRING },
                },
                required: ["title", "description", "niche"],
            }
        },
    },
    required: ["youtube_shorts", "tiktok", "google_trends"],
};

export const fetchTrends = async (languageCode: string): Promise<TrendsData> => {
    const languageName = languages.find(l => l.code === languageCode)?.name || 'English';

    const prompt = `
    You are a viral trends analyst for short-form video platforms. Your task is to identify current, popular, and emerging trends and frame them as compelling video ideas.

    INSTRUCTIONS:
    1.  Identify 3 distinct, current trends from each of the following sources: YouTube Shorts, TikTok, and Google Trends.
    2.  For each trend, provide a concise and engaging 'title' that could serve as a video idea.
    3.  For each trend, write a short 'description' explaining what the trend is and why it's popular.
    4.  For each trend, suggest a relevant 'niche' (e.g., "Comedy, DIY, Tech, Gaming").
    5.  The entire response, including all titles, descriptions, and niches, MUST be in the ${languageName} language.
    6.  The final output MUST be a valid JSON object matching the provided schema. Do not include any markdown formatting.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: trendResponseSchema,
        },
    });
    
    const jsonText = response.text.trim();
    try {
        const parsedJson = JSON.parse(jsonText);
        // Basic validation
        if (parsedJson.youtube_shorts && parsedJson.tiktok && parsedJson.google_trends) {
            return parsedJson as TrendsData;
        } else {
            throw new Error("Parsed JSON does not match the expected TrendsData structure.");
        }
    } catch (error) {
        console.error("Failed to parse Gemini response for trends:", error);
        console.error("Raw response text:", jsonText);
        throw new Error("The AI returned an invalid data format for trends. Please try again.");
    }
};


export const generateScripts = async (idea: string, niche: string[], contentTypes: string[], languageCode: string, optimizeForLoop: boolean, visualStyle: string[]): Promise<ScriptVariant[]> => {
  const languageName = languages.find(l => l.code === languageCode)?.name || 'English';
  
  const nichePrompt = niche.length > 0 
    ? `    - Niche: "${niche.join('", "')}"` 
    : '';
  
  const contentTypesPrompt = contentTypes.length > 0 
    ? `    - Content Types/Formats: "${contentTypes.join('", "')}"` 
    : '';

  const visualStylePrompt = visualStyle.length > 0
    ? `    - Visual Style: "${visualStyle.join('", "')}"`
    : '';

  const loopOptimizationPrompt = optimizeForLoop
    ? `    - Loop Optimization: Enabled. This is the highest priority.`
    : '';

  const allNewsRoles = [
    "Journalist", "Analyst", "Commentator", // en
    "Журналіст", "Аналітик", "Коментатор", // uk
    "Periodista", "Analista", "Comentarista", // es
    "पत्रकार", "विश्लेषक", "टिप्पणीकार", // hi
    "Jornalista", "Analista", "Comentarista" // pt
  ];
  const isNewsQuery = contentTypes.some(ct => allNewsRoles.includes(ct));

  const basePrompt = `
    You are an expert viral video scriptwriter for short-form content (like YouTube Shorts, TikTok).
    Your goal is to create compelling, high-retention scripts that are 20-30 seconds long.
    You must generate 3 distinct script variants.

    USER REQUEST:
    - Idea: "${idea}"
${nichePrompt}
    - Language for the output script: ${languageName}
${contentTypesPrompt}
${visualStylePrompt}
${loopOptimizationPrompt}`;

  const instructions = `
    INSTRUCTIONS:
    1. Generate 3 different script variants based on the user request. If "Content Types/Formats" are specified, ensure the scripts align with those styles.
    2. Each script must be between 20 and 30 seconds.
    3. Break down each script into a timeline of events, second by second.
    4. For each timeline event, provide a 'visual' description, an 'audio' cue, and a 'caption' text.
       - VISUAL (CRITICAL): Be extremely descriptive and creative. If a 'Visual Style' is specified in the user request, all visual descriptions MUST adhere to that style. For example, if the style is 'cinematic', describe shots with attention to lighting, camera angles (e.g., 'low-angle shot'), and depth of field. If 'flat design', describe simple shapes, bold colors, and 2D animation. Instead of generic descriptions like 'close_face_shock', provide detailed shot compositions, camera movements, and character actions that fit the requested style. For example: 'Extreme close-up of a character's face widening in shock, eyes bulging, a single bead of sweat trickling down their temple.' This level of detail is especially important for events marked as 'isWeak: true' to make them more engaging and visually arresting.
       - AUDIO (CRITICAL): For each event, provide a highly specific and complementary audio cue. This should include a mix of sound effects (SFX), music suggestions, and descriptions of vocal tone for any speech. The audio must directly enhance the visual and caption. For example, for a visual of 'fast mouse clicks', the audio shouldn't just be 'typing sfx', but 'Rapid, frantic mouse clicking SFX layered over a tense, fast-paced electronic beat'. For a shocking reveal, suggest 'Sudden, dramatic sting SFX (e.g., 'dun dun dunnn') followed by a sharp intake of breath and complete silence'.
    5. The 'triggers' array must only contain values from this list: ['hook', 'shock', 'context', 'cta', 'loop_hint', 'curiosity_question', 'jump_cut', 'music_cue', 'text_overlay_bold', 'poignant_pov', 'surprise_reveal', 'sound_effect', 'pattern_interrupt', 'quick_zoom', 'point_of_view_shot', 'satisfying_visual', 'callback_joke', 'foreshadowing', 'visual_metaphor'].
    6. Ensure the first 1-3 seconds have a strong 'hook' or 'shock' trigger.
    7. For each timeline event, provide a 'suggested_triggers' array and an 'isWeak' boolean.
       - RETENTION FOCUS (CRITICAL): Your primary goal is to maintain high viewer retention. Retention typically drops in the middle of a video.
       - AUTOMATIC FIX & CONTEXT-AWARE SUGGESTIONS: You MUST identify potential weak spots. For any timeline event predicted to have low retention, you MUST set "isWeak": true.
       - For events where "isWeak" is true, your suggestions in 'suggested_triggers' are your most critical tool for fixing retention. They MUST be deeply context-aware. You are required to analyze the specific 'caption', 'visual', and 'audio' of the weak event, as well as the events immediately preceding and succeeding it to understand the narrative flow. Based on this full context, suggest the 3-4 most impactful and creative triggers that would logically fit and enhance that specific moment. For instance, if the visual is 'fast mouse clicks', a 'sound_effect' of 'Rapid, frantic mouse clicking SFX' is a perfect fit. If the caption reveals a shocking fact like "But the autosaves were all corrupted", then 'shock' or 'quick_zoom' are excellent choices to amplify the drama. Be varied, creative, and ensure your suggestions are tailored to solve the specific weakness of that scene.
       - For strong events (like the initial hook or final reveal), set "isWeak": false and provide only 1-2 targeted suggestions.
    ${optimizeForLoop ? `8. LOOPABILITY (CRITICAL): The primary goal is to make the video seamlessly loopable. The end MUST transition perfectly back to the first frame.
       - The final event's visual, audio, and caption MUST create a perfect, natural, and almost unnoticeable transition back to the very first event's hook.
       - SELF-CORRECTION FOR WEAK LOOPS: After generating a script variant, you must evaluate its loopability. If you determine the 'score' will be below 8, you MUST revise the final 1-2 timeline events. Suggest specific, detailed changes to the 'visual' and 'audio' descriptions to create a seamless bridge to the first event. For example, if the script starts with a close-up on a shocked face, the final event should end on a visual that motivates that shock.
       - STRATEGIC TRIGGER PLACEMENT: Ensure a 'loop_hint' trigger is strategically placed in one of the final events to cue the viewer.
    ` : "8. Consider a 'cta' trigger near the end, and set 'isWeak' to false for all events unless a clear weak spot is identified."}
    9. For EACH script variant, you MUST provide a 'loopability_analysis' object. This object must contain:
       - 'score': An integer from 1 to 10 rating how seamlessly the video loops.
       - 'analysis': A concise, 1-2 sentence explanation (in ${languageName}) of the overall loop strategy.
       - 'transition_point_analysis': A detailed breakdown of the loop's key transition points.
         - 'last_event_visual': A brief description of the final visual cue.
         - 'first_event_visual': A brief description of the initial visual cue it transitions into.
         - 'visual_match_score': A score from 1-10 on how well the final visual flows into the first.
         - 'last_event_audio': A brief description of the final audio cue.
         - 'first_event_audio': A brief description of the initial audio cue it transitions into.
         - 'audio_match_score': A score from 1-10 on how well the final audio flows into the first.
         - 'suggestion_for_improvement': If the combined scores are low, provide a concrete suggestion on how to improve the visual or audio transition to make the loop stronger. Otherwise, state "N/A".
    10. IMPORTANT: The entire JSON response, including all 'visual', 'audio', 'caption', and 'analysis' strings, MUST be in ${languageName}.
  `;

  let response: GenerateContentResponse;
  let sources: { uri: string; title: string; }[] = [];

  if (isNewsQuery) {
    const searchPrompt = `
${basePrompt}
    - Special Instruction: This is a news-related request. Treat the user's "Idea" as a factual event. Use Google Search for supplementary details but do not contradict the core premise. The script must present the user's idea as a fact.

${instructions}
    11. The final output MUST be a valid JSON object that is an array of script variants. Do not include any markdown formatting.
    `;
    
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const uniqueSources = new Map<string, { uri: string; title: string; }>();
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          uniqueSources.set(chunk.web.uri, {
            uri: chunk.web.uri,
            title: chunk.web.title || 'Untitled Source',
          });
        }
      });
      sources = Array.from(uniqueSources.values());
    }

  } else {
     const standardPrompt = `
${basePrompt}
${instructions}
    11. The final output MUST be a valid JSON object matching the provided schema. Do not include any markdown formatting like \\\`\\\`\\\`json.
    `;

    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: standardPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scriptResponseSchema,
      },
    });
  }

  const jsonText = response.text.trim();
  try {
    // Attempt to find a valid JSON array within the response text, just in case the model wraps it.
    const jsonMatch = jsonText.match(/\[.*\]/s);
    const textToParse = jsonMatch ? jsonMatch[0] : jsonText;

    const parsedJson = JSON.parse(textToParse);

    if (Array.isArray(parsedJson) && parsedJson.every(item => item.timeline && Array.isArray(item.timeline))) {
        if (sources.length > 0) {
            return parsedJson.map(variant => ({ ...variant, sources })) as ScriptVariant[];
        }
        return parsedJson as ScriptVariant[];
    } else {
        throw new Error("Parsed JSON does not match the expected ScriptVariant[] structure.");
    }
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    console.error("Raw response text:", jsonText);
    throw new Error("The AI returned an invalid data format. Please try again.");
  }
};

export const enhanceVisualDescription = async (event: TimelineEvent, scriptContext: ScriptVariant, languageName: string, enhancementType: 'weakness' | 'cinematic'): Promise<string> => {
  const basePrompt = `
    You are an expert viral video scriptwriter and cinematographer specializing in visual storytelling.
    Your task is to rewrite ONLY the 'visual' description for a single moment in a script to make it more engaging.

    CONTEXT:
    - Script Language: ${languageName}
    - Full Script Idea: ${scriptContext.timeline.map(e => e.caption).join(' ')}
    - Event Timing: ${event.sec_start}s - ${event.sec_end}s
    - Event Caption: "${event.caption}"
    - Event Audio Cue: "${event.audio}"

    CURRENT VISUAL DESCRIPTION:
    "${event.visual}"
  `;
  
  const weaknessInstruction = `
    INSTRUCTIONS:
    1.  The current visual description corresponds to a moment identified as having a HIGH RISK of losing viewer retention.
    2.  Your primary goal is to make it significantly more engaging, dynamic, and visually arresting to fix this weak spot.
    3.  Rewrite the 'visual' description to be extremely descriptive and creative. Use vivid language.
    4.  The new description must align with the existing caption, audio, and timing.
    5.  Your response MUST be ONLY the new 'visual' description text. Do not include any other text, labels, or markdown.
    6.  The response MUST be in ${languageName}.
  `;

  const cinematicInstruction = `
    INSTRUCTIONS:
    1.  Your task is to elevate the existing visual description by adding cinematic detail.
    2.  Rewrite the 'visual' description to be more vivid and specific. Add details about:
        - Camera Angles (e.g., "low-angle shot," "dolly zoom," "quick pan right").
        - Lighting (e.g., "dramatic backlighting," "soft morning light," "neon glow").
        - Specific Character Actions (e.g., "slams the book shut," "gazes wistfully out the window," "eyebrows furrow in concentration").
    3.  The new description must align with the existing caption, audio, and timing.
    4.  Your response MUST be ONLY the new 'visual' description text. Do not include any other text, labels, or markdown.
    5.  The response MUST be in ${languageName}.
  `;

  const prompt = basePrompt + (enhancementType === 'weakness' ? weaknessInstruction : cinematicInstruction);

  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
  });

  return response.text.trim();
};

export const refineTimelineEvent = async (event: TimelineEvent, scriptContext: ScriptVariant, instruction: string, languageName: string): Promise<TimelineEvent> => {
    const prompt = `
    You are an expert viral video scriptwriter. Your task is to refine a single timeline event from a script based on a user's instruction.
    You must intelligently modify the 'visual', 'audio', and 'caption' fields while keeping the core idea intact.
    You MUST preserve the original 'sec_start', 'sec_end', 'triggers', and 'suggested_triggers' unless the instruction explicitly asks to change the tone in a way that warrants a trigger change.

    CONTEXT:
    - Script Language: ${languageName}
    - Full Script Idea: ${scriptContext.timeline.map(e => e.caption).join(' ')}
    - Original Event to Refine (JSON):
      ${JSON.stringify(event, null, 2)}
    
    USER'S INSTRUCTION FOR THIS EVENT:
    "${instruction}"

    INSTRUCTIONS:
    1. Analyze the original event and the user's instruction.
    2. Rewrite the 'visual', 'audio', and 'caption' to incorporate the user's feedback. Be creative and descriptive.
    3. Maintain the original start and end times.
    4. The entire output MUST be a single, valid JSON object matching the provided schema for a timeline event. Do not include any markdown or extra text.
    5. All text content ('visual', 'audio', 'caption') in the returned JSON object must be in ${languageName}.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: timelineEventSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsedJson = JSON.parse(jsonText);
        // Add a simple validation check
        if (parsedJson && typeof parsedJson.sec_start === 'number' && typeof parsedJson.visual === 'string') {
            return parsedJson as TimelineEvent;
        } else {
            throw new Error("Parsed JSON does not match the TimelineEvent structure.");
        }
    } catch (error) {
        console.error("Failed to parse Gemini response for event refinement:", error);
        console.error("Raw response text:", jsonText);
        throw new Error("The AI returned an invalid data format for the event. Please try again.");
    }
};


export const generateVideoFromScript = async (variant: ScriptVariant): Promise<string> => {
    // A new instance is created here to ensure the latest API key from the aistudio dialog is used.
    const aiWithKey = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a concise prompt from the visual descriptions.
    const prompt = `A short, dynamic, cinematic video for social media, based on this script: ${variant.timeline.map(e => e.visual).join('. ')}. The video should be visually engaging and follow the narrative beats of the script.`;

    try {
        // Using 'veo-3.1-fast-generate-preview' as it is a suitable and available model for this task.
        let operation = await aiWithKey.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16' // Shorts are typically portrait
            }
        });

        // Poll for completion, with a reasonable timeout.
        const startTime = Date.now();
        const timeout = 5 * 60 * 1000; // 5 minutes

        while (!operation.done && Date.now() - startTime < timeout) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await aiWithKey.operations.getVideosOperation({ operation: operation });
        }
        
        if (!operation.done) {
            throw new Error("Video generation timed out.");
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded but no download link was provided.");
        }

        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

        if (!videoResponse.ok) {
            throw new Error(`Failed to download the video. Status: ${videoResponse.statusText}`);
        }

        const blob = await videoResponse.blob();
        return URL.createObjectURL(blob);

    } catch (err) {
        console.error("Video generation failed:", err);
        // Re-throw the error to be handled by the UI component
        throw err;
    }
};
