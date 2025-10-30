
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScriptVariant, TrendsData, Trend, Trigger, VideoGenerationState, TimelineEvent } from './types';
import { generateScripts, fetchTrends, generateVideoFromScript, enhanceVisualDescription, refineTimelineEvent } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ScriptViewer from './components/ScriptViewer';
import { MOCK_SCRIPTS } from './constants';
import { getTranslations, languages } from './locales/i18n';
import TrendSpotter from './components/TrendSpotter';
import ScriptViewerPlaceholder from './components/ScriptViewerPlaceholder';
import VideoPlayerModal from './components/VideoPlayerModal';

const LOCAL_STORAGE_KEY = 'ai-shorts-script-session';

// Fix: Define a named interface 'AIStudio' and use it for window.aistudio to resolve declaration conflicts.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // FIX: Made aistudio optional to resolve modifier conflict and match runtime checks.
    aistudio?: AIStudio;
  }
}

interface VideoModalState {
  url: string;
  variantId: string;
}

const App: React.FC = () => {
  // Script generation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptVariants, setScriptVariants] = useState<ScriptVariant[]>([]);
  
  // Trend fetching state
  const [isTrendsLoading, setIsTrendsLoading] = useState<boolean>(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);

  // Video generation state
  const [videoStates, setVideoStates] = useState<Record<string, VideoGenerationState>>({});
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  const [videoModalState, setVideoModalState] = useState<VideoModalState | null>(null);

  // UI and session state
  const [showMockData, setShowMockData] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('uk');
  const [enhancingEvent, setEnhancingEvent] = useState<{variantIndex: number, eventIndex: number} | null>(null);
  const [isEnhancingWeak, setIsEnhancingWeak] = useState<number | null>(null);
  const [isEnhancingAll, setIsEnhancingAll] = useState<number | null>(null);
  const [refiningEvent, setRefiningEvent] = useState<{variantIndex: number, eventIndex: number} | null>(null);

  // Controlled form state
  const [idea, setIdea] = useState('');
  const [niche, setNiche] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [visualStyle, setVisualStyle] = useState<string[]>([]);
  const [optimizeForLoop, setOptimizeForLoop] = useState<boolean>(true);

  const t = useMemo(() => getTranslations(language), [language]);

  // Check for API key on mount for video generation feature
  useEffect(() => {
    const checkApiKey = async () => {
        try {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        } catch (e) {
            console.error("AI Studio SDK not available or failed.", e);
        } finally {
            setIsCheckingApiKey(false);
        }
    };
    checkApiKey();
  }, []);


  // Load session from localStorage on initial render
  useEffect(() => {
    const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsedVariants: ScriptVariant[] = JSON.parse(savedSession);
        if (parsedVariants.length > 0) {
          setScriptVariants(parsedVariants);
          setShowMockData(false);
          setError(null);
        }
      } catch (e) {
        console.error("Failed to parse saved session from localStorage", e);
        // If parsing fails, clear the corrupted data
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!idea || niche.length === 0) return;
    setIsLoading(true);
    setError(null);
    setShowMockData(false);
    setVideoStates({}); // Clear previous video states on new generation
    try {
      const variants = await generateScripts(idea, niche, contentTypes, language, optimizeForLoop, visualStyle);
      setScriptVariants(variants);
      // Automatically save to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(variants));
    } catch (err) {
      setError('Failed to generate scripts. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [idea, niche, contentTypes, language, optimizeForLoop, visualStyle]);

  const handleFetchTrends = useCallback(async () => {
    setIsTrendsLoading(true);
    setTrendsError(null);
    try {
        const trends = await fetchTrends(language);
        setTrendsData(trends);
    } catch (err) {
        setTrendsError('Failed to fetch trends. The AI might be busy, please try again in a moment.');
        console.error(err);
    } finally {
        setIsTrendsLoading(false);
    }
  }, [language]);

  const handleTrendClick = useCallback((trend: Trend) => {
    setIdea(trend.title);
    setNiche(prev => [...new Set([...prev, trend.niche])]); // Add niche without removing existing ones
    window.scrollTo({
        top: document.getElementById('input-form')?.offsetTop || 0,
        behavior: 'smooth',
    });
  }, []);
  
  const handleLoadMockData = useCallback(() => {
    setShowMockData(true);
    setScriptVariants(MOCK_SCRIPTS);
    setError(null);
    setVideoStates({});
  }, []);

  const handleClearSession = useCallback(() => {
    if (window.confirm(t.clearSessionConfirm)) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setScriptVariants([]);
      setVideoStates({});
      // Reset to welcome screen if no mock data is shown
      if (!showMockData) {
        setShowMockData(true); // Or simply leave it blank
        setScriptVariants([]); // Ensure state is empty
      }
    }
  }, [t, showMockData]);

  const handleApplyTrigger = useCallback((variantIndex: number, eventIndex: number, trigger: Trigger) => {
    setScriptVariants(prevVariants => {
        const newVariants = prevVariants.map((variant, vIdx) => {
            if (vIdx !== variantIndex) {
                return variant;
            }

            // Create a new variant object with an updated timeline
            return {
                ...variant,
                timeline: variant.timeline.map((event, eIdx) => {
                    if (eIdx !== eventIndex) {
                        return event;
                    }

                    // Create a new event object with updated triggers
                    return {
                        ...event,
                        triggers: event.triggers.includes(trigger)
                            ? event.triggers
                            : [...event.triggers, trigger],
                        suggested_triggers: event.suggested_triggers?.filter(t => t !== trigger) || [],
                    };
                }),
            };
        });

        // Save the updated state to localStorage if it's not mock data
        if (!showMockData) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVariants));
        }

        return newVariants;
    });
  }, [showMockData]);

  const handleEnhanceSingleVisual = useCallback(async (variantIndex: number, eventIndex: number) => {
    setEnhancingEvent({ variantIndex, eventIndex });
    const variant = scriptVariants[variantIndex];
    const event = variant.timeline[eventIndex];
    const languageName = languages.find(l => l.code === language)?.name || 'English';

    try {
        const newVisual = await enhanceVisualDescription(event, variant, languageName, 'weakness');
        
        setScriptVariants(prevVariants => {
            const newVariants = [...prevVariants];
            const newVariant = { ...newVariants[variantIndex] };
            const newTimeline = [...newVariant.timeline];
            newTimeline[eventIndex] = { ...newTimeline[eventIndex], visual: newVisual };
            newVariant.timeline = newTimeline;
            newVariants[variantIndex] = newVariant;

            if (!showMockData) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVariants));
            }
            return newVariants;
        });

    } catch (err) {
        console.error("Failed to improve visual", err);
        alert('Failed to improve the visual description. The AI might be busy or an error occurred. Please try again.');
    } finally {
        setEnhancingEvent(null);
    }
  }, [scriptVariants, language, showMockData]);

  const handleEnhanceWeakVisuals = useCallback(async (variantIndex: number) => {
    setIsEnhancingWeak(variantIndex);
    const variant = scriptVariants[variantIndex];
    const weakEvents = variant.timeline
        .map((event, index) => ({ event, index }))
        .filter(({ event }) => event.isWeak);

    const languageName = languages.find(l => l.code === language)?.name || 'English';

    try {
        const enhancementPromises = weakEvents.map(({ event }) => 
            enhanceVisualDescription(event, variant, languageName, 'weakness')
        );
        
        const newVisuals = await Promise.all(enhancementPromises);

        setScriptVariants(prevVariants => {
            const newVariants = [...prevVariants];
            const newVariant = { ...newVariants[variantIndex] };
            const newTimeline = [...newVariant.timeline];

            weakEvents.forEach(({ index }, i) => {
                newTimeline[index] = { ...newTimeline[index], visual: newVisuals[i] };
            });

            newVariant.timeline = newTimeline;
            newVariants[variantIndex] = newVariant;

            if (!showMockData) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVariants));
            }
            return newVariants;
        });

    } catch (err) {
        console.error("Failed to improve all weak visuals", err);
        alert('Failed to improve visuals. The AI might be busy or an error occurred. Please try again.');
    } finally {
        setIsEnhancingWeak(null);
    }
  }, [scriptVariants, language, showMockData]);

  const handleEnhanceAllVisuals = useCallback(async (variantIndex: number) => {
    setIsEnhancingAll(variantIndex);
    const variant = scriptVariants[variantIndex];
    const allEvents = variant.timeline.map((event, index) => ({ event, index }));

    const languageName = languages.find(l => l.code === language)?.name || 'English';

    try {
        const enhancementPromises = allEvents.map(({ event }) => 
            enhanceVisualDescription(event, variant, languageName, 'cinematic')
        );
        
        const newVisuals = await Promise.all(enhancementPromises);

        setScriptVariants(prevVariants => {
            const newVariants = [...prevVariants];
            const newVariant = { ...newVariants[variantIndex] };
            const newTimeline = [...newVariant.timeline];

            allEvents.forEach(({ index }, i) => {
                newTimeline[index] = { ...newTimeline[index], visual: newVisuals[i] };
            });

            newVariant.timeline = newTimeline;
            newVariants[variantIndex] = newVariant;

            if (!showMockData) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVariants));
            }
            return newVariants;
        });

    } catch (err) {
        console.error("Failed to enhance all visuals", err);
        alert('Failed to enhance all visuals. The AI might be busy or an error occurred. Please try again.');
    } finally {
        setIsEnhancingAll(null);
    }
  }, [scriptVariants, language, showMockData]);

  const handleRefineEvent = useCallback(async (variantIndex: number, eventIndex: number, instruction: string) => {
    setRefiningEvent({ variantIndex, eventIndex });
    const variant = scriptVariants[variantIndex];
    const event = variant.timeline[eventIndex];
    const languageName = languages.find(l => l.code === language)?.name || 'English';
    
    try {
        const refinedEvent = await refineTimelineEvent(event, variant, instruction, languageName);
        
        setScriptVariants(prevVariants => {
            const newVariants = [...prevVariants];
            const newVariant = { ...newVariants[variantIndex] };
            const newTimeline = [...newVariant.timeline];
            newTimeline[eventIndex] = refinedEvent; // Replace the whole event
            newVariant.timeline = newTimeline;
            newVariants[variantIndex] = newVariant;

            if (!showMockData) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVariants));
            }
            return newVariants;
        });

    } catch (err) {
        console.error("Failed to refine event", err);
        alert('Failed to refine the event. The AI might be busy or an error occurred. Please try again.');
    } finally {
        setRefiningEvent(null);
    }
  }, [scriptVariants, language, showMockData]);

  const handleSelectApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Optimistically assume key selection was successful to improve UX
        setApiKeySelected(true);
    }
  }, []);

  const handleGenerateVideo = useCallback(async (variant: ScriptVariant) => {
    const variantId = variant.variant_id;
    setVideoStates(prev => ({
        ...prev,
        [variantId]: { isLoading: true, error: null, videoUrl: null }
    }));
    
    try {
        const videoUrl = await generateVideoFromScript(variant);
        setVideoStates(prev => ({
            ...prev,
            [variantId]: { isLoading: false, error: null, videoUrl: videoUrl }
        }));
        setVideoModalState({ url: videoUrl, variantId }); // Automatically open the video when it's done
    } catch (err: any) {
        const errorMessage = err.message || 'An unknown error occurred.';
        // If the key is invalid, prompt the user to select again.
        if (errorMessage.includes("Requested entity was not found")) {
            setApiKeySelected(false);
            setVideoStates(prev => ({
                ...prev,
                [variantId]: { isLoading: false, error: "Invalid API Key. Please select a valid key and try again.", videoUrl: null }
            }));
        } else {
             setVideoStates(prev => ({
                ...prev,
                [variantId]: { isLoading: false, error: errorMessage, videoUrl: null }
            }));
        }
        console.error(err);
    }
  }, []);

  const handleViewVideo = useCallback((url: string, variantId: string) => {
    setVideoModalState({ url, variantId });
  }, []);

  const handleSaveTrim = useCallback((variantId: string, newVideoUrl: string) => {
      // Find the old URL to revoke it and prevent memory leaks
      const oldUrl = videoStates[variantId]?.videoUrl;
      if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
      }

      setVideoStates(prev => ({
          ...prev,
          [variantId]: { ...prev[variantId], videoUrl: newVideoUrl }
      }));
      // Refresh the modal to show the newly trimmed video
      setVideoModalState({ url: newVideoUrl, variantId });
  }, [videoStates]);


  const hasSavedScripts = scriptVariants.length > 0 && !showMockData;

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header 
        currentLanguage={language}
        onLanguageChange={setLanguage}
        t={t}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <TrendSpotter 
            isLoading={isTrendsLoading}
            error={trendsError}
            trends={trendsData}
            onFetchTrends={handleFetchTrends}
            onTrendClick={handleTrendClick}
            t={t}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4" id="input-form">
            <InputForm
              idea={idea}
              onIdeaChange={setIdea}
              selectedNiches={niche}
              onNicheChange={setNiche}
              selectedContentTypes={contentTypes}
              onContentTypesChange={setContentTypes}
              selectedVisualStyles={visualStyle}
              onVisualStyleChange={setVisualStyle}
              optimizeForLoop={optimizeForLoop}
              onOptimizeForLoopChange={setOptimizeForLoop}
              onSubmit={handleGenerate} 
              isLoading={isLoading} 
              onLoadMock={handleLoadMockData}
              onClearSession={handleClearSession}
              hasSavedScripts={hasSavedScripts}
              t={t}
              lang={language}
            />
          </div>
          <div className="lg:col-span-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-brand-surface rounded-xl p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mb-4"></div>
                <p className="text-brand-text-dim text-lg">{t.generatingButton}</p>
                <p className="text-brand-text-dim text-sm">This can take up to 30 seconds.</p>
              </div>
            )}
            {error && (
               <div className="flex items-center justify-center h-full min-h-[60vh] bg-brand-surface rounded-xl p-8 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            {!isLoading && !error && (
              scriptVariants.length > 0 ? (
                <ScriptViewer 
                  variants={scriptVariants} 
                  isMockData={showMockData}
                  t={t}
                  onApplyTrigger={handleApplyTrigger}
                  onEnhanceSingleVisual={handleEnhanceSingleVisual}
                  enhancingEvent={enhancingEvent}
                  onEnhanceWeakVisuals={handleEnhanceWeakVisuals}
                  isEnhancingWeak={isEnhancingWeak}
                  onEnhanceAllVisuals={handleEnhanceAllVisuals}
                  isEnhancingAll={isEnhancingAll}
                  onRefineEvent={handleRefineEvent}
                  refiningEvent={refiningEvent}
                  lang={language}
                  onGenerateVideo={handleGenerateVideo}
                  videoStates={videoStates}
                  apiKeySelected={apiKeySelected}
                  isCheckingApiKey={isCheckingApiKey}
                  onSelectApiKey={handleSelectApiKey}
                  onViewVideo={handleViewVideo}
                />
              ) : (
                <ScriptViewerPlaceholder t={t} />
              )
            )}
          </div>
        </div>
      </main>
      {videoModalState && (
        <VideoPlayerModal 
            videoUrl={videoModalState.url}
            variantId={videoModalState.variantId}
            onClose={() => setVideoModalState(null)}
            onSave={handleSaveTrim}
            t={t}
        />
      )}
    </div>
  );
};

export default App;
