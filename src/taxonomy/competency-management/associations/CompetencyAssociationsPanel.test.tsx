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

const selectCompetencyPrompt = 'Select a competency to browse and associate courses.';

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
    expect(screen.getByText(selectCompetencyPrompt)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
    const leafRow = (await screen.findByText('Leaf A1a')).closest('.competency-row') as HTMLElement;
    fireEvent.click(leafRow);

    // Selecting the leaf fires the course-list query, which flips the right
    // panel from its initial prompt to the loaded course list.
    expect(await screen.findByText('Intro to Testing')).toBeInTheDocument();
    expect(screen.queryByText(selectCompetencyPrompt)).not.toBeInTheDocument();
  });

  it('does nothing to the right panel when a group (non-leaf) node is selected', async () => {
    renderPanel();
    await screen.findByText(taxonomyName);
    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));

    const groupRow = (await screen.findByText('Group A1')).closest('.competency-row') as HTMLElement;
    fireEvent.click(groupRow);

    // Group rows have no click handler wired at all (see CompetencyTree.tsx),
    // so the right panel stays on its initial prompt and no course request fires.
    expect(screen.getByText(selectCompetencyPrompt)).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(axiosMock.history.get.filter((req) => req.url === coursesApiUrl)).toHaveLength(0);
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
});
