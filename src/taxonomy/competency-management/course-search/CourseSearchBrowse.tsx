import {
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  IconButton,
  Pagination,
  Row,
  SearchField,
  Stack,
} from '@openedx/paragon';
import { Calendar, Close } from '@openedx/paragon/icons';
import { debounce } from 'lodash';
import DatePicker from 'react-datepicker';

import AlertMessage from '@src/generic/alert-message';
import { LoadingSpinner } from '@src/generic/Loading';
import { DATE_FORMAT } from '@src/constants';
import { useStudioHomeCoursesV2 } from '@src/studio-home/data/apiHooks';
import { useCompetencyAssociations } from '@src/taxonomy/competency-management/CompetencyAssociationsContext';
import type { CompetencyTreeNode } from '@src/taxonomy/competency-management/CompetencyTree';
import CourseListSummary from './CourseListSummary';
import CourseRow from './CourseRow';
import CriteriaAssociationsSection from './CriteriaAssociationsSection';
import messages from './messages';
// @ts-ignore
import './CourseSearchBrowse.scss';

export interface CourseSearchBrowseProps {
  /** The competency currently selected in the competency tree. The parent
   * only mounts this component once a competency is active - see
   * `CompetencyAssociationsPanel`. Its `value` names the competency in the
   * "Demonstrate Mastery For" line above the course list.
   */
  activeCompetency: CompetencyTreeNode;
}

// The summary line's "of N Courses" total: the list's own endpoint with no
// search or date parameter, so the response's `count` is every course the
// author can access, and the smallest page it serves, since only `count` is
// read. Keep the filters out of it, or the total would follow them.
const ACCESSIBLE_COURSES_COUNT_PARAMS = { pageSize: 1 };

// A stable no-op for `SearchField`'s required `onSubmit` prop. Paragon's
// `SearchFieldAdvanced` re-invokes its own `onChange` handler whenever that
// prop's reference changes, not only when the search value itself changes
// (see `handleSearchChange` below, which is memoized for exactly this
// reason) - `onSubmit` isn't known to have the same effect today, but a
// stable reference costs nothing and avoids relying on that not changing.
const noop = () => {};

interface DateRangeTriggerProps {
  /** Accessible name and visible text, passed down rather than looked up
   * again here via `useIntl` since the parent already has it.
   */
  label: string;
  /** Injected by react-datepicker's `customInput` mechanism - opens the
   * calendar popup on click.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Injected by react-datepicker: the `className` passed to `<DatePicker>`
   * itself. Forwarded so the trigger picks up the same
   * `.datepicker-custom-control` box styling every other datepicker trigger
   * in this app uses.
   */
  className?: string;
}

/** DateRangeTrigger
 * Trigger button rendered in place of react-datepicker's default `<input>`
 * for the course start-date range filter, via `<DatePicker customInput={...}>`.
 *
 * react-datepicker's `customInput` mechanism always overwrites the injected
 * `value` prop with its own formatted string, which overflows a control sized
 * for a short label once a full range is picked - so this component ignores
 * `props.value` entirely and always shows just `label`. `forwardRef` is
 * required because react-datepicker attaches a ref to the trigger for popup
 * positioning.
 */
const DateRangeTrigger = forwardRef<HTMLButtonElement, DateRangeTriggerProps>(
  ({
    label,
    onClick,
    className,
  }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant="tertiary"
      size="sm"
      iconBefore={Calendar}
      onClick={onClick}
      className={className}
      aria-label={label}
    >
      {label}
    </Button>
  ),
);
DateRangeTrigger.displayName = 'DateRangeTrigger';

/** CourseSearchBrowse
 * Search/browse pane for the competency management page: lets the user find
 * a course (by name, debounced as they type) and paginate through results,
 * once a competency is selected in the tree alongside this component.
 */
