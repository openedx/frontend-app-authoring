import { Context as ResponsiveContext } from 'react-responsive';
import { breakpoints } from '@openedx/paragon';

import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { apiUrls } from '@src/taxonomy/data/api';
import { getApiBaseUrl, type Course } from '@src/studio-home/data/api';
import CompetencyAssociationsPanel from './CompetencyAssociationsPanel';

let axiosMock;

const taxonomyId = 1;
const taxonomyName = 'Test Taxonomy';

const tagListUrl = apiUrls.tagList(taxonomyId, {
  pageIndex: 0,
  pageSize: 50,
  fullDepth: true,
  disablePagination: true,
});

const coursesApiUrl = `${getApiBaseUrl()}/api/contentstore/v2/home/courses`;

const tagDefaults = { depth: 0, parent_value: null, child_count: 0 };

// A root -> group -> leaf tree ("Leaf A1a"), plus a second, sibling leaf
// ("Root B") at the top level - used by the leaf-to-leaf switching test
// below, which needs two distinct selectable leaves.
const nestedTagsResponse = {
  next: null,
  previous: null,
  count: 4,
  num_pages: 1,
  current_page: 1,
  start: 0,
  results: [
    {
      ...tagDefaults,
      id: 1,
      value: 'Root A',
      child_count: 1,
    },
    {
      ...tagDefaults,
      id: 2,
      value: 'Group A1',
      depth: 1,
      parent_value: 'Root A',
      child_count: 1,
    },
    {
      ...tagDefaults,
      id: 3,
      value: 'Leaf A1a',
      depth: 2,
      parent_value: 'Group A1',
    },
    { ...tagDefaults, id: 4, value: 'Root B' },
  ],
};

const buildCourse = (overrides: Partial<Course> = {}): Course => ({
  courseKey: 'course-v1:OrgX+CS101+2024',
  displayName: 'Intro to Testing',
  lmsLink: null,
  number: 'CS101',
  org: 'OrgX',
  rerunLink: null,
  run: '2024',
  url: '/course/course-v1:OrgX+CS101+2024',
  ...overrides,
});

const buildResponse = (courses: Course[], numPages: number = 1) => ({
  results: { courses },
  numPages,
  count: courses.length,
});

const renderPanel = () =>
  render(
    <CompetencyAssociationsPanel taxonomyId={taxonomyId} taxonomyName={taxonomyName} />,
  );

