import type MockAdapter from 'axios-mock-adapter';

import {
  act,
  fireEvent,
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@src/testUtils';
import { getTaxonomyExportFile } from '@src/taxonomy/data/api';
import { TaxonomyContext } from '@src/taxonomy/common/context';
import type { TaxonomyContextData } from '@src/taxonomy/common/context';
import { TaxonomyType } from '@src/taxonomy/data/constants';
import type { TaxonomyData } from '@src/taxonomy/data/types';
import { ImportTagsWizard } from './ImportTagsWizard';
import type { ImportTaxonomy } from './types';

let axiosMock: MockAdapter;

jest.mock('@src/taxonomy/data/api', () => ({
  ...jest.requireActual('@src/taxonomy/data/api'),
  getTaxonomyExportFile: jest.fn(),
}));

const mockSetToastMessage = jest.fn();
const mockSetAlertError = jest.fn();
const context: TaxonomyContextData = {
  toastMessage: null,
  setToastMessage: mockSetToastMessage,
  alertError: null,
  setAlertError: mockSetAlertError,
};

const TaxonomyContextProvider = ({ children }: { children: React.ReactNode; }) => (
  <TaxonomyContext.Provider value={context}>{children}</TaxonomyContext.Provider>
);

const planImportUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/import/plan/';
const doImportUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/import/';
const doImportNewTaxonomyUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/import/';

const sampleTaxonomy: ImportTaxonomy = {
  id: 1,
  name: 'Test Taxonomy',
};

interface RenderWizardProps {
  onClose: () => void;
  reimport?: boolean;
  taxonomy?: ImportTaxonomy | null;
  defaultTaxonomyType?: TaxonomyType;
  onImportSuccess?: (taxonomy: TaxonomyData) => void;
}

const renderWizard = ({
  onClose,
  reimport,
  taxonomy,
  defaultTaxonomyType,
  onImportSuccess,
}: RenderWizardProps) =>
  render(
    <ImportTagsWizard
      taxonomy={taxonomy}
      isOpen
      onClose={onClose}
      reimport={reimport}
      defaultTaxonomyType={defaultTaxonomyType}
      onImportSuccess={onImportSuccess}
    />,
    { extraWrapper: TaxonomyContextProvider },
  );

const makeJson = (filename: string) => new File(['{}'], filename, { type: 'application/json' });

/**
 * Drop a valid file onto the upload step of the "create a new taxonomy" flow, then continue to the
 * populate step.
 */
const goToPopulateStep = async () => {
  fireEvent.drop(screen.getByTestId('dropzone'), {
    dataTransfer: { files: [makeJson('example1.json')], types: ['Files'] },
  });
  expect(await screen.findByTestId('file-info')).toBeInTheDocument();

  const continueButton = await screen.findByRole('button', { name: 'Continue' });
  await waitFor(() => {
    expect(continueButton).not.toHaveAttribute('aria-disabled', 'true');
  });
  fireEvent.click(continueButton);

  expect(await screen.findByTestId('populate-step')).toBeInTheDocument();
};

/** Fill in the name and description of the populate step, which the Import button requires. */
const fillInRequiredFields = (name: string) => {
  fireEvent.change(screen.getByLabelText('Taxonomy Name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Taxonomy Description'), { target: { value: `${name} Description` } });
};

/** Click Import on the populate step, once enabled, and wait for the request to be made. */
const clickImport = async () => {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Import' })).not.toHaveAttribute('aria-disabled', 'true');
  });

  act(() => {
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
  });
};

