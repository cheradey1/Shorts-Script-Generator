
import React from 'react';

interface Source {
  uri: string;
  title: string;
}

interface SourceCitationProps {
  sources: Source[];
  t: any;
}

const SourceCitation: React.FC<SourceCitationProps> = ({ sources, t }) => {
  return (
    <div className="mb-4 p-3 bg-brand-bg border border-brand-muted rounded-lg">
      <h4 className="text-sm font-semibold text-brand-text mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-brand-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" />
        </svg>
        {t.sourcesTitle}
      </h4>
      <ul className="space-y-1 max-h-24 overflow-y-auto">
        {sources.map((source, index) => (
          <li key={index} className="flex items-start">
            <span className="text-brand-text-dim mr-2 text-xs pt-1">&#8226;</span>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-accent hover:underline break-all"
              title={source.uri}
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourceCitation;