describe('<CompetencyAssociationsPanel />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onGet(tagListUrl).reply(200, nestedTagsResponse);
    axiosMock.onGet(coursesApiUrl).reply(200, buildResponse([buildCourse()]));
  });

  it('populates the right panel when a leaf competency is selected in the tree', async () => {
    renderPanel();
    await screen.findByText(taxonomyName);
    // The right panel isn't mounted at all before a competency is selected -
    // no visible column, no search field, no course request.
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
    const leafRow = (await screen.findByText('Leaf A1a')).closest('.competency-row') as HTMLElement;
    fireEvent.click(leafRow);

    // Selecting the leaf mounts the course search/browse panel, which fires
    // the course-list query and renders its own search field.
    expect(await screen.findByText('Intro to Testing')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('populates the right panel when a group (non-leaf) competency is selected too', async () => {
    renderPanel();
    await screen.findByText(taxonomyName);
    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));

    const groupRow = (await screen.findByText('Group A1')).closest('.competency-row') as HTMLElement;
    fireEvent.click(groupRow);

    // A group row is now selectable just like a leaf row (see
    // CompetencyTreeItem.tsx), so selecting one also mounts the right panel
    // and fires the course-list query.
    expect(await screen.findByRole('searchbox')).toBeInTheDocument();
    expect(axiosMock.history.get.filter((req) => req.url === coursesApiUrl)).toHaveLength(1);
  });

  it('preserves the right panel\'s own state when switching from one leaf competency to a different one', async () => {
    renderPanel();
    await screen.findByText(taxonomyName);
    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));

    const leafRow = (await screen.findByText('Leaf A1a')).closest('.competency-row') as HTMLElement;
    fireEvent.click(leafRow);
    await screen.findByText('Intro to Testing');

    const searchBox = screen.getByRole('searchbox');
    fireEvent.change(searchBox, { target: { value: 'physics' } });
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('physics');

    const otherLeafRow = (await screen.findByText('Root B')).closest('.competency-row') as HTMLElement;
    fireEvent.click(otherLeafRow);

    // The course pane is not remounted on a competency switch (no `key` tied
    // to the selected competency), so its own in-progress search text survives
    // rather than being reset back to empty.
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('physics');
  });

  it('stretches the tree and course-search columns to match heights on desktop, instead of vertically centering the shorter one', async () => {
    // Forces the `isDesktop` (`useIsDesktop`, min-width: 992px) branch, which
    // lays the two columns out with Paragon's `Stack` (`direction="horizontal"`,
    // rendered as a `.pgn__hstack` div).
    const { container } = render(
      <ResponsiveContext.Provider value={{ width: breakpoints.large.minWidth }}>
        <CompetencyAssociationsPanel taxonomyId={taxonomyId} taxonomyName={taxonomyName} />
      </ResponsiveContext.Provider>,
    );
    await screen.findByText(taxonomyName);

    // `.pgn__hstack`'s own CSS sets `align-items: center`. Left as-is, that
    // vertically centers whichever column is shorter against the taller one
    // (e.g. the course-search column before any course row is expanded)
    // instead of the two columns starting flush at the same top, which is
    // how the original raw flexbox `div` (no `align-items` override, so the
    // default `stretch`) behaved. `alignItems: 'stretch'` is set inline on
    // the `Stack` specifically to override that class rule and restore the
    // original behavior.
    const hstack = container.querySelector('.pgn__hstack') as HTMLElement | null;
    expect(hstack).not.toBeNull();
    expect(hstack?.style.alignItems).toBe('stretch');
  });

  it('gives the tree the full row width and renders no right-hand column before any competency is selected', async () => {
    const { container } = render(
      <ResponsiveContext.Provider value={{ width: breakpoints.large.minWidth }}>
        <CompetencyAssociationsPanel taxonomyId={taxonomyId} taxonomyName={taxonomyName} />
      </ResponsiveContext.Provider>,
    );
    await screen.findByText(taxonomyName);

    // The right-hand `.flex-grow-1` column must not be rendered at all before
    // selection - not merely empty - since `flex-grow-1` still claims its
    // share of the row's width even around empty content (the bug this
    // change fixes).
    expect(container.querySelector('.flex-grow-1')).not.toBeInTheDocument();

    // With no sibling column to size against yet, the tree's own box spans
    // the full row instead of its usual fixed pixel width, and has no drag
    // handle (`ResizableBox`'s `fullWidth` prop - see `Resizable.test.tsx`).
    const resizableBox = container.querySelector('.resizable') as HTMLElement;
    expect(resizableBox.style.width).toBe('100%');
    expect(container.querySelector('.resizable-handle')).not.toBeInTheDocument();
  });

  it('keeps the tree\'s own expand/collapse state when selecting a competency mounts the right panel', async () => {
    // Regression test for the bug described in `CompetencyAssociationsPanel.tsx`:
    // a naive fix that only wrapped the tree in `ResizableBox` once something
    // is selected would move `CompetencyTree` to a different position in the
    // element tree between the two states, and React would remount it -
    // silently discarding its own local `expandedIds` state right when the
    // user selects a competency. This test expands one branch of the tree by
    // hand (not "Expand All", which would always re-expand everything and so
    // couldn't tell a remount apart from a correct re-render), then selects a
    // leaf and checks the expanded branch is still expanded afterward.
    render(
      <ResponsiveContext.Provider value={{ width: breakpoints.large.minWidth }}>
        <CompetencyAssociationsPanel taxonomyId={taxonomyId} taxonomyName={taxonomyName} />
      </ResponsiveContext.Provider>,
    );
    await screen.findByText(taxonomyName);

    // Expand the taxonomy root, then "Root A", then "Group A1", one
    // disclosure icon at a time, until the leaf "Leaf A1a" is visible.
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    await screen.findByText('Root A');
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    await screen.findByText('Group A1');
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    const leafRow = (await screen.findByText('Leaf A1a')).closest('.competency-row') as HTMLElement;

    fireEvent.click(leafRow);
    await screen.findByRole('searchbox'); // right panel now mounted

    // If `CompetencyTree` had been remounted when the right panel appeared,
    // its `expandedIds` state would have reset to its initial (root-only)
    // value, and "Leaf A1a" - only reachable through "Group A1" staying
    // expanded - would no longer be in the DOM.
    expect(screen.getByText('Leaf A1a')).toBeInTheDocument();
  });
});
