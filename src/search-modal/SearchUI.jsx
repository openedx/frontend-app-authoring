/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import {
  MenuItem,
  ModalDialog,
  SelectMenu,
} from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Configure, InfiniteHits, InstantSearch } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

import ClearFiltersButton from './ClearFiltersButton';
import EmptyStates from './EmptyStates';
import SearchResult from './SearchResult';
import SearchKeywordsField from './SearchKeywordsField';
import FilterByBlockType from './FilterByBlockType';
import FilterByTags from './FilterByTags';
import Stats from './Stats';
import messages from './messages';

/** @type {React.FC<{courseId: string, url: string, apiKey: string, indexName: string}>} */
const SearchUI = (props) => {
  const { searchClient } = React.useMemo(
    () => instantMeiliSearch(props.url, props.apiKey, { primaryKey: 'id' }),
    [props.url, props.apiKey],
  );

  const hasCourseId = Boolean(props.courseId);
  const [_searchThisCourseEnabled, setSearchThisCourse] = React.useState(hasCourseId);
  const switchToThisCourse = React.useCallback(() => setSearchThisCourse(true), []);
  const switchToAllCourses = React.useCallback(() => setSearchThisCourse(false), []);
  const searchThisCourse = hasCourseId && _searchThisCourseEnabled;

  return (
    <InstantSearch
      indexName={props.indexName}
      searchClient={searchClient}
      // We enable this option as recommended by the documentation, for forwards compatibility with the next version:
      future={{ preserveSharedStateOnUnmount: true }}
    >
      {/* Add in a filter for the current course, if relevant */}
      <Configure filters={searchThisCourse ? `context_key = "${props.courseId}"` : undefined} />
      {/* We need to override z-index here or the <Dropdown.Menu> appears behind the <ModalDialog.Body>
        * But it can't be more then 9 because the close button has z-index 10. */}
      <ModalDialog.Header style={{ zIndex: 9 }} className="border-bottom">
        <ModalDialog.Title><FormattedMessage {...messages.title} /></ModalDialog.Title>
        <div className="d-flex mt-3">
          <SearchKeywordsField className="flex-grow-1 mr-1" />
          <SelectMenu variant="primary">
            <MenuItem
              onClick={switchToThisCourse}
              defaultSelected={searchThisCourse}
              iconAfter={searchThisCourse ? Check : undefined}
              disabled={!props.courseId}
            >
              <FormattedMessage {...messages.searchThisCourse} />
            </MenuItem>
            <MenuItem
              onClick={switchToAllCourses}
              defaultSelected={!searchThisCourse}
              iconAfter={searchThisCourse ? undefined : Check}
            >
              <FormattedMessage {...messages.searchAllCourses} />
            </MenuItem>
          </SelectMenu>
        </div>
        <div className="d-flex mt-3 align-items-center">
          <FilterByBlockType />
          <FilterByTags />
          <ClearFiltersButton />
          <div className="flex-grow-1" />
          <div className="text-muted x-small align-middle"><Stats /></div>
        </div>
      </ModalDialog.Header>
      <ModalDialog.Body className="h-[calc(100vh-200px)]">
        {/* If there are no results (yet), EmptyStates displays a friendly messages. Otherwise we see the results. */}
        <EmptyStates>
          <InfiniteHits hitComponent={SearchResult} />
        </EmptyStates>
      </ModalDialog.Body>
    </InstantSearch>
  );
};

export default SearchUI;
