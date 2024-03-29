/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { Highlight } from 'react-instantsearch-dom';

/* This component will be replaced by a new search UI component that will be developed in the future.
 * See:
 *  - https://github.com/openedx/modular-learning/issues/200
 *  - https://github.com/openedx/modular-learning/issues/201
 */
/* istanbul ignore next */
/** @type {React.FC<{hit: import('react-instantsearch-core').Hit<{
 *   id: string,
 *   breadcrumbs: {display_name: string}[]}>,
 * }>} */
const SearchResult = ({ hit }) => (
  <>
    <div className="hit-name">
      <strong><Highlight attribute="display_name" hit={hit} /></strong>
    </div>
    <p className="hit-block_type"><em><Highlight attribute="block_type" hit={hit} /></em></p>
    <div className="hit-description">
      <Highlight attribute="content.html_content" hit={hit} />
      <Highlight attribute="content.capa_content" hit={hit} />
    </div>
    <div style={{ fontSize: '8px' }}>
      {hit.breadcrumbs.map((bc, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>{bc.display_name} {i !== hit.breadcrumbs.length - 1 ? '>' : ''} </span>
      ))}
    </div>
  </>
);

export default SearchResult;
