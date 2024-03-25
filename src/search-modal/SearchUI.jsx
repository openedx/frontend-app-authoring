/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import {
  Dropdown,
  ModalDialog,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Configure,
  HierarchicalMenu,
  InfiniteHits,
  InstantSearch,
  Stats,
} from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

import SearchResult from './SearchResult';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';
import SearchKeywordsField from './SearchKeywordsField';
import FilterByBlockType from './FilterByBlockType';

/** @type {React.FC<{courseId: string, url: string, apiKey: string, indexName: string}>} */
const SearchUI = (props) => {
  const { searchClient } = React.useMemo(() => instantMeiliSearch(props.url, props.apiKey), [props.url, props.apiKey]);

  const [_searchThisCourseEnabled, setSearchThisCourse] = React.useState(!!props.courseId);
  const switchToThisCourse = React.useCallback(() => setSearchThisCourse(true), []);
  const switchToAllCourses = React.useCallback(() => setSearchThisCourse(false), []);
  const searchThisCourse = props.courseId && _searchThisCourseEnabled;

  return (
    <InstantSearch indexName={props.indexName} searchClient={searchClient}>
      {/* Add in a filter for the current course, if relevant */}
      <Configure filters={searchThisCourse ? `context_key = "${props.courseId}"` : undefined} />
      {/* We need to override z-index here or the <Dropdown.Menu> appears behind the <ModalDialog.Body>
        * But it can't be more then 9 because the close button has z-index 10. */}
      <ModalDialog.Header style={{ zIndex: 9 }} className="border-bottom">
        <ModalDialog.Title><FormattedMessage {...messages['courseSearch.title']} /></ModalDialog.Title>
        <div className="d-flex mt-3">
          <SearchKeywordsField className="flex-grow-1 mr-1" />
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
          <FilterByBlockType />
          <SearchFilterWidget
            appliedFilters={[]}
            label={<FormattedMessage {...messages['courseSearch.blockTagsFilter']} />}
          >
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
      <ModalDialog.Body className="h-[calc(100vh-200px)]">
        <InfiniteHits hitComponent={SearchResult} />
      </ModalDialog.Body>
    </InstantSearch>
  );
};

export default SearchUI;
