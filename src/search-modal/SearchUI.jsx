/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import {
  HierarchicalMenu,
  InfiniteHits,
  InstantSearch,
  RefinementList,
  SearchBox,
  Stats,
} from 'react-instantsearch-dom';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import 'instantsearch.css/themes/algolia-min.css';

import SearchResult from './SearchResult';

/* This component will be replaced by a new search UI component that will be developed in the future.
 * See:
 *  - https://github.com/openedx/modular-learning/issues/200
 *  - https://github.com/openedx/modular-learning/issues/201
 */
/* istanbul ignore next */
/** @type {React.FC<{url: string, apiKey: string, indexName: string}>} */
const SearchUI = (props) => {
  const { searchClient } = React.useMemo(
    () => instantMeiliSearch(props.url, props.apiKey, { primaryKey: 'id' }),
    [props.url, props.apiKey],
  );

  return (
    <div className="ais-InstantSearch">
      <InstantSearch indexName={props.indexName} searchClient={searchClient}>
        <Stats />
        <SearchBox />
        <strong>Refine by component type:</strong>
        <RefinementList attribute="block_type" />
        <strong>Refine by tag:</strong>
        <HierarchicalMenu
          attributes={[
            'tags.taxonomy',
            'tags.level0',
            'tags.level1',
            'tags.level2',
            'tags.level3',
          ]}
        />
        <InfiniteHits hitComponent={SearchResult} />
      </InstantSearch>
    </div>
  );
};

export default SearchUI;
