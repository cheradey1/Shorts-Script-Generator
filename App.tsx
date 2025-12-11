import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ScriptViewer from './components/ScriptViewer';
import ScriptViewerPlaceholder from './components/ScriptViewerPlaceholder';
import TrendSpotter from './components/TrendSpotter';
import { getTranslations } from './locales/i18n';
import { generateScript, fetchTrends } from './services/geminiService';
import { ScriptVariant, TrendsData, Trend } from './types';
import { MOCK_SCRIPTS } from './constants';

export default function App() {
  // Language state
  const [language, setLanguage] = useState('uk');
  const t = useMemo(() => getTranslations(language), [language]);

  // Input form state
  const [idea, setIdea] = useState('');
  const [niche, setNiche] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [visualStyle, setVisualStyle] = useState<string[]>([]);
  const [optimizeForLoop, setOptimizeForLoop] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [scripts, setScripts] = useState<ScriptVariant[]>([]);

  // Trends state
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  
  // Development flags
  const [showMockData, setShowMockData] = useState(true);

  const handleGenerate = async () => {
    if (!idea || niche.length === 0) return;
    
    setIsLoading(true);
    try {
      const generatedScripts = await generateScript(idea, language);
      setScripts(generatedScripts);
      setShowMockData(false);
    } catch (error) {
      console.error('Failed to generate scripts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMock = () => {
    setScripts(MOCK_SCRIPTS);
    setShowMockData(true);
  };

  const handleClearSession = () => {
    if (window.confirm('Are you sure?')) {
      setScripts([]);
      if (!showMockData) {
        setShowMockData(true);
      }
    }
  };

  const handleFetchTrends = async () => {
    setIsTrendsLoading(true);
    setTrendsError(null);
    try {
      const trends = await fetchTrends(language);
      setTrendsData(trends);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      setTrendsError('Failed to fetch trends');
    } finally {
      setIsTrendsLoading(false);
    }
  };

  const handleTrendClick = (trend: Trend) => {
    setIdea(trend.title);
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Header 
        currentLanguage={language}
        onLanguageChange={setLanguage}
        t={t}
      />
      <main className="container mx-auto px-4 py-8">
        <TrendSpotter 
          isLoading={isTrendsLoading}
          error={trendsError}
          trends={trendsData}
          onFetchTrends={handleFetchTrends}
          onTrendClick={handleTrendClick}
          t={t}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4">
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
              onLoadMock={handleLoadMock}
              onClearSession={handleClearSession}
              hasSavedScripts={scripts.length > 0 && !showMockData}
              t={t}
              lang={language}
            />
          </div>
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-brand-surface rounded-xl p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mb-4"></div>
                <p className="text-brand-text-dim text-lg">{t.generatingButton}</p>
                <p className="text-brand-text-dim text-sm">This can take up to 30 seconds.</p>
              </div>
            ) : scripts.length > 0 ? (
              <ScriptViewer 
                variants={scripts}
                isMockData={showMockData}
                t={t}
                onApplyTrigger={() => {}}
                onEnhanceSingleVisual={() => {}}
                enhancingEvent={null}
                onEnhanceWeakVisuals={() => {}}
                isEnhancingWeak={null}
                onEnhanceAllVisuals={() => {}}
                isEnhancingAll={null}
                onRefineEvent={() => {}}
                refiningEvent={null}
                lang={language}
                onGenerateVideo={() => {}}
                videoStates={{}}
                apiKeySelected={false}
                isCheckingApiKey={false}
                onSelectApiKey={() => {}}
                onViewVideo={() => {}}
              />
            ) : (
              <ScriptViewerPlaceholder t={t} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
