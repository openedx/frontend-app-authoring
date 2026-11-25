import type { ReactNode } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

export interface CourseListSummaryProps {
  listedCount: number;
  totalCount: number;
  search: string;
  dateRange: [Date | null, Date | null];
  /** The competency's criteria associations in the listed courses. */
  listedAssociationCount: number;
  /** All of the competency's criteria associations, in any course. */
  totalAssociationCount: number;
}

const MAX_SEARCH_TERM_LENGTH = 50;

const truncateSearchTerm = (search: string) => {
  const codePoints = Array.from(search);
  return codePoints.length > MAX_SEARCH_TERM_LENGTH
    ? `${codePoints.slice(0, MAX_SEARCH_TERM_LENGTH).join('')}…`
    : search;
};

const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;

/** CourseListSummary
 * The summary line under the course search field: how many courses are
 * listed out of every course the user can access, which search term and
 * start-date filter narrowed the list, and how many of the competency's
 * criteria associations are in those listed courses out of all of them. Each
 * filter combination is its own message, so translators see whole sentences.
 */
const CourseListSummary = ({
  listedCount,
  totalCount,
  search,
  dateRange: [startDate, endDate],
  listedAssociationCount,
  totalAssociationCount,
}: CourseListSummaryProps) => {
  const intl = useIntl();
  const formatSummaryDate = (date: Date) =>
    intl.formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });

  let message = messages.coursesSummary;
  if (search && startDate && endDate) {
    message = messages.coursesSummaryWithSearchAndDateRange;
  } else if (search && startDate) {
    message = messages.coursesSummaryWithSearchAndStartDate;
  } else if (search) {
    message = messages.coursesSummaryWithSearch;
  } else if (startDate && endDate) {
    message = messages.coursesSummaryWithDateRange;
  } else if (startDate) {
    message = messages.coursesSummaryWithStartDate;
  }

  return (
    <p className="mb-0">
      {intl.formatMessage(message, {
        listedCount,
        totalCount,
        searchTerm: truncateSearchTerm(search),
        startDate: startDate ? formatSummaryDate(startDate) : undefined,
        endDate: endDate ? formatSummaryDate(endDate) : undefined,
        listedAssociationCount,
        totalAssociationCount,
        strong,
      })}
    </p>
  );
};

export default CourseListSummary;
