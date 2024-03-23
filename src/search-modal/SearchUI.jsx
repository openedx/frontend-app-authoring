/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import {
  Dropdown,
  ModalDialog,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  HierarchicalMenu,
  InfiniteHits,
  InstantSearch,
  RefinementList,
  SearchBox,
  Stats,
} from 'react-instantsearch-dom';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

import SearchResult from './SearchResult';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';

/** @type {React.FC<{courseId: string, url: string, apiKey: string, indexName: string}>} */
const SearchUI = (props) => {
  const { searchClient } = React.useMemo(() => instantMeiliSearch(props.url, props.apiKey), [props.url, props.apiKey]);

  const [_searchThisCourseEnabled, setSearchThisCourse] = React.useState(!!props.courseId);
  const switchToThisCourse = React.useCallback(() => setSearchThisCourse(true), []);
  const switchToAllCourses = React.useCallback(() => setSearchThisCourse(false), []);
  const searchThisCourse = props.courseId && _searchThisCourseEnabled;

  return (
    <InstantSearch indexName={props.indexName} searchClient={searchClient}>
      {/* We need to override z-index here or the <Dropdown.Menu> appears behind the <ModalDialog.Body> */}
      <ModalDialog.Header style={{ zIndex: 10 }}>
        <ModalDialog.Title><FormattedMessage {...messages['courseSearch.title']} /></ModalDialog.Title>
        <div className="d-flex mt-3">
          <SearchBox className="flex-grow-1" />
          <Dropdown>
            <Dropdown.Toggle id="search-scope-toggle">
              {searchThisCourse ? 'This course' : 'All courses'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#" onClick={switchToThisCourse} active={searchThisCourse} disabled={!props.courseId}>This course</Dropdown.Item>
              <Dropdown.Item href="#" onClick={switchToAllCourses} active={!searchThisCourse}>All courses</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="d-flex mt-3 align-items-center">
          <SearchFilterWidget appliedFilters={[]} label="Type">
            <strong>Refine by component type:</strong>
            <RefinementList attribute="block_type" />
          </SearchFilterWidget>
          <SearchFilterWidget appliedFilters={[]} label="Tags">
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
          </SearchFilterWidget>
          <div className="flex-grow-1" />
          <div className="text-muted x-small align-middle"><Stats /></div>
        </div>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <InfiniteHits hitComponent={SearchResult} />
      </ModalDialog.Body>
    </InstantSearch>
  );
};

export default SearchUI;