const CourseSearchBrowse = ({ activeCompetency }: CourseSearchBrowseProps) => {
  const intl = useIntl();
  const {
    courseList,
    coursePage: page,
    courseSearch: search,
    courseDateRange: dateRange,
    setCoursePage,
    setCourseSearch,
    setCourseDateRange,
    criteriaCounts,
    keyboardFocusRequest,
    consumeKeyboardFocusRequest,
    isDeletingGroupOrRuleBoxOrCriterion,
    isAssociating,
  } = useCompetencyAssociations();

  // Rows run their effects first, so a subsection request still held here has no row on the page (collapsed or left
  // the list). It is dropped so it does not take focus when the row is shown again.
  const holdsUnclaimedRowRequest = keyboardFocusRequest?.kind === 'subsection'
    && !isDeletingGroupOrRuleBoxOrCriterion
    && !isAssociating;
  useEffect(() => {
    if (holdsUnclaimedRowRequest) {
      consumeKeyboardFocusRequest();
    }
  }, [holdsUnclaimedRowRequest, consumeKeyboardFocusRequest]);

  // `inputValue` is the raw field value, so typing feels responsive; the context's `search` is the debounced
  // value that drives the course list query.
  const [inputValue, setInputValue] = useState('');

  const debouncedUpdateSearch = useMemo(
    () => debounce((value: string) => setCourseSearch(value), 400),
    [setCourseSearch],
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
    setCourseSearch('');
  }, [debouncedUpdateSearch, setCourseSearch]);

  const handleClearDateRange = () => setCourseDateRange([null, null]);

  const { courses, numPages, isLoading, isPlaceholderData, isError, isSuccess } = courseList;
  const accessibleCourseCount = useStudioHomeCoursesV2(ACCESSIBLE_COURSES_COUNT_PARAMS).data?.count;

  // While a new page or filter loads, `courses` still holds the previous one, so the list shows its spinner
  // and the summary waits: its counts would describe the previous page.
  const isListReloading = isLoading || isPlaceholderData;
  const showSummary = isSuccess && !isListReloading && accessibleCourseCount !== undefined
    && criteriaCounts !== undefined;

  let body: ReactNode;
  let hasPagination = false;
  if (isListReloading) {
    body = (
      <Row className="m-0 mt-2 justify-content-center">
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
      <div className="mt-2">
        <p>
          {intl.formatMessage(
            search || dateRange[0] ? messages.noMatchingCourses : messages.noAccessibleCourses,
          )}
        </p>
        {search && (
          <Button variant="primary" onClick={handleClearSearch}>
            {intl.formatMessage(messages.clearSearchButtonLabel)}
          </Button>
        )}
      </div>
    );
  } else {
    body = courses.map((course) => (
      <CourseRow
        key={course.courseKey}
        course={course}
      />
    ));
    hasPagination = numPages > 1;
  }

  return (
    <div className="course-search-browse">
      <div className="course-search-browse__toolbar">
        <Stack direction="horizontal" gap={2}>
          <SearchField
            className="flex-grow-1"
            onSubmit={noop}
            onChange={handleSearchChange}
            value={inputValue}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
          />
          <div className="d-flex align-items-center">
            <DatePicker
              id="course-search-date-range"
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={setCourseDateRange}
              dateFormat={DATE_FORMAT}
              className="datepicker-custom-control"
              autoComplete="off"
              showPopperArrow={false}
              popperPlacement="bottom-end"
              customInput={
                <DateRangeTrigger
                  label={intl.formatMessage(messages.dateRangeLabel)}
                />
              }
            />
            {dateRange[0] !== null && (
              <IconButton
                src={Close}
                alt={intl.formatMessage(messages.clearDateRangeButtonLabel)}
                onClick={handleClearDateRange}
                size="sm"
                className="ml-1"
              />
            )}
          </div>
        </Stack>
        {
          /* Always rendered: a live region only announces changes to content it
            held before them (WCAG 2.2, 4.1.3), and its reserved line keeps the
            panel below from shifting while the summary's inputs reload. */
        }
        <div role="status" className="course-search-browse__summary small mt-2">
          {showSummary && (
            <CourseListSummary
              listedCount={courses.length}
              totalCount={accessibleCourseCount}
              search={search}
              dateRange={dateRange}
              listedAssociationCount={criteriaCounts.criteriaCount}
              totalAssociationCount={criteriaCounts.totalCriteriaCount}
            />
          )}
        </div>
      </div>
      <div className="course-search-browse__panel">
        <CriteriaAssociationsSection competency={activeCompetency} />
        <div className="course-search-browse__container">
          <div className="course-search-browse__section-label">
            {intl.formatMessage(messages.coursesAndContentLabel)}
          </div>
          <div className="course-search-browse__list">
            {body}
          </div>
          {hasPagination && (
            <Pagination
              pageCount={numPages}
              currentPage={page}
              onPageSelect={setCoursePage}
              paginationLabel="pagination navigation"
              size="small"
              className="course-search-browse__pagination d-flex justify-content-center w-100"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseSearchBrowse;
