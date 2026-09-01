import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  within,
} from '@src/testUtils';
import { apiUrls } from '@src/taxonomy/data/api';
import { TAXONOMY_MAX_DEPTH } from '@src/taxonomy/taxonomy-detail/constants';
import CompetencyTree from './CompetencyTree';

let axiosMock;

const taxonomyId = 1;

const tagListUrl = apiUrls.tagList(taxonomyId, {
  pageIndex: 0,
  pageSize: 50,
  fullDepth: true,
  disablePagination: true,
});

const tagDefaults = { depth: 0, parent_value: null, child_count: 0 };

// A root -> group -> leaf tree, plus two root tags exercising the three ways
// a Competency ID can be missing: `null`, `''`, and the field being absent
// (`undefined`) entirely.
const nestedTagsResponse = {
  next: null,
  previous: null,
  count: 3,
  num_pages: 1,
  current_page: 1,
  start: 0,
  results: [
    {
      ...tagDefaults,
      id: 1,
      value: 'Root A',
      child_count: 1,
      external_id: 'EXT-001',
    },
    {
      ...tagDefaults,
      id: 2,
      value: 'Group A1',
      depth: 1,
      parent_value: 'Root A',
      child_count: 1,
      external_id: null,
    },
    {
      ...tagDefaults,
      id: 3,
      value: 'Leaf A1a',
      depth: 2,
      parent_value: 'Group A1',
      external_id: 'EXT-003',
    },
    {
      ...tagDefaults,
      id: 4,
      value: 'Root B',
      external_id: '',
    },
    {
      ...tagDefaults,
      id: 5,
      value: 'Root C',
      // no `external_id` field at all
    },
  ],
};

const buildDuplicateValueResponse = () => ({
  ...nestedTagsResponse,
  results: [
    { ...tagDefaults, id: 10, value: 'Dup Tag' },
    { ...tagDefaults, id: 11, value: 'DUP TAG' },
  ],
});

const taxonomyName = 'Test Taxonomy';

const renderTree = () => render(<CompetencyTree taxonomyId={taxonomyId} taxonomyName={taxonomyName} />);

