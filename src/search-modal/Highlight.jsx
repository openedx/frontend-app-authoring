/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';

/**
 * Render some text that contains <mark>...</mark> highlights
 * @type {React.FC<{text: string}>}
 */
const Highlight = ({ text }) => {
  const parts = text.split('<mark>');
  return (
    <span>
      {parts.map((part, idx) => {
        if (idx === 0) { return <React.Fragment key={idx}>{part}</React.Fragment>; }
        const endIdx = part.indexOf('</mark>');
        if (endIdx === -1) { return <React.Fragment key={idx}>{part}</React.Fragment>; }
        const highLightPart = part.substring(0, endIdx);
        const otherPart = part.substring(endIdx + 7);
        return <React.Fragment key={idx}><mark>{highLightPart}</mark>{otherPart}</React.Fragment>;
      })}
    </span>
  );
};

export default Highlight;
