
import React, { useMemo, useState } from 'react';
import { TimelineEvent, Trigger } from '../types';
import { RETENTION_WEAK_THRESHOLD } from '../constants';
import { TriggerImpact } from '../services/markovService';
import { getTriggerInfo } from '../locales/i18n';

interface TimelineProps {
  timeline: TimelineEvent[];
  pStay: number[];
  triggerImpact: TriggerImpact[];
  t: any;
  lang: string;
  onSuggestionClick: (eventIndex: number, trigger: Trigger) => void;
  onEnhanceSingleVisual: (eventIndex: number) => void;
  enhancingEventIndex: number | null;
  onRefineEvent: (eventIndex: number, instruction: string) => void;
  refiningEventIndex: number | null;
  isBatchImproving: boolean;
}

const TriggerBadge: React.FC<{ triggerName: string; triggerKey: Trigger; impact?: number }> = ({ triggerName, triggerKey, impact = 0 }) => {
    const HIGH_IMPACT_THRESHOLD = 1.5; // in percentage points, e.g. hook, shock
    const MEDIUM_IMPACT_THRESHOLD = 0.5; // e.g. poignant_pov

    const styles: Record<string, { base: string, border: string }> = {
        hook: { base: 'bg-red-500/20 text-red-300', border: 'border-red-500/40' },
        shock: { base: 'bg-rose-500/20 text-rose-300', border: 'border-rose-500/40' },
        loop_hint: { base: 'bg-purple-500/20 text-purple-300', border: 'border-purple-500/40' },
        surprise_reveal: { base: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/40' },
        poignant_pov: { base: 'bg-indigo-500/20 text-indigo-300', border: 'border-indigo-500/40' },
        point_of_view_shot: { base: 'bg-blue-500/20 text-blue-300', border: 'border-blue-500/40' },
        satisfying_visual: { base: 'bg-emerald-500/20 text-emerald-300', border: 'border-emerald-500/40' },
        curiosity_question: { base: 'bg-sky-500/20 text-sky-300', border: 'border-sky-500/40' },
        jump_cut: { base: 'bg-cyan-500/20 text-cyan-300', border: 'border-cyan-500/40' },
        cta: { base: 'bg-green-500/20 text-green-300', border: 'border-green-500/40' },
        pattern_interrupt: { base: 'bg-teal-500/20 text-teal-300', border: 'border-teal-500/40' },
        callback_joke: { base: 'bg-lime-500/20 text-lime-300', border: 'border-lime-500/40' },
        foreshadowing: { base: 'bg-violet-500/20 text-violet-300', border: 'border-violet-500/40' },
        visual_metaphor: { base: 'bg-pink-500/20 text-pink-300', border: 'border-pink-500/40' },
        text_overlay_bold: { base: 'bg-brand-muted text-brand-text-dim', border: 'border-transparent' },
        music_cue: { base: 'bg-brand-muted text-brand-text-dim', border: 'border-transparent' },
        context: { base: 'bg-brand-muted text-brand-text-dim', border: 'border-transparent' },
        sound_effect: { base: 'bg-brand-muted text-brand-text-dim', border: 'border-transparent' },
        quick_zoom: { base: 'bg-brand-muted text-brand-text-dim', border: 'border-transparent' },
        default: { base: 'bg-brand-muted text-brand-text-dim', border: 'border-transparent' },
    };

    const triggerStyle = styles[triggerKey] || styles.default;
    let styleClass = triggerStyle.base;
    
    if (impact >= HIGH_IMPACT_THRESHOLD) {
        styleClass += ` border ${triggerStyle.border}`;
    } 
    else if (impact < MEDIUM_IMPACT_THRESHOLD && triggerKey !== 'cta') {
        styleClass = styles.default.base;
    }

    return <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${styleClass}`}>{triggerName}</span>
}

const Timeline: React.FC<TimelineProps> = ({ timeline, pStay, triggerImpact, t, lang, onSuggestionClick, onEnhanceSingleVisual, enhancingEventIndex, onRefineEvent, refiningEventIndex, isBatchImproving }) => {
  const [refineInstructions, setRefineInstructions] = useState<Record<number, string>>({});

  const handleInstructionChange = (index: number, value: string) => {
      setRefineInstructions(prev => ({ ...prev, [index]: value }));
  };

  const impactMap = useMemo(() => 
    new Map(triggerImpact.map(item => [item.trigger, item.impact])), 
    [triggerImpact]
  );
  
  const hasLoopHint = timeline.some(event => (event.triggers || []).includes('loop_hint'));


  return (
    <div className="flow-root relative">
      {hasLoopHint && (
        <div className="absolute top-0 right-0 h-full w-24 pointer-events-none" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 100 600" preserveAspectRatio="none">
            <path d="M 90 590 C 20 500, 20 100, 90 10" stroke="#A855F7" fill="none" strokeWidth="2" strokeDasharray="4 4"/>
            <circle cx="50" cy="300" r="10" fill="#A855F7" />
             <path d="M 45 305 L 50 300 L 55 305" stroke="white" fill="none" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 55 295 L 50 300 L 45 295" stroke="white" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <ul role="list" className="-mb-8">
        {timeline.map((event, eventIdx) => {
          const isWeak = !!event.isWeak;
          const hasSuggestions = event.suggested_triggers && event.suggested_triggers.length > 0;
          const hasHighlightTrigger = (event.triggers || []).some(t =>
            ['hook', 'shock', 'loop_hint'].includes(t)
          );
          const isEnhancing = enhancingEventIndex === eventIdx;
          const isRefining = refiningEventIndex === eventIdx;
          const instruction = refineInstructions[eventIdx] || '';

          const lineClass = hasHighlightTrigger ? 'bg-brand-primary' : 'bg-brand-muted';
          const circleClass = hasHighlightTrigger ? 'bg-brand-primary/80 ring-brand-primary/30' : 'bg-brand-muted ring-brand-muted/30';

          return (
          <li key={event.sec_start}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span className={`absolute left-4 top-4 -ml-px h-full w-0.5 transition-colors duration-300 ${lineClass}`} aria-hidden="true" />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 transition-colors duration-300 ${isWeak ? 'bg-red-900/50 ring-red-500/30' : circleClass}`}>
                    <span className="text-sm font-mono">{String(event.sec_start).padStart(2, '0')}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-brand-text-dim">
                        {event.sec_start}s - {event.sec_end}s
                    </p>
                    {isWeak && <span className="text-xs font-semibold text-red-400 bg-red-900/50 px-2 py-1 rounded-md">{t.retentionRisk}</span>}
                  </div>
                  <p className="mt-1 text-md text-brand-text font-semibold">"{event.caption}"</p>
                  <div className="mt-2 text-sm text-brand-text-dim space-y-1">
                      <p><strong className="font-medium text-brand-text-dim/80">{t.visual}:</strong> {event.visual}</p>
                      <p><strong className="font-medium text-brand-text-dim/80">{t.audio}:</strong> {event.audio}</p>
                  </div>
                  {event.triggers && event.triggers.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                          {event.triggers.map(trigger => 
                            <TriggerBadge 
                                key={trigger} 
                                triggerKey={trigger}
                                triggerName={getTriggerInfo(lang, trigger).name}
                                impact={impactMap.get(trigger)} 
                            />
                          )}
                      </div>
                  )}
                  {hasSuggestions && (
                    isWeak ? (
                        <div className="mt-3 pt-3 border-t border-red-500/30 bg-red-900/20 p-3 rounded-lg -mx-3">
                            <h4 className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {t.retentionFixSuggestions}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                {event.suggested_triggers.map(trigger => (
                                <button 
                                    key={trigger} 
                                    onClick={() => onSuggestionClick(eventIdx, trigger)}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 border border-red-500/40 hover:bg-red-500/20 hover:border-red-500/60 text-red-300 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>{getTriggerInfo(lang, trigger).name}</span>
                                </button>
                                ))}
                                <button
                                    onClick={() => onEnhanceSingleVisual(eventIdx)}
                                    disabled={isEnhancing || isRefining || isBatchImproving}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-brand-accent/10 border border-brand-accent/40 hover:bg-brand-accent/20 text-brand-accent transition-colors disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isEnhancing ? (
                                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L8.414 4.586V3a1 1 0 00-1-1H5zm10 0a1 1 0 00-1 1v4.586l-1.293-1.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L16.414 3.586V3a1 1 0 00-1-1h-2zM5 12a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L8.414 16.586V15a1 1 0 00-1-1H5zm10 0a1 1 0 00-1 1v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L16.414 15.586V15a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span>{isEnhancing ? t.generatingButton.replace('...', '') : t.enhanceVisualButton}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-3 pt-3 border-t border-brand-muted/20">
                            <h4 className="text-xs font-semibold text-brand-text-dim mb-2 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                {t.suggestions}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {event.suggested_triggers.map(trigger => (
                                <button 
                                    key={trigger} 
                                    onClick={() => onSuggestionClick(eventIdx, trigger)}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-transparent border border-dashed border-brand-muted hover:border-brand-accent hover:text-brand-accent text-brand-text-dim transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>{getTriggerInfo(lang, trigger).name}</span>
                                </button>
                                ))}
                            </div>
                        </div>
                    )
                  )}
                   <div className="mt-4 pt-3 border-t border-brand-muted/20">
                     <div className="flex items-start space-x-2">
                         <textarea
                            value={instruction}
                            onChange={(e) => handleInstructionChange(eventIdx, e.target.value)}
                            rows={1}
                            placeholder={t.refinePlaceholder}
                            className="w-full text-xs bg-brand-bg border border-brand-muted rounded-md p-1.5 text-brand-text focus:ring-1 focus:ring-brand-secondary focus:outline-none resize-none"
                            disabled={isRefining || isEnhancing || isBatchImproving}
                         />
                         <button 
                            onClick={() => onRefineEvent(eventIdx, instruction)}
                            disabled={!instruction || isRefining || isEnhancing || isBatchImproving}
                            className="px-3 py-1 text-xs font-semibold rounded-md bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 transition-colors disabled:opacity-50 disabled:cursor-wait flex-shrink-0"
                         >
                            {isRefining ? t.refiningButton : t.refineButton}
                         </button>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </li>
        )})}
      </ul>
    </div>
  );
};

export default Timeline;
