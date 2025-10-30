import React, { useMemo } from 'react';
import { getContentTypes, getNiches, getVisualStyles } from '../locales/i18n';

interface InputFormProps {
  idea: string;
  onIdeaChange: (value: string) => void;
  selectedNiches: string[];
  onNicheChange: (value: string[]) => void;
  selectedContentTypes: string[];
  onContentTypesChange: (value: string[]) => void;
  selectedVisualStyles: string[];
  onVisualStyleChange: (value: string[]) => void;
  optimizeForLoop: boolean;
  onOptimizeForLoopChange: (value: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onLoadMock: () => void;
  onClearSession: () => void;
  hasSavedScripts: boolean;
  t: any;
  lang: string;
}
  
const InputForm: React.FC<InputFormProps> = ({ 
    idea, onIdeaChange, 
    selectedNiches, onNicheChange, 
    selectedContentTypes, onContentTypesChange,
    selectedVisualStyles, onVisualStyleChange,
    optimizeForLoop, onOptimizeForLoopChange,
    onSubmit, isLoading, onLoadMock,
    onClearSession, hasSavedScripts, t, lang 
}) => {
  
  const contentTypesData = useMemo(() => getContentTypes(lang), [lang]);
  const nichesData = useMemo(() => getNiches(lang), [lang]);
  const visualStylesData = useMemo(() => getVisualStyles(lang), [lang]);

  const createCheckboxHandler = (currentSelection: string[], setter: (value: string[]) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setter(
      checked ? [...currentSelection, value] : currentSelection.filter(item => item !== value)
    );
  };
  
  const handleNicheChange = createCheckboxHandler(selectedNiches, onNicheChange);
  const handleContentTypeChange = createCheckboxHandler(selectedContentTypes, onContentTypesChange);
  const handleVisualStyleChange = createCheckboxHandler(selectedVisualStyles, onVisualStyleChange);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea && selectedNiches.length > 0) {
      onSubmit();
    }
  };

  const renderCheckboxGroup = (
    data: { category: string; items: { name: string; description: string }[] }[],
    selectedItems: string[],
    handler: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className="max-h-60 overflow-y-auto space-y-1 p-2 bg-brand-bg rounded-md border border-brand-muted">
      {data.map(({ category, items }) => (
        <details key={category} className="group rounded-md transition-colors hover:bg-brand-muted/20" open>
          <summary className="list-none flex items-center justify-between cursor-pointer p-2 text-sm font-medium text-brand-text-dim hover:text-brand-text">
            <span>{category}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </summary>
          <div className="pt-2 pl-4 pr-2 pb-1 border-t border-brand-muted/50">
            {items.map(item => (
              <div key={item.name} className="relative group/item">
                <label className="flex items-center space-x-3 my-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={item.name}
                    checked={selectedItems.includes(item.name)}
                    onChange={handler}
                    className="h-4 w-4 bg-brand-muted border-brand-muted/50 rounded text-brand-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary"
                  />
                  <span className="text-sm text-brand-text-dim hover:text-brand-text">{item.name}</span>
                </label>
                 <div className="absolute bottom-full mb-2 left-0 w-64 bg-brand-bg border border-brand-muted text-left text-xs text-brand-text-dim rounded-md p-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 z-20 pointer-events-none shadow-lg">
                    <strong className="text-brand-text block mb-1">{item.name}</strong>
                    {item.description}
                </div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );

  return (
    <div className="bg-brand-surface p-6 rounded-xl border border-brand-muted sticky top-24">
      <h2 className="text-lg font-semibold text-brand-text mb-4">{t.formTitle}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="idea" className="block text-sm font-medium text-brand-text-dim mb-1">
            {t.ideaLabel}
          </label>
          <textarea
            id="idea"
            rows={4}
            value={idea}
            onChange={(e) => onIdeaChange(e.target.value)}
            className="w-full bg-brand-bg border border-brand-muted rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-primary focus:outline-none"
            placeholder={t.ideaPlaceholder}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-dim mb-1">
            {t.nicheLabel}
          </label>
           {renderCheckboxGroup(nichesData, selectedNiches, handleNicheChange)}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-dim mb-1">
            {t.visualStyleLabel}
          </label>
          {renderCheckboxGroup(visualStylesData, selectedVisualStyles, handleVisualStyleChange)}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-dim mb-1">
            {t.contentTypeLabel}
          </label>
          {renderCheckboxGroup(contentTypesData, selectedContentTypes, handleContentTypeChange)}
        </div>

         <div>
            <label className="flex items-center space-x-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={optimizeForLoop}
                    onChange={(e) => onOptimizeForLoopChange(e.target.checked)}
                    className="h-4 w-4 bg-brand-muted border-brand-muted/50 rounded text-brand-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary"
                />
                <span className="text-sm font-medium text-brand-text-dim hover:text-brand-text">{t.optimizeForLoopLabel}</span>
            </label>
        </div>


        <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !idea || selectedNiches.length === 0}
              className="w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-500 disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.generatingButton}
                </>
              ) : (
                t.generateButton
              )}
            </button>
            <div className="flex space-x-2">
               <button
                type="button"
                onClick={onLoadMock}
                className="w-full bg-brand-muted/50 text-brand-text-dim font-semibold py-2 px-4 rounded-md hover:bg-brand-muted/80 transition-colors"
              >
                {t.loadExampleButton}
              </button>
              <button
                type="button"
                onClick={onClearSession}
                disabled={!hasSavedScripts || isLoading}
                className="w-full flex items-center justify-center space-x-2 text-red-400 font-semibold py-2 px-4 rounded-md hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                aria-label="Clear all saved scripts"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{t.clearSavedButton}</span>
              </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default InputForm;