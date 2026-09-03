import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Pagination,
  Row,
  SearchField,
} from '@openedx/paragon';
import { debounce } from 'lodash';

import AlertMessage from '@src/generic/alert-message';
import { LoadingSpinner } from '@src/generic/Loading';
import { useStudioHomeCoursesV2 } from '@src/studio-home/data/apiHooks';
import type { CompetencyTreeNode } from '../CompetencyTree';
import CourseRow from './CourseRow';
import messages from './messages';

export interface CourseSearchBrowseProps {
  /** The competency currently selected in the competency tree, or `null`
   * when nothing is selected yet. Course search/browsing is disabled until
   * a competency is active.
   */
  activeCompetency: CompetencyTreeNode | null;
}

const PAGE_SIZE = 10;

// A stable no-op for `SearchField`'s required `onSubmit` prop. Paragon's
// `SearchFieldAdvanced` re-invokes its own `onChange` handler whenever that
// prop's reference changes, not only when the search value itself changes
// (see `handleSearchChange` below, which is memoized for exactly this
// reason) - `onSubmit` isn't known to have the same effect today, but a
// stable reference costs nothing and avoids relying on that not changing.
const noop = () => {};

/** CourseSearchBrowse
 * Search/browse pane for the competency management page: lets the user find
 * a course (by name, debounced as they type) and paginate through results,
 * once a competency is selected in the tree alongside this component.
 */
const CourseSearchBrowse = ({ activeCompetency }: CourseSearchBrowseProps) => {
  const intl = useIntl();
  // `inputValue` is the raw, immediate field value (so typing feels
  // responsive); `search` is the debounced value that actually drives the
  // query below.
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Any real change to the debounced search value starts the results over
  // at page 1. Both `search` and `page` are set together, in the same
  // state-update batch, so a render never sees the old page number paired
  // with the new search value (which would fire a wasted, possibly
  // out-of-range request before the page-1 correction caught up).
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 400),
    [],
  );
  useEffect(() => () => debouncedUpdateSearch.cancel(), [debouncedUpdateSearch]);

  // Memoized (not a plain inline function) because `SearchFieldAdvanced` re-fires
  // its own onChange-calling effect whenever this reference changes on its own,
  // even if the search value didn't - see `noop` above. An unmemoized version of
  // this handler fed a stale value back on every parent re-render, flipping
  // `inputValue` back and forth forever the moment anything else (e.g. clearing
  // the search) also changed `inputValue` in the same render pass.
  const handleSearchChange = useCallback((value: string) => {
    setInputValue(value);
    debouncedUpdateSearch(value);
  }, [debouncedUpdateSearch]);

  const handleClearSearch = useCallback(() => {
    debouncedUpdateSearch.cancel();
    setInputValue('');
    setSearch('');
    setPage(1);
  }, [debouncedUpdateSearch]);

  const { data, isLoading, isError } = useStudioHomeCoursesV2(
    { page, pageSize: PAGE_SIZE, search, order: 'display_name' },
    { enabled: !!activeCompetency },
  );

  if (!activeCompetency) {
    return <p>{intl.formatMessage(messages.selectCompetencyPrompt)}</p>;
  }

  const courses = data?.results.courses ?? [];
  const numPages = data?.numPages ?? 0;

  let body: ReactNode;
  if (isLoading) {
    body = (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  } else if (isError) {
    body = (
      <AlertMessage
        variant="danger"
        description={intl.formatMessage(messages.errorMessage)}
      />
    );
  } else if (courses.length === 0) {
    body = (
      <div className="mt-4">
        <p>
          {intl.formatMessage(search ? messages.noMatchingCourses : messages.noAccessibleCourses)}
        </p>
        {search && (
          <Button variant="primary" onClick={handleClearSearch}>
            {intl.formatMessage(messages.clearSearchButtonLabel)}
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        {courses.map((course) => <CourseRow key={course.courseKey} course={course} />)}
        {numPages > 1 && (
          <Pagination
            pageCount={numPages}
            currentPage={page}
            onPageSelect={setPage}
            paginationLabel="pagination navigation"
            className="d-flex justify-content-center w-100"
          />
        )}
      </>
    );
  }

  return (
    <div>
      <SearchField
        onSubmit={noop}
        onChange={handleSearchChange}
        value={inputValue}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
      />
      {body}
    </div>
  );
};

export default CourseSearchBrowse;
