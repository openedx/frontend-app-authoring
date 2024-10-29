import React from 'react';
import {
  MenuItem,
  ModalDialog,
  SelectMenu,
} from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchContextProvider,
  SearchKeywordsField,
  Stats,
} from '../search-manager';
import EmptyStates from './EmptyStates';
import SearchResults from './SearchResults';
import messages from './messages';

const SearchUI: React.FC<{ courseId?: string, closeSearchModal?: () => void }> = (props) => {
  const hasCourseId = Boolean(props.courseId);
  const [searchThisCourseEnabled, setSearchThisCourse] = React.useState(hasCourseId);
  const switchToThisCourse = React.useCallback(() => setSearchThisCourse(true), []);
  const switchToAllCourses = React.useCallback(() => setSearchThisCourse(false), []);
  const searchThisCourse = hasCourseId && searchThisCourseEnabled;

  return (
    <SearchContextProvider
      extraFilter={[
        'type = "course_block"',
        ...(searchThisCourse ? [`context_key = "${props.courseId}"`] : []),
      ]}
      closeSearchModal={props.closeSearchModal}
    >
      {/* We need to override z-index here or the <Dropdown.Menu> appears behind the <ModalDialog.Body>
        * But it can't be more then 9 because the close button has z-index 10. */}
      <ModalDialog.Header style={{ zIndex: 9 }} className="border-bottom">
        <ModalDialog.Title><FormattedMessage {...messages.title} /></ModalDialog.Title>
        <div className="d-flex mt-3">
          <SearchKeywordsField className="flex-grow-1 mr-2" />
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
          <SearchResults />
        </EmptyStates>
      </ModalDialog.Body>
    </SearchContextProvider>
  );
};

export default SearchUI;
