import React from 'react';
import staticContentMap from '../data/formStaticContent';

export default function StaticContentRenderer({ formName }) {
  const content = staticContentMap[formName];

  if (!content) return null;

  if (typeof content === 'string') {
    return <p className="text-sm whitespace-pre-line mb-6">{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <div className="text-sm whitespace-pre-line mb-6 space-y-4">
        {content.map(block => (
          <p key={block.id}>{block.text}</p>
        ))}
      </div>
    );
  }

  return null;
}
