import React from 'react';

const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`bg-brand-bg animate-pulse rounded-lg ${className}`} />
);

const ScriptViewerPlaceholder: React.FC<{ t: any }> = ({ t }) => {
  return (
    <div className="bg-brand-surface p-4 sm:p-6 rounded-xl border border-brand-muted">
      <div className="flex flex-col items-center justify-center text-center mb-8 p-4 bg-brand-bg rounded-lg border border-brand-muted">
          <h2 className="text-2xl font-bold text-brand-text mb-2">{t.welcomeTitle}</h2>
          <p className="text-brand-text-dim">{t.welcomeMessage}</p>
      </div>

      <div className="opacity-50 pointer-events-none">
        <div className="flex justify-between items-center border-b border-brand-muted mb-4 pb-3">
          <div className="flex space-x-4">
              <SkeletonBox className="h-6 w-20" />
              <SkeletonBox className="h-6 w-20" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <SkeletonBox className="h-24" />
          <SkeletonBox className="h-24" />
          <SkeletonBox className="h-24" />
          <SkeletonBox className="h-24" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-brand-text mb-3">{t.retentionChartTitle}</h3>
            <SkeletonBox className="h-64" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-text mb-3">{t.triggerImpactTitle}</h3>
            <SkeletonBox className="h-64" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-brand-text mb-3">{t.timelineTitle}</h3>
          <div className="space-y-4">
              <div className="flex items-start space-x-3">
                  <SkeletonBox className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                      <SkeletonBox className="h-4 w-3/4" />
                      <SkeletonBox className="h-4 w-1/2" />
                  </div>
              </div>
              <div className="flex items-start space-x-3">
                  <SkeletonBox className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                      <SkeletonBox className="h-4 w-full" />
                      <SkeletonBox className="h-4 w-2/3" />
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptViewerPlaceholder;
