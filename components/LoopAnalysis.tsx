
import React from 'react';
import { LoopabilityAnalysis } from '../types';

interface LoopAnalysisProps {
  analysis: LoopabilityAnalysis;
  t: any;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const scoreColor =
        score >= 8 ? 'bg-brand-accent/20 text-brand-accent' :
        score >= 5 ? 'bg-yellow-400/20 text-yellow-400' :
        'bg-red-400/20 text-red-400';
    return <span className={`font-bold px-2 py-1 rounded-md text-xs ${scoreColor}`}>{score}/10</span>;
};

const LoopAnalysis: React.FC<LoopAnalysisProps> = ({ analysis, t }) => {
  const { score, analysis: analysisText, transition_point_analysis } = analysis;
  const percentage = score * 10;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const scoreColor =
    score >= 8 ? 'text-brand-accent' :
    score >= 5 ? 'text-yellow-400' :
    'text-red-400';

  const trackColor =
    score >= 8 ? 'stroke-brand-accent' :
    score >= 5 ? 'stroke-yellow-400' :
    'stroke-red-400';


  return (
    <div className="bg-brand-bg p-4 rounded-lg border border-brand-muted h-full flex flex-col">
       <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-brand-text-dim">{t.loopAnalysisTitle}</h4>
            <div className="relative group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-brand-bg border border-brand-muted text-center text-xs text-brand-text-dim rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    {t.loopAnalysisTooltip}
                </div>
            </div>
        </div>
        <div className="flex-grow flex items-center justify-center -my-2">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 80 80">
                    <circle
                        className="stroke-brand-muted"
                        strokeWidth="5"
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                    />
                    <circle
                        className={`transform -rotate-90 origin-center transition-all duration-500 ${trackColor}`}
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                    />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${scoreColor}`}>
                    {score}<span className="text-sm">/10</span>
                </div>
            </div>
        </div>
       <p className="text-xs text-brand-text-dim text-center mt-2">{analysisText}</p>
       
       <details className="mt-3 text-xs group">
          <summary className="list-none flex items-center justify-center cursor-pointer text-brand-text-dim hover:text-brand-text font-medium">
              <span>{t.detailedAnalysisTitle}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
          </summary>
          <div className="mt-2 pt-2 border-t border-brand-muted/50 space-y-3 text-brand-text-dim">
              <div>
                  <div className="flex justify-between items-center mb-1">
                      <h5 className="font-semibold">{t.visualTransition}</h5>
                      <ScoreBadge score={transition_point_analysis.visual_match_score} />
                  </div>
                  <div className="space-y-1">
                      <p><strong className="font-medium text-brand-text-dim/80">{t.endCue}:</strong> {transition_point_analysis.last_event_visual}</p>
                      <p><strong className="font-medium text-brand-text-dim/80">{t.startCue}:</strong> {transition_point_analysis.first_event_visual}</p>
                  </div>
              </div>
              <div>
                  <div className="flex justify-between items-center mb-1">
                      <h5 className="font-semibold">{t.audioTransition}</h5>
                      <ScoreBadge score={transition_point_analysis.audio_match_score} />
                  </div>
                  <div className="space-y-1">
                      <p><strong className="font-medium text-brand-text-dim/80">{t.endCue}:</strong> {transition_point_analysis.last_event_audio}</p>
                      <p><strong className="font-medium text-brand-text-dim/80">{t.startCue}:</strong> {transition_point_analysis.first_event_audio}</p>
                  </div>
              </div>
              {transition_point_analysis.suggestion_for_improvement && transition_point_analysis.suggestion_for_improvement !== 'N/A' && (
                <div className="pt-2 border-t border-brand-muted/50">
                    <h5 className="font-semibold mb-1">{t.suggestionForImprovement}</h5>
                    <p className="italic">{transition_point_analysis.suggestion_for_improvement}</p>
                </div>
              )}
          </div>
       </details>

    </div>
  );
};

export default LoopAnalysis;