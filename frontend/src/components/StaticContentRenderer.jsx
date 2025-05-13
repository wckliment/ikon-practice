import React from 'react';
import staticContentMap from '../data/formStaticContent';

export default function StaticContentRenderer({ formName }) {
  const staticText = staticContentMap[formName];

  // 🔍 Diagnostic log
  console.log("📄 StaticContentRenderer called with:", formName);
  console.log("📄 Matched static text:", staticText);

  if (!staticText) return null;

  return (
    <div className="text-sm text-gray-800 space-y-4 whitespace-pre-line mt-6">
      {Array.isArray(staticText)
        ? staticText.map((block) => (
            <p key={block.id || block.text.slice(0, 20)}>{block.text}</p>
          ))
        : staticText
            .split('\n')
            .filter((para) => para.trim().length > 0)
            .map((para, idx) => <p key={idx}>{para.trim()}</p>)}
    </div>
  );
}
