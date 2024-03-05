import React from 'react';
import {
  InstantSearch,
  InfiniteHits,
  HierarchicalMenu,
  SearchBox,
  Stats,
  Highlight
} from "react-instantsearch-dom";
import { useIntl } from '@edx/frontend-platform/i18n';
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import "instantsearch.css/themes/algolia-min.css";

interface Props {
  url: string;
  apiKey: string;
  indexName: string;
}


const SearchUI: React.FC<Props> = (props) => {
  const intl = useIntl();

  const {searchClient} = React.useMemo(() => instantMeiliSearch(props.url, props.apiKey), [props.url, props.apiKey]);

  return (
    <div className="ais-InstantSearch">
      <InstantSearch indexName={props.indexName} searchClient={searchClient}>
        <Stats />
        <SearchBox />
        <HierarchicalMenu
            attributes={[
                "tags.taxonomy",
                "tags.level0",
                "tags.level1",
                "tags.level2",
                "tags.level3",
            ]}
        />
        <InfiniteHits hitComponent={Hit} />
      </InstantSearch>
    </div>
  );
};

const Hit = ({ hit }) => (
  <div key={hit.id}>
    <div className="hit-name">
      <strong><Highlight attribute="display_name" hit={hit} /></strong>
    </div>
    <p className="hit-block_type"><em><Highlight attribute="block_type" hit={hit} /></em></p>
    <div className="hit-description">
      <Highlight attribute="html_content" hit={hit} />
      <Highlight attribute="capa_content" hit={hit} />
    </div>
  </div>
);

export default SearchUI;
