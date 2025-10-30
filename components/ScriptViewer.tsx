
import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { ScriptVariant, Trigger, VideoGenerationState, TimelineEvent } from '../types';
import { analyzeScriptRetention, analyzeTriggerImpact } from '../services/markovService';
import { getTriggerInfo } from '../locales/i18n';
import Timeline from './Timeline';
import RetentionChart from './RetentionChart';
import MetricsCard from './MetricsCard';
import TriggerImpactAnalysis from './TriggerImpactAnalysis';
import SourceCitation from './SourceCitation';
import LoopAnalysis from './LoopAnalysis';
import TriggerModal from './TriggerModal';

interface ScriptViewerProps {
  variants: ScriptVariant[];
  isMockData: boolean;
  t: any;
  onApplyTrigger: (variantIndex: number, eventIndex: number, trigger: Trigger) => void;
  onEnhanceSingleVisual: (variantIndex: number, eventIndex: number) => void;
  enhancingEvent: { variantIndex: number, eventIndex: number } | null;
  onEnhanceWeakVisuals: (variantIndex: number) => void;
  isEnhancingWeak: number | null;
  onEnhanceAllVisuals: (variantIndex: number) => void;
  isEnhancingAll: number | null;
  onRefineEvent: (variantIndex: number, eventIndex: number, instruction: string) => void;
  refiningEvent: { variantIndex: number, eventIndex: number } | null;
  lang: string;
  onGenerateVideo: (variant: ScriptVariant) => void;
  videoStates: Record<string, VideoGenerationState>;
  apiKeySelected: boolean;
  isCheckingApiKey: boolean;
  onSelectApiKey: () => void;
  onViewVideo: (url: string, variantId: string) => void;
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({ 
  variants, isMockData, t, onApplyTrigger, lang, onEnhanceSingleVisual, enhancingEvent,
  onEnhanceWeakVisuals, isEnhancingWeak, onEnhanceAllVisuals, isEnhancingAll,
  onRefineEvent, refiningEvent,
  onGenerateVideo, videoStates, apiKeySelected, isCheckingApiKey, onSelectApiKey, onViewVideo 
}) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    eventIndex: number | null;
    trigger: Trigger | null;
  }>({ isOpen: false, eventIndex: null, trigger: null });


  const selectedVariant = variants[selectedVariantIndex];
  
  const { analysis, triggerImpact, triggerImpactForChart } = useMemo(() => {
    if (!selectedVariant) return { analysis: null, triggerImpact: [], triggerImpactForChart: [] };
    const analysisResult = analyzeScriptRetention(selectedVariant.timeline, selectedVariant.duration_s);
    const triggerImpactResult = analyzeTriggerImpact(selectedVariant.timeline, selectedVariant.duration_s);
    const triggerImpactForChartResult = triggerImpactResult.map(impact => ({
        ...impact,
        trigger: getTriggerInfo(lang, impact.trigger).name,
    }));
    return { analysis: analysisResult, triggerImpact: triggerImpactResult, triggerImpactForChart: triggerImpactForChartResult };
  }, [selectedVariant, lang]);

  const handleSuggestionClick = (eventIndex: number, trigger: Trigger) => {
    setModalState({ isOpen: true, eventIndex, trigger });
  };

  const handleApplyModal = () => {
    if (modalState.eventIndex !== null && modalState.trigger) {
      onApplyTrigger(selectedVariantIndex, modalState.eventIndex, modalState.trigger);
    }
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, eventIndex: null, trigger: null });
  };


  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      variants.forEach((variant, index) => {
        let content = `# Script Variant ${index + 1}\n\n`;
        content += `## Metrics\n`;
        content += `- **Duration:** ${variant.duration_s} seconds\n`;
        if (variant.loopability_analysis) {
          content += `- **Loopability Score:** ${variant.loopability_analysis.score}/10\n`;
          content += `- **Loop Analysis:** ${variant.loopability_analysis.analysis}\n`;
        }
        content += `\n`;

        if (variant.sources && variant.sources.length > 0) {
          content += `## Sources\n`;
          variant.sources.forEach(source => {
            content += `- [${source.title}](${source.uri})\n`;
          });
          content += `\n`;
        }

        content += `## Timeline\n\n`;
        variant.timeline.forEach(event => {
          content += `### ${event.sec_start}s - ${event.sec_end}s\n\n`;
          content += `**Caption:** "${event.caption}"\n\n`;
          content += `- **Visual:** ${event.visual}\n`;
          content += `- **Audio:** ${event.audio}\n`;
          if (event.triggers.length > 0) {
            content += `- **Triggers:** ${event.triggers.map(t => `\`${t.replace(/_/g, ' ')}\``).join(', ')}\n`;
          }
           if (event.suggested_triggers && event.suggested_triggers.length > 0) {
            content += `- **AI Suggestions:** ${event.suggested_triggers.map(t => `\`${t.replace(/_/g, ' ')}\``).join(', ')}\n`;
          }
          content += `\n---\n\n`;
        });
        zip.file(`variant-${index + 1}.md`, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ai-generated-scripts.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to generate zip file", error);
      alert("Failed to create download file.");
    } finally {
      setIsDownloading(false);
    }
  };


  if (!selectedVariant || !analysis) {
    return <div className="p-4 bg-brand-surface rounded-xl">No script data available.</div>;
  }

  const noteParts = t.mockDataNote.split(':');
  const videoState = videoStates[selectedVariant.variant_id];
  
  const renderVideoButton = () => {
    if (isMockData) return null;

    if (isCheckingApiKey) {
      return (
        <button disabled className="flex items-center space-x-2 bg-brand-muted text-brand-text-dim font-medium text-sm px-3 py-1.5 rounded-md cursor-wait">
          <span>...</span>
        </button>
      );
    }

    if (!apiKeySelected) {
      return (
        <div className="relative group">
          <button
            onClick={onSelectApiKey}
            className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 font-medium text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1.75a1.75 1.75 0 01-1.75-1.75v-2.5A1.75 1.75 0 011.75 8H5.75A2.25 2.25 0 018 5.75V4a2 2 0 012-2h2.5" />
            </svg>
            <span>{t.selectApiKeyButton}</span>
          </button>
          <div className="absolute bottom-full right-0 mb-2 w-60 bg-brand-bg border border-brand-muted text-center text-xs text-brand-text-dim rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {t.selectApiKeyTooltip} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-accent underline">{t.apiKeyInfoLink}</a>
          </div>
        </div>
      );
    }

    const baseButtonClasses = "flex items-center space-x-2 font-medium text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait";

    if (videoState?.isLoading) {
      return (
        <button disabled className={`${baseButtonClasses} bg-brand-primary/50 text-white`}>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{t.generatingVideoButton}</span>
        </button>
      );
    }

    if (videoState?.error) {
      return (
        <button onClick={() => onGenerateVideo(selectedVariant)} className={`${baseButtonClasses} bg-red-500/20 text-red-300 hover:bg-red-500/30`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t.retryVideoButton}</span>
        </button>
      );
    }

    if (videoState?.videoUrl) {
      return (
        <button onClick={() => onViewVideo(videoState.videoUrl, selectedVariant.variant_id)} className={`${baseButtonClasses} bg-green-500/20 text-green-300 hover:bg-green-500/30`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{t.viewVideoButton}</span>
        </button>
      );
    }
    
    return (
      <button onClick={() => onGenerateVideo(selectedVariant)} className={`${baseButtonClasses} bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{t.generateVideoButton}</span>
      </button>
    );
  };

  const isEnhancingCurrentVariant = enhancingEvent?.variantIndex === selectedVariantIndex;
  const enhancingEventIndex = isEnhancingCurrentVariant ? enhancingEvent.eventIndex : null;
  
  const isRefiningCurrentVariant = refiningEvent?.variantIndex === selectedVariantIndex;
  const refiningEventIndex = isRefiningCurrentVariant ? refiningEvent.eventIndex : null;

  const hasWeakEvents = selectedVariant.timeline.some(event => event.isWeak);
  const isAnyBatchJobRunning = isEnhancingWeak === selectedVariantIndex || isEnhancingAll === selectedVariantIndex || !!enhancingEvent || !!refiningEvent;

  return (
    <div className="bg-brand-surface p-4 sm:p-6 rounded-xl border border-brand-muted">
       {isMockData && (
        <div className="mb-4 p-3 bg-indigo-900/50 border border-brand-primary rounded-lg text-sm text-indigo-200">
          <strong>{noteParts[0]}:</strong>{noteParts.slice(1).join(':')}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-brand-muted mb-4 gap-4">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {variants.map((variant, index) => (
            <button
              key={variant.variant_id}
              onClick={() => setSelectedVariantIndex(index)}
              className={`${
                index === selectedVariantIndex
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-brand-text-dim hover:text-brand-text hover:border-brand-muted'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
            >
              {t.variant} {index + 1}
            </button>
          ))}
        </nav>
        <div className="flex items-center space-x-2 pb-3 sm:pb-0">
          {renderVideoButton()}
          {!isMockData && variants.length > 0 && (
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="flex items-center space-x-2 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 font-medium text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
              aria-label="Download all script variants as a zip file"
            >
              {isDownloading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
              )}
              <span>{isDownloading ? t.downloadingButton : t.downloadButton}</span>
            </button>
          )}
        </div>
      </div>

      {videoState?.isLoading && (
        <div className="my-6 p-4 bg-brand-bg rounded-lg border border-brand-primary/50 text-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-3"></div>
             <p className="text-brand-text font-semibold">{t.generatingVideoButton}</p>
             <p className="text-brand-text-dim text-sm">{t.videoLoadingMessage}</p>
        </div>
      )}
       {videoState?.error && (
        <div className="my-6 p-4 bg-red-900/30 rounded-lg border border-red-500/50 text-center">
             <p className="text-red-300 font-semibold">{t.videoGenerationError}</p>
             <p className="text-red-300/80 text-sm mt-1">{videoState.error}</p>
        </div>
      )}

      {selectedVariant.sources && selectedVariant.sources.length > 0 && (
        <SourceCitation sources={selectedVariant.sources} t={t} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricsCard title={t.finishRateTitle} value={`${(analysis.predicted_finish_rate * 100).toFixed(2)}%`} tooltip={t.finishRateTooltip} />
        <MetricsCard title={t.replayScoreTitle} value={analysis.predicted_replay_score.toFixed(2)} tooltip={t.replayScoreTooltip} />
        <MetricsCard title={t.durationTitle} value={`${selectedVariant.duration_s}s`} tooltip={t.durationTooltip} />
        {selectedVariant.loopability_analysis && (
          <LoopAnalysis analysis={selectedVariant.loopability_analysis} t={t} />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-brand-text mb-3">{t.retentionChartTitle}</h3>
          <RetentionChart data={analysis.predicted_P_stay} t={t} />
        </div>
        {triggerImpact.length > 0 && (
          <div className="mt-6 xl:mt-0">
            <TriggerImpactAnalysis data={triggerImpactForChart} t={t}/>
          </div>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-brand-text">{t.timelineTitle}</h3>
          <div className="flex items-center space-x-2">
            {!isMockData && (
                <button
                    onClick={() => onEnhanceAllVisuals(selectedVariantIndex)}
                    disabled={isAnyBatchJobRunning}
                    className="flex items-center space-x-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 font-medium text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {isEnhancingAll === selectedVariantIndex ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10 3.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM10 6a4 4 0 100 8 4 4 0 000-8zM7.707 7.707a3 3 0 014.243 0 3 3 0 010 4.243 3 3 0 01-4.243 0 3 3 0 010-4.243z" />
                           <path d="M3.5 10a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5H4.25a.75.75 0 01-.75-.75zM16.5 10a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h2.5a.75.75 0 01.75.75z" />
                           <path d="M10 16.5a.75.75 0 01-.75-.75v-2.5a.75.75 0 011.5 0v2.5a.75.75 0 01-.75.75z" />
                       </svg>
                    )}
                    <span>{isEnhancingAll === selectedVariantIndex ? t.enhancingAllButton : t.enhanceAllButton}</span>
                </button>
            )}
            {hasWeakEvents && !isMockData && (
                <button
                    onClick={() => onEnhanceWeakVisuals(selectedVariantIndex)}
                    disabled={isAnyBatchJobRunning}
                    className="flex items-center space-x-2 bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30 font-medium text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    {isEnhancingWeak === selectedVariantIndex ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L8.414 4.586V3a1 1 0 00-1-1H5zm10 0a1 1 0 00-1 1v4.586l-1.293-1.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L16.414 3.586V3a1 1 0 00-1-1h-2zM5 12a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L8.414 16.586V15a1 1 0 00-1-1H5zm10 0a1 1 0 00-1 1v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L16.414 15.586V15a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                       </svg>
                    )}
                    <span>{isEnhancingWeak === selectedVariantIndex ? t.enhancingWeakButton : t.enhanceWeakButton}</span>
                </button>
            )}
          </div>
        </div>
        <Timeline 
          timeline={selectedVariant.timeline} 
          pStay={analysis.predicted_P_stay} 
          triggerImpact={triggerImpact} 
          t={t}
          lang={lang}
          onSuggestionClick={handleSuggestionClick}
          onEnhanceSingleVisual={(eventIndex) => onEnhanceSingleVisual(selectedVariantIndex, eventIndex)}
          enhancingEventIndex={enhancingEventIndex}
          onRefineEvent={(eventIndex, instruction) => onRefineEvent(selectedVariantIndex, eventIndex, instruction)}
          refiningEventIndex={refiningEventIndex}
          isBatchImproving={isEnhancingWeak === selectedVariantIndex || isEnhancingAll === selectedVariantIndex}
        />
      </div>
      <TriggerModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onApply={handleApplyModal}
        trigger={modalState.trigger}
        lang={lang}
        t={t}
      />
    </div>
  );
};

export default ScriptViewer;