describe('<ImportTagsWizard />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('render the dialog in the reimport first step can close on cancel', async () => {
    const onClose = jest.fn();
    const { findByTestId, getByTestId } = renderWizard({ taxonomy: sampleTaxonomy, onClose, reimport: true });

    expect(await findByTestId('export-step')).toBeInTheDocument();

    fireEvent.click(getByTestId('cancel-button'));

    expect(onClose).toHaveBeenCalled();
  });

  it('can export taxonomies from the reimport dialog', async () => {
    const onClose = jest.fn();
    const { findByTestId, getByTestId } = renderWizard({ taxonomy: sampleTaxonomy, onClose, reimport: true });

    expect(await findByTestId('export-step')).toBeInTheDocument();

    fireEvent.click(getByTestId('export-json-button'));

    expect(getTaxonomyExportFile).toHaveBeenCalledWith(sampleTaxonomy.id, 'json');

    fireEvent.click(getByTestId('export-csv-button'));

    expect(getTaxonomyExportFile).toHaveBeenCalledWith(sampleTaxonomy.id, 'csv');
  });

  it.each(['success', 'error'])('can upload taxonomies from the reimport dialog (%p)', async (expectedResult) => {
    const onClose = jest.fn();
    const {
      findByTestId,
      findByText,
      getByRole,
      getAllByTestId,
      getByTestId,
      getByText,
    } = renderWizard({ taxonomy: sampleTaxonomy, onClose, reimport: true });

    expect(await findByTestId('export-step')).toBeInTheDocument();

    fireEvent.click(getByTestId('next-button'));

    expect(getByTestId('upload-step')).toBeInTheDocument();

    // Test back button
    fireEvent.click(getByTestId('back-button'));
    expect(getByTestId('export-step')).toBeInTheDocument();
    fireEvent.click(getByTestId('next-button'));
    expect(getByTestId('upload-step')).toBeInTheDocument();

    // Continue flow
    let importButton = getByRole('button', { name: 'Import' });
    expect(importButton).toHaveAttribute('aria-disabled', 'true');

    // Invalid file type
    const fileTarGz = new File(['file contents'], 'example.tar.gz', { type: 'application/gzip' });
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [fileTarGz], types: ['Files'] } });
    expect(getByTestId('dropzone')).toBeInTheDocument();
    expect(importButton).toHaveAttribute('aria-disabled', 'true');

    // Correct file type
    axiosMock.onPut(planImportUrl).replyOnce(200, { plan: 'Import plan' });
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [makeJson('example1.json')], types: ['Files'] } });
    expect(await findByTestId('file-info')).toBeInTheDocument();
    expect(getByText('example1.json')).toBeInTheDocument();

    // Clear file
    fireEvent.click(getByTestId('clear-file-button'));
    expect(await findByTestId('dropzone')).toBeInTheDocument();

    // Reselect file
    // Simulate error (note: React-Query may start to retrieve the import plan as soon as the file is selected)
    axiosMock.onPut(planImportUrl).replyOnce(400, { error: 'Test error - details here' });
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [makeJson('example2.json')], types: ['Files'] } });
    expect(await findByTestId('file-info')).toBeInTheDocument();

    // Check error message
    await waitFor(async () => {
      // Note: import button gets re-created after showing a spinner while the import plan is loaded.
      importButton = getByRole('button', { name: 'Import' });
      expect(await findByText('Test error - details here')).toBeInTheDocument();
      // Because of the import error, we cannot proceed to the next step
      expect(importButton).toHaveAttribute('aria-disabled', 'true');
    });
    const errorAlert = getByText('Test error - details here');

    // Reselect file to clear the error
    fireEvent.click(getByTestId('clear-file-button'));
    expect(errorAlert).not.toBeInTheDocument();

    // Now simulate uploading a correct file.
    const expectedPlan = 'Import plan for Test import taxonomy\n'
      + '--------------------------------\n'
      + '#1: Create a new tag with values (external_id=tag_1, value=Tag 1, parent_id=None).\n'
      + '#2: Create a new tag with values (external_id=tag_2, value=Tag 2, parent_id=None).\n'
      + '#3: Create a new tag with values (external_id=tag_3, value=Tag 3, parent_id=None).\n'
      + '#4: Create a new tag with values (external_id=tag_4, value=Tag 4, parent_id=None).\n'
      + '#5: Delete tag (external_id=old_tag_1)\n'
      + '#6: Delete tag (external_id=old_tag_2)\n';
    axiosMock.onPut(planImportUrl).replyOnce(200, { plan: expectedPlan });
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [makeJson('example3.json')], types: ['Files'] } });

    expect(await findByTestId('file-info')).toBeInTheDocument();
    await waitFor(() => {
      // Note: import button gets re-created after showing a spinner while the import plan is loaded.
      importButton = getByRole('button', { name: 'Import' });
      expect(importButton).not.toHaveAttribute('aria-disabled', 'true');
    });

    fireEvent.click(importButton);

    expect(await findByTestId('plan-step')).toBeInTheDocument();

    // Test back button
    fireEvent.click(getByTestId('back-button'));
    expect(getByTestId('upload-step')).toBeInTheDocument();
    fireEvent.click(getByRole('button', { name: 'Import' }));
    expect(await findByTestId('plan-step')).toBeInTheDocument();

    expect(getAllByTestId('plan-action')).toHaveLength(6);

    fireEvent.click(getByTestId('continue-button'));

    expect(getByTestId('confirm-step')).toBeInTheDocument();

    // Test back button
    fireEvent.click(getByTestId('back-button'));
    expect(getByTestId('plan-step')).toBeInTheDocument();
    fireEvent.click(getByTestId('continue-button'));
    expect(getByTestId('confirm-step')).toBeInTheDocument();

    if (expectedResult === 'success') {
      axiosMock.onPut(doImportUrl).replyOnce(200, {});
    } else {
      axiosMock.onPut(doImportUrl).replyOnce(400, { error: 'Test error' });
    }

    const confirmButton = getByRole('button', { name: 'Yes, import file' });
    await waitFor(() => {
      expect(confirmButton).not.toHaveAttribute('aria-disabled', 'true');
    });

    act(() => {
      fireEvent.click(confirmButton);
    });

    if (expectedResult === 'success') {
      // Toast message shown
      await waitFor(() => {
        expect(mockSetToastMessage).toHaveBeenCalledWith(`"${sampleTaxonomy.name}" updated`);
      });
    } else {
      // Alert message shown
      await waitFor(() => {
        expect(mockSetAlertError).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Import error',
            error: new Error('Test error'),
          }),
        );
      });
    }
  });

  it.each(['success', 'error'])('can upload new taxonomies from the dialog (%p)', async (expectedResult) => {
    const onClose = jest.fn();
    const {
      findByTestId,
      getByRole,
      getByTestId,
      getByText,
      queryByTestId,
    } = renderWizard({ taxonomy: null, onClose });

    // Check that there is no export step
    expect(queryByTestId('export-step')).not.toBeInTheDocument();
    // Check that there is no back button in the upload step
    expect(queryByTestId('back-button')).not.toBeInTheDocument();

    // Check that we are on the upload step
    expect(getByTestId('upload-step')).toBeInTheDocument();

    // Continue flow
    let continueButton = await screen.findByRole('button', { name: 'Continue' });
    expect(continueButton).toHaveAttribute('aria-disabled', 'true');

    // Invalid file type
    const fileTarGz = new File(['file contents'], 'example.tar.gz', { type: 'application/gzip' });
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [fileTarGz], types: ['Files'] } });
    expect(getByTestId('dropzone')).toBeInTheDocument();
    expect(continueButton).toHaveAttribute('aria-disabled', 'true');

    // Correct file type
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [makeJson('example1.json')], types: ['Files'] } });
    expect(await findByTestId('file-info')).toBeInTheDocument();
    expect(getByText('example1.json')).toBeInTheDocument();

    // Clear file
    fireEvent.click(getByTestId('clear-file-button'));
    expect(await findByTestId('dropzone')).toBeInTheDocument();

    // Reselect file
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [makeJson('example1.json')], types: ['Files'] } });
    expect(await findByTestId('file-info')).toBeInTheDocument();
    expect(getByText('example1.json')).toBeInTheDocument();

    // Click continue once button enabled
    continueButton = await screen.findByRole('button', { name: 'Continue' });
    await waitFor(() => {
      expect(continueButton).not.toHaveAttribute('aria-disabled', 'true');
    });
    fireEvent.click(continueButton);

    expect(await findByTestId('populate-step')).toBeInTheDocument();

    // Test back button
    fireEvent.click(getByTestId('back-button'));
    expect(getByTestId('upload-step')).toBeInTheDocument();
    fireEvent.click(getByRole('button', { name: 'Continue' }));
    expect(await findByTestId('populate-step')).toBeInTheDocument();

    // Check import button is disabled when fields not populated
    expect(getByRole('button', { name: 'Import' })).toHaveAttribute('aria-disabled', 'true');

    // Populate new taxonomy information, leaving the taxonomy type at its default.
    const newTaxonomyName = 'New Taxonomy';
    fillInRequiredFields(newTaxonomyName);

    if (expectedResult === 'success') {
      axiosMock.onPost(doImportNewTaxonomyUrl).replyOnce(200, {});
    } else {
      axiosMock.onPost(doImportNewTaxonomyUrl).replyOnce(400);
    }

    await clickImport();

    if (expectedResult === 'success') {
      // Toast message shown
      await waitFor(() => {
        expect(mockSetToastMessage).toHaveBeenCalledWith(`"${newTaxonomyName}" imported`);
      });
      // The default taxonomy type is submitted when the user never touches the dropdown.
      expect(axiosMock.history.post[0].data.get('taxonomy_type')).toEqual(TaxonomyType.Tags);
    } else {
      // Alert message shown
      await waitFor(() => {
        expect(mockSetAlertError).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Import error',
            error: new Error('Request failed with status code 400'),
          }),
        );
      });
    }
  });

  describe('taxonomy type dropdown', () => {
    it('defaults to Tags and offers every taxonomy type', async () => {
      renderWizard({ taxonomy: null, onClose: jest.fn() });
      await goToPopulateStep();

      // The dropdown is a native `<select>`, whose options are rendered as `<option>`s.
      const select = screen.getByLabelText('Taxonomy Type');
      expect(select).toBe(screen.getByTestId('taxonomy-type-select'));

      expect(select).toHaveValue(TaxonomyType.Tags);
      expect(within(select).getAllByRole('option').map((option) => option.textContent))
        .toEqual(['Tags', 'Competency']);
      expect(within(select).getAllByRole('option').map((option) => option.getAttribute('value')))
        .toEqual(Object.values(TaxonomyType));
    });

    it('keeps the selected type when the user steps back and forward again', async () => {
      renderWizard({ taxonomy: null, onClose: jest.fn() });
      await goToPopulateStep();

      const select = screen.getByTestId('taxonomy-type-select');
      fireEvent.change(select, { target: { value: TaxonomyType.Competency } });
      expect(select).toHaveValue(TaxonomyType.Competency);

      fireEvent.click(screen.getByTestId('back-button'));
      expect(screen.getByTestId('upload-step')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(screen.getByTestId('populate-step')).toBeInTheDocument();
      expect(screen.getByTestId('taxonomy-type-select')).toHaveValue(TaxonomyType.Competency);
    });

    it.each(Object.values(TaxonomyType))('submits the %s type to the import API', async (taxonomyType) => {
      renderWizard({ taxonomy: null, onClose: jest.fn() });
      await goToPopulateStep();

      const newTaxonomyName = `New ${taxonomyType} Taxonomy`;
      fillInRequiredFields(newTaxonomyName);
      fireEvent.change(screen.getByTestId('taxonomy-type-select'), { target: { value: taxonomyType } });

      axiosMock.onPost(doImportNewTaxonomyUrl).replyOnce(200, {});

      await clickImport();

      await waitFor(() => {
        expect(mockSetToastMessage).toHaveBeenCalledWith(`"${newTaxonomyName}" imported`);
      });

      const formData = axiosMock.history.post[0].data;
      expect(formData.get('taxonomy_name')).toEqual(newTaxonomyName);
      expect(formData.get('taxonomy_type')).toEqual(taxonomyType);
    });

    it('is labelled and reachable with the keyboard', async () => {
      const user = userEvent.setup();
      renderWizard({ taxonomy: null, onClose: jest.fn() });
      await goToPopulateStep();

      const select = screen.getByTestId('taxonomy-type-select');
      expect(select).toHaveAccessibleName('Taxonomy Type');

      // Tabbing forward from the description field must land on the dropdown, so that a keyboard
      // user reaches it in the same order as the fields above it.
      screen.getByLabelText('Taxonomy Description').focus();
      await user.tab();
      expect(select).toHaveFocus();

      // Note: we can't assert on arrowing between the options here. This is a native `<select>`, so
      // the browser (not the page) draws and controls the option list, and jsdom implements none of
      // that -- arrow keys, Enter and type-ahead all leave `select.value` untouched under jsdom.
      // What the component owns, and what is asserted above and in the tests before this one, is
      // that the control is focusable, labelled, and carries every option with the right value.
      await user.selectOptions(select, TaxonomyType.Competency);
      expect(select).toHaveValue(TaxonomyType.Competency);
      expect(select).toHaveFocus();
    });

    describe('when the caller sets a default type', () => {
      it('preselects that type but still lets the user change it', async () => {
        const user = userEvent.setup();
        renderWizard({ taxonomy: null, onClose: jest.fn(), defaultTaxonomyType: TaxonomyType.Competency });
        await goToPopulateStep();

        const select = screen.getByTestId('taxonomy-type-select');
        expect(select).toHaveValue(TaxonomyType.Competency);
        expect(select).toBeEnabled();

        await user.selectOptions(select, TaxonomyType.Tags);
        expect(select).toHaveValue(TaxonomyType.Tags);
      });

      it('submits the default type to the import API when it is left alone', async () => {
        renderWizard({ taxonomy: null, onClose: jest.fn(), defaultTaxonomyType: TaxonomyType.Competency });
        await goToPopulateStep();

        fillInRequiredFields('Default Type Taxonomy');
        axiosMock.onPost(doImportNewTaxonomyUrl).replyOnce(200, {});

        await clickImport();

        await waitFor(() => {
          expect(axiosMock.history.post.length).toEqual(1);
        });
        expect(axiosMock.history.post[0].data.get('taxonomy_type')).toEqual(TaxonomyType.Competency);
      });
    });
  });

  describe('onImportSuccess', () => {
    it('reports the taxonomy that was created', async () => {
      const onImportSuccess = jest.fn();
      renderWizard({ taxonomy: null, onClose: jest.fn(), onImportSuccess });
      await goToPopulateStep();

      fillInRequiredFields('Brand New Taxonomy');
      axiosMock.onPost(doImportNewTaxonomyUrl).replyOnce(200, { id: 42, name: 'Brand New Taxonomy' });

      await clickImport();

      await waitFor(() => {
        expect(onImportSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }));
      });
    });

    it('is not called when the import fails', async () => {
      const onClose = jest.fn();
      const onImportSuccess = jest.fn();
      renderWizard({ taxonomy: null, onClose, onImportSuccess });
      await goToPopulateStep();

      fillInRequiredFields('Doomed Taxonomy');
      axiosMock.onPost(doImportNewTaxonomyUrl).replyOnce(400, { error: 'Invalid file' });

      await clickImport();

      await waitFor(() => {
        expect(mockSetAlertError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import error' }));
      });
      expect(onClose).toHaveBeenCalled();
      expect(onImportSuccess).not.toHaveBeenCalled();
    });
  });
});
