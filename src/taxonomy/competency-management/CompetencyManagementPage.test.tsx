import { Route, Routes, useParams } from 'react-router-dom';

import {
  act,
  fireEvent,
  initializeMocks,
  render,
  waitFor,
  screen,
  userEvent,
  within,
  type RouteOptions,
} from '@src/testUtils';
import { apiUrls } from '@src/taxonomy/data/api';
import CompetencyManagementPage from './CompetencyManagementPage';
import type MockAdapter from 'axios-mock-adapter';

import { TaxonomyContext, type TaxonomyContextData } from '@src/taxonomy/common/context';
import { TaxonomyType } from '@src/taxonomy/data/constants';

let axiosMock: MockAdapter;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
// `useNavigate` is mocked above to observe the import wizard's redirects; the route stubs below need the real one.
const { useNavigate: useActualNavigate } = jest.requireActual('react-router-dom');

const taxonomyId = 1;
const newTaxonomyId = 2;

const path = '/taxonomy/:taxonomyId/competencies';
const params = { taxonomyId: String(taxonomyId) };
const route: RouteOptions = { path, params };

const taxonomyResponse = {
  id: taxonomyId,
  name: 'Test taxonomy',
  description: 'This is a description',
  taxonomy_type: TaxonomyType.Competency,
  can_tag_object: true,
  read_only: false,
  can_change_taxonomy: true,
  can_delete_taxonomy: true,
};

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

const renderPage = () =>
  render(<CompetencyManagementPage />, {
    ...route,
    extraWrapper: ({ children }) => <TaxonomyContext.Provider value={context}>{children}</TaxonomyContext.Provider>,
  });

const mockSetAlertError = jest.fn();
const context: TaxonomyContextData = {
  toastMessage: null,
  setToastMessage: jest.fn(),
  alertError: null,
  setAlertError: mockSetAlertError,
};

/** Open the import wizard and walk it up to the step where the new taxonomy is described. */
const goToPopulateStep = async () => {
  fireEvent.click(await screen.findByRole('button', { name: 'Import Competency Framework' }));

  expect(await screen.findByTestId('upload-step')).toBeInTheDocument();
  fireEvent.drop(screen.getByTestId('dropzone'), {
    dataTransfer: { files: [new File(['{}'], 'framework.json', { type: 'application/json' })], types: ['Files'] },
  });
  expect(await screen.findByTestId('file-info')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(await screen.findByTestId('populate-step')).toBeInTheDocument();
};

/** Fill in the fields the wizard requires, then import. */
const fillInAndImport = async (name: string) => {
  fireEvent.change(screen.getByLabelText('Taxonomy Name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Taxonomy Description'), { target: { value: `${name} description` } });

  const importButton = screen.getByRole('button', { name: 'Import' });
  await waitFor(() => {
    expect(importButton).not.toHaveAttribute('aria-disabled', 'true');
  });
  act(() => {
    fireEvent.click(importButton);
  });
};

/** Stand-in for the taxonomy detail page, so tests can tell a redirect landed there */
const TaxonomyDetailPageStub = () => {
  const { taxonomyId: id } = useParams();
  const navigate = useActualNavigate();
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
    axiosMock.onGet(apiUrls.taxonomyList()).reply(200, { results: [], canAddTaxonomy: true });
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

  describe('import competency framework button', () => {
    beforeEach(() => {
      axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(200, taxonomyResponse);
    });

    it('is shown to users who may create taxonomies', async () => {
      renderPage();

      expect(await screen.findByRole('button', { name: 'Import Competency Framework' })).toBeInTheDocument();
    });

    it('is hidden from users who may not create taxonomies', async () => {
      axiosMock.onGet(apiUrls.taxonomyList()).reply(200, { results: [], canAddTaxonomy: false });

      renderPage();

      // Wait for the page itself, so that the button's absence is not just the page still loading.
      expect(await screen.findByRole('heading')).toHaveTextContent('Test taxonomy');
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Import Competency Framework' })).not.toBeInTheDocument();
      });
    });

    it('defaults the type of the new taxonomy to Competency, and leaves it editable', async () => {
      renderPage();
      await goToPopulateStep();

      const select = screen.getByTestId('taxonomy-type-select');
      expect(select).toHaveValue(TaxonomyType.Competency);
      expect(within(select).getByRole('option', { name: 'Competency', selected: true })).toBeInTheDocument();
      expect(select).toBeEnabled();
    });

    it('navigates to the new taxonomy\'s competency management page after a successful import', async () => {
      renderPage();
      await goToPopulateStep();

      axiosMock.onPost(apiUrls.createTaxonomyFromImport()).replyOnce(200, {
        id: newTaxonomyId,
        name: 'New framework',
        taxonomy_type: TaxonomyType.Competency,
      });

      await fillInAndImport('New framework');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/taxonomy/${newTaxonomyId}/competencies`);
      });
    });

    it('navigates to the new taxonomy\'s tags page when the type was switched to Tags', async () => {
      renderPage();
      await goToPopulateStep();

      fireEvent.change(screen.getByTestId('taxonomy-type-select'), { target: { value: TaxonomyType.Tags } });
      axiosMock.onPost(apiUrls.createTaxonomyFromImport()).replyOnce(200, {
        id: newTaxonomyId,
        name: 'New tags',
        taxonomy_type: TaxonomyType.Tags,
      });

      await fillInAndImport('New tags');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/taxonomy/${newTaxonomyId}`);
      });
      expect(mockNavigate).not.toHaveBeenCalledWith(`/taxonomy/${newTaxonomyId}/competencies`);
    });

    it('does not navigate away when the import fails', async () => {
      renderPage();
      await goToPopulateStep();

      axiosMock.onPost(apiUrls.createTaxonomyFromImport()).replyOnce(400, { error: 'Invalid file' });

      await fillInAndImport('Broken framework');

      await waitFor(() => {
        expect(mockSetAlertError).toHaveBeenCalled();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
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
