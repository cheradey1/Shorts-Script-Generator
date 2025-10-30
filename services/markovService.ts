import { TimelineEvent, MarkovAnalysisResult, Trigger } from '../types';
import { BASE_P_STAY, TRIGGER_MULTIPLIERS } from '../constants';

const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

export const analyzeScriptRetention = (timeline: TimelineEvent[], duration: number): MarkovAnalysisResult => {
  const predicted_P_stay: number[] = [];
  let replayScore = 0.10; // Base replay score

  for (let t = 0; t < duration; t++) {
    const baseP = BASE_P_STAY[t] || BASE_P_STAY[BASE_P_STAY.length - 1]; // Use last value if duration exceeds base array
    let modifier = 0;
    
    // Find timeline events active at second 't'
    const activeEvents = timeline.filter(event => t >= event.sec_start && t < event.sec_end);
    
    const appliedTriggers = new Set<Trigger>();

    activeEvents.forEach(event => {
      (event.triggers || []).forEach(trigger => {
        if (!appliedTriggers.has(trigger)) {
            modifier += TRIGGER_MULTIPLIERS[trigger as Trigger] || 0;
            appliedTriggers.add(trigger);
            if (trigger === 'loop_hint') {
                replayScore += 0.08;
            }
        }
      });
    });

    const modifiedP = clamp(baseP + modifier, 0.0, 0.99);
    predicted_P_stay.push(modifiedP);
  }

  // Calculate finish rate
  const finishRate = predicted_P_stay.reduce((acc, p) => acc * p, 1.0);

  return {
    predicted_P_stay,
    predicted_finish_rate: finishRate,
    predicted_replay_score: clamp(replayScore, 0, 1),
  };
};

export interface TriggerImpact {
  trigger: Trigger;
  impact: number; // as percentage points
}

export const analyzeTriggerImpact = (timeline: TimelineEvent[], duration: number): TriggerImpact[] => {
  const baselineAnalysis = analyzeScriptRetention(timeline, duration);
  const baselineFinishRate = baselineAnalysis.predicted_finish_rate;

  const uniqueTriggers = [...new Set(timeline.flatMap(e => e.triggers || []))];

  const impacts: TriggerImpact[] = uniqueTriggers.map(triggerToOmit => {
    // Create a new timeline without the specific trigger
    const modifiedTimeline = timeline.map(event => ({
      ...event,
      triggers: (event.triggers || []).filter(t => t !== triggerToOmit)
    }));
    
    const modifiedAnalysis = analyzeScriptRetention(modifiedTimeline, duration);
    const modifiedFinishRate = modifiedAnalysis.predicted_finish_rate;

    const impact = (baselineFinishRate - modifiedFinishRate) * 100; // as percentage points

    return {
      trigger: triggerToOmit,
      impact: impact
    };
  });

  // Sort by impact, descending, and filter out negligible impacts
  return impacts.filter(i => i.impact > 0.01).sort((a, b) => b.impact - a.impact);
}