describe('<CompetencyTree />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('renders the taxonomy name as an expandable root, one level above the tag tree', async () => {
    axiosMock.onGet(tagListUrl).reply(200, nestedTagsResponse);
    renderTree();

    // The taxonomy-root row starts expanded, so its immediate children (the
    // real top-level tags) are visible without any click.
    expect(await screen.findByText(taxonomyName)).toBeInTheDocument();
    expect(await screen.findByText('Root A')).toBeInTheDocument();

    // Root A's own children are one level deeper than the root, so they
    // still require an explicit expand of Root A itself.
    expect(screen.queryByText('Group A1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    expect(await screen.findByText('Group A1')).toBeInTheDocument();

    // It's a display-only row, not a real `Tag`: no Competency ID badge for
    // itself, even though "Root A" (a real tag) has one.
    const taxonomyRootRow = screen.getByText(taxonomyName).closest('.competency-row');
    expect(taxonomyRootRow).not.toHaveTextContent('EXT-001');
  });

  it('renders a root -> group -> leaf tree, nested structurally rather than via a computed depth', async () => {
    axiosMock.onGet(tagListUrl).reply(200, nestedTagsResponse);
    renderTree();
    await screen.findByText(taxonomyName);

    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));

    const rootAItem = (await screen.findByText('Root A')).closest('li');
    const groupA1Item = (await screen.findByText('Group A1')).closest('li');
    const leafA1aItem = (await screen.findByText('Leaf A1a')).closest('li');
    expect(rootAItem).not.toBeNull();
    expect(groupA1Item).not.toBeNull();
    expect(leafA1aItem).not.toBeNull();

    // The DOM itself encodes the hierarchy via nesting, rather than a depth
    // number: "Group A1" lives inside "Root A"'s own `<li>` subtree, and
    // "Leaf A1a" lives inside "Group A1"'s (and therefore also "Root A"'s).
    expect(within(rootAItem as HTMLElement).getByText('Group A1')).toBeInTheDocument();
    expect(within(groupA1Item as HTMLElement).getByText('Leaf A1a')).toBeInTheDocument();
    expect(within(rootAItem as HTMLElement).getByText('Leaf A1a')).toBeInTheDocument();
  });

  it('renders every level of a maximum-depth chain when expanded', async () => {
    // A single deep chain (each tag has exactly one child) from depth 0 to
    // `TAXONOMY_MAX_DEPTH`, the worst case this page has to render: the
    // synthetic taxonomy-root plus every legal real depth, 1 + (TAXONOMY_MAX_DEPTH + 1)
    // nested `<ul>` levels in total.
    const depthChainLabels = Array.from(
      { length: TAXONOMY_MAX_DEPTH + 1 },
      (_, depth) => `Depth ${depth} Tag`,
    );
    const results = depthChainLabels.map((value, depth) => ({
      ...tagDefaults,
      id: 100 + depth,
      value,
      depth,
      parent_value: depth === 0 ? null : depthChainLabels[depth - 1],
      child_count: depth < TAXONOMY_MAX_DEPTH ? 1 : 0,
    }));

    axiosMock.onGet(tagListUrl).reply(200, { ...nestedTagsResponse, results });
    renderTree();
    await screen.findByText(taxonomyName);

    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
    await screen.findByText(depthChainLabels[depthChainLabels.length - 1]);

    // Assert every level individually, not just the deepest one: a bug that
    // only manifested at the max depth wouldn't necessarily hide earlier
    // levels, so this proves the whole chain rendered end-to-end.
    depthChainLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('toggles nested rows with Expand All / Collapse All', async () => {
    axiosMock.onGet(tagListUrl).reply(200, nestedTagsResponse);
    renderTree();
    await screen.findByText(taxonomyName);

    expect(screen.queryByText('Group A1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
    expect(await screen.findByText('Group A1')).toBeInTheDocument();
    expect(await screen.findByText('Leaf A1a')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse All' }));
    expect(screen.queryByText('Group A1')).not.toBeInTheDocument();
    expect(screen.queryByText('Leaf A1a')).not.toBeInTheDocument();
  });

  it('renders the Competency ID with an accessible name when externalId is set, and nothing when it is falsy', async () => {
    axiosMock.onGet(tagListUrl).reply(200, nestedTagsResponse);
    renderTree();
    await screen.findByText(taxonomyName);
    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
    await screen.findByText('Leaf A1a');

    expect(screen.getByText('EXT-001')).toBeInTheDocument();
    // The badge has no `<th>` to associate it with a column meaning anymore
    // (there's no table), so it needs its own accessible name instead.
    expect(screen.getByText('EXT-001')).toHaveAttribute('aria-label', 'Competency ID: EXT-001');
    expect(screen.getByText('EXT-003')).toBeInTheDocument();

    // Root B (`externalId: ''`), Root C (`externalId` absent), Group A1
    // (`externalId: null`), and the taxonomy-root row itself (no `externalId`
    // field at all) must not render the literal string "undefined" or
    // "null", and must not render an empty badge either.
    const rootBRow = screen.getByText('Root B').closest('.competency-row');
    const rootCRow = screen.getByText('Root C').closest('.competency-row');
    const groupRow = screen.getByText('Group A1').closest('.competency-row');
    const taxonomyRootRow = screen.getByText(taxonomyName).closest('.competency-row');
    [rootBRow, rootCRow, groupRow, taxonomyRootRow].forEach((row) => {
      expect(row).not.toBeNull();
      expect(within(row as HTMLElement).queryByText('undefined')).not.toBeInTheDocument();
      expect(within(row as HTMLElement).queryByText('null')).not.toBeInTheDocument();
    });
    expect(screen.queryByText(/^undefined$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^null$/)).not.toBeInTheDocument();
  });

  it('renders as a plain list, not a table', async () => {
    axiosMock.onGet(tagListUrl).reply(200, nestedTagsResponse);
    renderTree();
    await screen.findByText(taxonomyName);
    fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
    await screen.findByText('Leaf A1a');

    // No table/column-header semantics at all - there's no `<thead>` to hide
    // in the first place, since this is a `<ul>/<li>` tree.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('columnheader')).toHaveLength(0);

    // Every real tag renders as its own list item (the synthetic
    // taxonomy-root row is not itself a list item - see `CompetencyTree`).
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('renders a connection error alert instead of throwing when the tag data has duplicate values', async () => {
    axiosMock.onGet(tagListUrl).reply(200, buildDuplicateValueResponse());
    renderTree();

    expect(await screen.findByTestId('connectionErrorAlert')).toBeInTheDocument();
    expect(screen.queryByText('Dup Tag')).not.toBeInTheDocument();
  });
});
