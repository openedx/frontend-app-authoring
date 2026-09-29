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
import moment from 'moment';
import DatePicker from 'react-datepicker';

import AlertMessage from '@src/generic/alert-message';
import { LoadingSpinner } from '@src/generic/Loading';
import { DATE_FORMAT } from '@src/constants';
import { useStudioHomeCoursesV2 } from '@src/studio-home/data/apiHooks';
import type { CompetencyTreeNode } from '../CompetencyTree';
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

const PAGE_SIZE = 10;

// The backend's `start_date_on_or_after`/`start_date_on_or_before` filters
// 400 on anything but a plain `YYYY-MM-DD` value, so this uses the picked
// calendar day in local time rather than a UTC-converting datetime string.
const formatDateOnlyParam = (date: Date) => moment(date).format('YYYY-MM-DD');

// A stable no-op for `SearchField`'s required `onSubmit`: Paragon's
// `SearchFieldAdvanced` re-invokes its own `onChange` whenever this prop's
// reference changes, so a stable reference avoids relying on that.
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
 * Trigger button in place of react-datepicker's default `<input>`.
 *
 * react-datepicker's `customInput` always overwrites the cloned element's
 * `value` with its own formatted range string, which overflows a control
 * sized for a short label. This ignores `props.value` entirely, rendering
 * the fixed `label` and using `hasSelection` to show something is picked.
 * `forwardRef` is required for react-datepicker's popup-positioning ref.
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

  // `search` and `page` are set together in the same batch, so a render
  // never sees the new search paired with the old (possibly out-of-range)
  // page.
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 400),
    [],
  );
  useEffect(() => () => debouncedUpdateSearch.cancel(), [debouncedUpdateSearch]);

  // Memoized: `SearchFieldAdvanced` re-fires its onChange-calling effect
  // whenever this reference changes, even if the value didn't (see `noop`
  // above) - an unmemoized handler fed a stale value back on every
  // re-render, flipping `inputValue` back and forth.
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

  // Course start-date range filter; sets range and page together, same
  // reason as `debouncedUpdateSearch` above.
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
    startDateOnOrAfter: dateRange[0] ? formatDateOnlyParam(dateRange[0]) : undefined,
    startDateOnOrBefore: dateRange[1] ? formatDateOnlyParam(dateRange[1]) : undefined,
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
      <CriteriaAssociationsSection competencyName={activeCompetency.value} />
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
