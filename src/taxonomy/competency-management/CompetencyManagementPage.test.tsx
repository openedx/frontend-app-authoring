import {
  initializeMocks,
  render,
  screen,
  within,
} from '@src/testUtils';
import { apiUrls } from '@src/taxonomy/data/api';
import CompetencyManagementPage from './CompetencyManagementPage';

let axiosMock;

const taxonomyId = 1;
const path = '/taxonomy/:taxonomyId/competencies';
const params = { taxonomyId: String(taxonomyId) };

const tagListUrl = apiUrls.tagList(taxonomyId, {
  pageIndex: 0,
  pageSize: 50,
  fullDepth: true,
  disablePagination: true,
});

const emptyTagListResponse = {
  next: null,
  previous: null,
  count: 0,
  num_pages: 1,
  current_page: 1,
  start: 0,
  results: [],
};

const renderPage = () => render(<CompetencyManagementPage />, { path, params });

describe('<CompetencyManagementPage />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('shows a loading spinner while the taxonomy is being fetched', () => {
    axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('shows a connection error alert when the taxonomy fails to load', async () => {
    axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(500);
    renderPage();
    expect(await screen.findByTestId('connectionErrorAlert')).toBeInTheDocument();
  });

  it('renders the taxonomy name and links the breadcrumb to the right pages', async () => {
    axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(200, {
      id: taxonomyId,
      name: 'Test taxonomy',
      description: 'This is a description',
    });
    axiosMock.onGet(tagListUrl).reply(200, emptyTagListResponse);

    renderPage();

    // The page's own heading is the taxonomy's own name, matching the Figma
    // design (there's no separate "Competencies" title anywhere on the page).
    expect(await screen.findByRole('heading', { name: 'Test taxonomy' })).toBeInTheDocument();

    const breadcrumbNav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(within(breadcrumbNav).getByRole('link', { name: 'Taxonomies' })).toHaveAttribute('href', '/taxonomies/');
    // The active breadcrumb item is the taxonomy's own name, and isn't a link.
    expect(within(breadcrumbNav).getByText('Test taxonomy')).toBeInTheDocument();
    expect(within(breadcrumbNav).queryByRole('link', { name: 'Test taxonomy' })).not.toBeInTheDocument();

    // Wait for the tree's own (empty) data to settle so no async query is left
    // pending. Even with zero tags, the tree still shows its synthetic
    // taxonomy-root row (see `CompetencyTree`), so there's no separate empty
    // state - the taxonomy name doubles as it. Scoped to the root row's own
    // label, since the breadcrumb link above also reads "Test taxonomy".
    expect(await screen.findByText('Test taxonomy', { selector: '.competency-row__label' }))
      .toBeInTheDocument();
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });
});
