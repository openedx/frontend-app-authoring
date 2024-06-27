/* eslint-disable react/no-array-index-key */
import React from 'react';

import { highlightPostTag, highlightPreTag } from './data/api';

/**
 * Render some text that contains matching words which should be highlighted
 */
const Highlight: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(highlightPreTag);
  return (
    <span>
      {parts.map((part, idx) => {
        if (idx === 0) { return <React.Fragment key={idx}>{part}</React.Fragment>; }
        const endIdx = part.indexOf(highlightPostTag);
        if (endIdx === -1) { return <React.Fragment key={idx}>{part}</React.Fragment>; }
        const highLightPart = part.substring(0, endIdx);
        const otherPart = part.substring(endIdx + highlightPostTag.length);
        return <React.Fragment key={idx}><mark>{highLightPart}</mark>{otherPart}</React.Fragment>;
      })}
    </span>
  );
};

export default Highlight;
