import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/** The largest page the Studio REST APIs serve. */
export const MAX_PAGE_SIZE = 100;

/** One page of a paginated Studio REST API list, as the server sends it. */
export interface PaginatedListPage<T> {
  count: number;
  num_pages: number;
  current_page: number;
  start: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetch every item of a paginated list.
 *
 * Requests the largest page size, so most lists arrive in one request, and
 * then asks for each remaining page by number. Page numbers are used rather
 * than the `next` link because the server builds that link from the host it
 * was reached on, which is not always the host the browser should call.
 */
export async function getAllPages<T>(url: string, params: Record<string, string> = {}): Promise<T[]> {
  const client = getAuthenticatedHttpClient();
  const results: T[] = [];
  let page = 1;
  let numPages = 1;
  do {
    // Each page depends on the page count the first one reports.
    // eslint-disable-next-line no-await-in-loop
    const { data } = await client.get<PaginatedListPage<T>>(url, {
      params: { ...params, page, page_size: MAX_PAGE_SIZE },
    });
    results.push(...data.results);
    numPages = data.num_pages;
    page += 1;
  } while (page <= numPages);
  return results;
}

/** Build one page of a paginated list response, for tests. */
export const paginatedListPage = <T>(
  results: T[],
  { page = 1, numPages = 1, count = results.length }: { page?: number; numPages?: number; count?: number; } = {},
): PaginatedListPage<T> => ({
  count,
  num_pages: numPages,
  current_page: page,
  start: (page - 1) * MAX_PAGE_SIZE,
  next: page < numPages ? `?page=${page + 1}` : null,
  previous: page > 1 ? `?page=${page - 1}` : null,
  results,
});
