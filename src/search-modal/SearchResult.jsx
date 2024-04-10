/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import BlockTypeLabel from './BlockTypeLabel';
import Highlight from './Highlight';

/**
 * A single search result (row), usually represents an XBlock/Component
 * @type {React.FC<{hit: import('./data/api').ContentHit}>}
 */
const SearchResult = ({ hit }) => (
  <div className="my-2 pb-2 border-bottom">
    <div className="hit-name small">
      <strong><Highlight text={hit.formatted.displayName} /></strong>{' '}
      (<BlockTypeLabel type={hit.blockType} />)
    </div>
    <div className="hit-description x-small text-truncate">
      <Highlight text={hit.formatted.content?.htmlContent ?? ''} />
      <Highlight text={hit.formatted.content?.capaContent ?? ''} />
    </div>
    <div className="text-muted x-small">
      {hit.breadcrumbs.map((bc, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>{bc.displayName} {i !== hit.breadcrumbs.length - 1 ? '/' : ''} </span>
      ))}
    </div>
  </div>
);

export default SearchResult;
