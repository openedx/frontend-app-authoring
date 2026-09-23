import {
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  initializeMocks,
  render,
  screen,
  userEvent,
  within,
} from '@src/testUtils';
import { apiUrls } from '@src/taxonomy/data/api';
import { TaxonomyType } from '@src/taxonomy/data/constants';
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

/** Stand-in for the taxonomy detail page, so tests can tell a redirect landed there */
const TaxonomyDetailPageStub = () => {
  const { taxonomyId: id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <h1>Taxonomy {id} detail page</h1>
      <button type="button" onClick={() => navigate(-1)}>Back</button>
    </>
  );
};

/**
 * Renders the page alongside the routes it can redirect to. `initialEntries` is the
 * browser history the user arrives with; the last entry is the current page.
 */
const renderPageWithRoutes = (initialEntries = [`/taxonomy/${taxonomyId}/competencies`]) =>
  render(
    <Routes>
      <Route path="/taxonomies" element={<h1>Taxonomy list page</h1>} />
      <Route path="/taxonomy/:taxonomyId" element={<TaxonomyDetailPageStub />} />
      <Route path={path} element={<CompetencyManagementPage />} />
    </Routes>,
    { routerProps: { initialEntries } },
  );

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
      taxonomy_type: TaxonomyType.Competency,
      can_tag_object: true,
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

  describe('when the user should not be on this page', () => {
    it.each([
      ['a tags taxonomy', { taxonomy_type: TaxonomyType.Tags, can_tag_object: true }],
      ['a taxonomy with no type', { taxonomy_type: null, can_tag_object: true }],
      [
        'a competency taxonomy the user cannot tag with',
        { taxonomy_type: TaxonomyType.Competency, can_tag_object: false },
      ],
    ])('redirects %s to the taxonomy detail page', async (_description, taxonomyFields) => {
      axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(200, {
        id: taxonomyId,
        name: 'Test taxonomy',
        ...taxonomyFields,
      });

      renderPageWithRoutes();

      expect(await screen.findByRole('heading', { name: `Taxonomy ${taxonomyId} detail page` }))
        .toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Test taxonomy' })).not.toBeInTheDocument();
      // The competency tree is never mounted, so its tags are never requested.
      expect(axiosMock.history.get.map(({ url }) => url)).not.toContain(tagListUrl);
    });

    it('replaces the competencies page in history, so going back does not redirect again', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(200, {
        id: taxonomyId,
        name: 'Test taxonomy',
        taxonomy_type: TaxonomyType.Tags,
        can_tag_object: true,
      });

      renderPageWithRoutes(['/taxonomies', `/taxonomy/${taxonomyId}/competencies`]);

      await user.click(await screen.findByRole('button', { name: 'Back' }));

      expect(await screen.findByRole('heading', { name: 'Taxonomy list page' })).toBeInTheDocument();
    });
  });
});
