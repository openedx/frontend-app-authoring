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
import { convertToStringFromDate } from '@src/utils';
import type { CompetencyTreeNode } from '../CompetencyTree';
import CourseRow from './CourseRow';
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

const PAGE_SIZE = 10;

// A stable no-op for `SearchField`'s required `onSubmit` prop. Paragon's
// `SearchFieldAdvanced` re-invokes its own `onChange` handler whenever that
// prop's reference changes, not only when the search value itself changes
// (see `handleSearchChange` below, which is memoized for exactly this
// reason) - `onSubmit` isn't known to have the same effect today, but a
// stable reference costs nothing and avoids relying on that not changing.
const noop = () => {};

interface DateRangeTriggerProps {
  /** Whether a start (and/or end) date is currently picked - drives the
   * highlighted visual state below. The trigger's own visible text never
   * changes to reflect the picked value (see the component docstring).
   */
  hasSelection: boolean;
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
 * react-datepicker's `customInput` mechanism clones whatever element is
 * passed and always overwrites its `value` prop with the picker's own
 * formatted string - once a full range is picked, that's the wide
 * "MM/DD/YYYY - MM/DD/YYYY" text, which overflows a control sized for a
 * short label. This component sidesteps that by never reading `props.value`
 * at all: it always renders the fixed `label` text itself, and uses the
 * separately-controlled `hasSelection` prop (not the injected value) to show
 * that something is picked. `forwardRef` is required because react-datepicker
 * attaches a ref to the trigger for popup positioning; only `onClick` (to
 * open the calendar) and `className` (for shared box styling) are forwarded
 * from the props react-datepicker injects - a native `<button>` already
 * handles keyboard activation (Enter/Space) on its own, so the picker's own
 * focus/blur/keydown handlers aren't needed here.
 */
const DateRangeTrigger = forwardRef<HTMLButtonElement, DateRangeTriggerProps>(
  ({
    hasSelection,
    label,
    onClick,
    className,
  }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant={hasSelection ? 'primary' : 'outline-primary'}
      iconAfter={Calendar}
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

  // Course start-date range filter. The handler sets the whole range and
  // resets `page` back to 1 in the same function body - both in the same
  // state-update batch - for the same reason `debouncedUpdateSearch` above
  // does: a separate effect keyed on the changing range would let a render
  // fire with the new range paired with the old (possibly out-of-range) page
  // before the page-1 correction caught up.
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const handleDateRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);
    setPage(1);
  };

  const handleClearDateRange = () => handleDateRangeChange([null, null]);

  const { data, isLoading, isError } = useStudioHomeCoursesV2({
    page,
    pageSize: PAGE_SIZE,
    search,
    order: 'display_name',
    startDateOnOrAfter: dateRange[0] ? convertToStringFromDate(dateRange[0]) : undefined,
    startDateOnOrBefore: dateRange[1] ? convertToStringFromDate(dateRange[1]) : undefined,
  });

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
        {courses.map((course) => (
          <CourseRow
            key={course.courseKey}
            course={course}
          />
        ))}
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
    <div className="course-search-browse">
      <div className="course-search-browse__toolbar">
        <Stack direction="horizontal" gap={3}>
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
              onChange={handleDateRangeChange}
              dateFormat={DATE_FORMAT}
              className="datepicker-custom-control"
              autoComplete="off"
              showPopperArrow={false}
              popperPlacement="bottom-end"
              customInput={
                <DateRangeTrigger
                  hasSelection={dateRange[0] !== null}
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
      </div>
      <div className="course-search-browse__associations">
        <div className="course-search-browse__associations-label">
          {intl.formatMessage(messages.associationsSectionLabel)}
        </div>
        <div className="course-search-browse__associations-mastery">
          {intl.formatMessage(messages.demonstrateMasteryForLabel, { competencyName: activeCompetency.value })}
        </div>
        <div className="course-search-browse__associations-empty-state">
          <p>{intl.formatMessage(messages.noAssociationsMessage)}</p>
          {
            /* Placeholder copy: this exact tail wording isn't confirmed from Figma (the screenshot was cut
              off) - update it once the actual text layer is confirmed. */
          }
          <p>{intl.formatMessage(messages.noAssociationsPromptMessage)}</p>
        </div>
      </div>
      <div className="course-search-browse__container">
        <div className="course-search-browse__section-label">
          {intl.formatMessage(messages.coursesAndContentLabel)}
        </div>
        {body}
      </div>
    </div>
  );
};

export default CourseSearchBrowse;
