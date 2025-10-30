import React, { useState } from 'react';
import { TrendsData, Trend } from '../types';

interface TrendSpotterProps {
    isLoading: boolean;
    error: string | null;
    trends: TrendsData | null;
    onFetchTrends: () => void;
    onTrendClick: (trend: Trend) => void;
    t: any;
}

type TrendSource = 'youtube_shorts' | 'tiktok' | 'google_trends';

const TrendSpotter: React.FC<TrendSpotterProps> = ({ isLoading, error, trends, onFetchTrends, onTrendClick, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TrendSource>('youtube_shorts');

    const renderTabs = () => (
        <div className="border-b border-brand-muted">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                {(Object.keys(trends || {}) as TrendSource[]).map((source) => (
                    <button
                        key={source}
                        onClick={() => setActiveTab(source)}
                        className={`${
                            activeTab === source
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-brand-text-dim hover:text-brand-text hover:border-brand-muted'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                    >
                        {t[source] || source}
                    </button>
                ))}
            </nav>
        </div>
    );
    
    const renderTrendList = (trendList: Trend[]) => (
        <div className="space-y-3 mt-4 pr-2 max-h-80 overflow-y-auto">
            {trendList.map((trend, index) => (
                <button
                    key={index}
                    onClick={() => onTrendClick(trend)}
                    className="w-full text-left p-3 bg-brand-bg rounded-lg hover:bg-brand-muted/50 border border-brand-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    <p className="font-semibold text-brand-text">{trend.title}</p>
                    <p className="text-sm text-brand-text-dim mt-1">{trend.description}</p>
                    <span className="mt-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-brand-muted text-brand-text-dim">{trend.niche}</span>
                </button>
            ))}
        </div>
    );

    return (
        <div className="bg-brand-surface rounded-xl border border-brand-muted">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4"
                aria-expanded={isOpen}
            >
                <div className="text-left">
                    <h2 className="text-lg font-bold text-brand-text">{t.trendSpotterTitle}</h2>
                    <p className="text-sm text-brand-text-dim">{t.searchTrendsDescription}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-brand-text-dim transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="p-4 border-t border-brand-muted">
                    {!trends && !isLoading && !error && (
                         <div className="text-center">
                            <button
                                onClick={onFetchTrends}
                                disabled={isLoading}
                                className="bg-brand-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-500 disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors"
                            >
                                {t.searchTrendsButton}
                            </button>
                        </div>
                    )}
                   
                    {isLoading && (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    {trends && !isLoading && (
                        <div>
                            <div className="flex justify-between items-center">
                                {renderTabs()}
                                <p className="text-xs text-brand-text-dim italic hidden sm:block">{t.autoFillFormHint}</p>
                            </div>
                            {renderTrendList(trends[activeTab])}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrendSpotter;
