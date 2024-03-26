/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import {
  Highlight,

} from 'react-instantsearch';
import BlockTypeLabel from './BlockTypeLabel';

/**
 * A single search result (row), usually represents an XBlock/Component
 * @type {React.FC<{hit: import('instantsearch.js').Hit<{
 *   id: string,
 *   display_name: string,
 *   block_type: string,
 *   'content.html_content'?: string,
 *   'content.capa_content'?: string,
 *   breadcrumbs: {display_name: string}[]}>,
 * }>}
 */
const SearchResult = ({ hit }) => (
  <div key={hit.id} className="my-2 pb-2 border-bottom">
    <div className="hit-name small">
      <strong><Highlight attribute="display_name" hit={hit} /></strong>{' '}
      (<BlockTypeLabel type={hit.block_type} />)
    </div>
    <div className="hit-description x-small text-truncate">
      <Highlight attribute="content.html_content" hit={hit} />
      <Highlight attribute="content.capa_content" hit={hit} />
    </div>
    <div className="text-muted x-small">
      {hit.breadcrumbs.map((bc, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>{bc.display_name} {i !== hit.breadcrumbs.length - 1 ? '/' : ''} </span>
      ))}
    </div>
  </div>
);

export default SearchResult;
