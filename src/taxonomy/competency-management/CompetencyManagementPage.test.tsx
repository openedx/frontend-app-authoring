import {
  act,
  fireEvent,
  initializeMocks,
  render,
  waitFor,
  screen,
  within,
  type RouteOptions,
} from '@src/testUtils';
import { apiUrls } from '@src/taxonomy/data/api';
import CompetencyManagementPage from './CompetencyManagementPage';
import type MockAdapter from 'axios-mock-adapter';

import { TaxonomyContext, type TaxonomyContextData } from '../common/context';
import { TaxonomyType } from '../data/constants';

let axiosMock: MockAdapter;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

const listTaxonomiesUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/?enabled=true';
const importNewTaxonomyUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/import/';

const mockSetAlertError = jest.fn();
const context: TaxonomyContextData = {
  toastMessage: null,
  setToastMessage: jest.fn(),
  alertError: null,
  setAlertError: mockSetAlertError,
};

/** Open the import wizard and walk it up to the step where the new taxonomy is described. */
const goToPopulateStep = async () => {
  fireEvent.click(await screen.findByTestId('import-competency-framework-button'));

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

describe('<CompetencyManagementPage />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onGet(listTaxonomiesUrl).reply(200, { results: [], canAddTaxonomy: true });
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

  describe('import competency framework button', () => {
    beforeEach(() => {
      axiosMock.onGet(apiUrls.taxonomy(taxonomyId)).reply(200, taxonomyResponse);
    });

    it('is shown to users who may create taxonomies', async () => {
      renderPage();

      expect(await screen.findByRole('button', { name: 'Import Competency Framework' })).toBeInTheDocument();
    });

    it('is hidden from users who may not create taxonomies', async () => {
      axiosMock.onGet(listTaxonomiesUrl).reply(200, { results: [], canAddTaxonomy: false });

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

      axiosMock.onPost(importNewTaxonomyUrl).replyOnce(200, { id: newTaxonomyId, name: 'New framework' });

      await fillInAndImport('New framework');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/taxonomy/${newTaxonomyId}/competencies`);
      });
    });

    it('does not navigate away when the import fails', async () => {
      renderPage();
      await goToPopulateStep();

      axiosMock.onPost(importNewTaxonomyUrl).replyOnce(400, { error: 'Invalid file' });

      await fillInAndImport('Broken framework');

      await waitFor(() => {
        expect(mockSetAlertError).toHaveBeenCalled();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
