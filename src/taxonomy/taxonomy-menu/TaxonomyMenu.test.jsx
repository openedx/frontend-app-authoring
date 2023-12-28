import { useMemo } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, fireEvent, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import each from 'jest-each';

import { TaxonomyContext } from '../common/context';
import initializeStore from '../../store';
import { deleteTaxonomy, getTaxonomyExportFile } from '../data/api';
import { importTaxonomyTags } from '../import-tags';
import { TaxonomyMenu } from '.';

let store;
const taxonomyId = 1;
const taxonomyName = 'Taxonomy 1';

jest.mock('../import-tags', () => ({
  importTaxonomyTags: jest.fn().mockResolvedValue({}),
}));

jest.mock('../data/api', () => ({
  ...jest.requireActual('../data/api'),
  getTaxonomyExportFile: jest.fn(),
  deleteTaxonomy: jest.fn(),
}));

const queryClient = new QueryClient();

const mockSetToastMessage = jest.fn();

const TaxonomyMenuComponent = ({
  systemDefined,
  allowFreeText,
  iconMenu,
}) => {
  const context = useMemo(() => ({
    toastMessage: null,
    setToastMessage: mockSetToastMessage,
  }), []);

  return (
    <AppProvider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <QueryClientProvider client={queryClient}>
          <TaxonomyContext.Provider value={context}>
            <TaxonomyMenu
              taxonomy={{
                id: taxonomyId,
                name: taxonomyName,
                systemDefined,
                allowFreeText,
                tagsCount: 0,
              }}
              iconMenu={iconMenu}
            />
          </TaxonomyContext.Provider>
        </QueryClientProvider>
      </IntlProvider>
    </AppProvider>
  );
};

TaxonomyMenuComponent.propTypes = {
  iconMenu: PropTypes.bool.isRequired,
  systemDefined: PropTypes.bool,
  allowFreeText: PropTypes.bool,
};

TaxonomyMenuComponent.defaultProps = {
  systemDefined: false,
  allowFreeText: false,
};

each([true, false]).describe('<TaxonomyMenu iconMenu=%s />', async (iconMenu) => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should open and close menu on button click', () => {
    const { getByTestId, queryByTestId } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Menu closed/doesn't exist yet
    expect(queryByTestId('taxonomy-menu')).not.toBeInTheDocument();

    // Click on the menu button to open
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();

    // Click on button again to close the menu
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Menu closed
    // Jest bug: toBeVisible() isn't checking opacity correctly
    // expect(getByTestId('taxonomy-menu')).not.toBeVisible();
    expect(getByTestId('taxonomy-menu').style.opacity).toEqual('0');

    // Menu button still visible
    expect(getByTestId('taxonomy-menu-button')).toBeVisible();
  });

  test('doesnt show systemDefined taxonomies disabled menus', () => {
    const { getByTestId, queryByTestId } = render(<TaxonomyMenuComponent iconMenu={iconMenu} systemDefined />);

    // Menu closed/doesn't exist yet
    expect(queryByTestId('taxonomy-menu')).not.toBeInTheDocument();

    // Click on the menu button to open
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();

    // Check that the import menu is not show
    expect(queryByTestId('taxonomy-menu-import')).not.toBeInTheDocument();
  });

  test('doesnt show freeText taxonomies disabled menus', () => {
    const { getByTestId, queryByTestId } = render(<TaxonomyMenuComponent iconMenu={iconMenu} allowFreeText />);

    // Menu closed/doesn't exist yet
    expect(queryByTestId('taxonomy-menu')).not.toBeInTheDocument();

    // Click on the menu button to open
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();

    // Check that the import menu is not show
    expect(queryByTestId('taxonomy-menu-import')).not.toBeInTheDocument();
  });

  test('should open export modal on export menu click', () => {
    const { getByTestId, getByText, queryByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();

    // Click on export menu
    fireEvent.click(getByTestId('taxonomy-menu-button'));
    fireEvent.click(getByTestId('taxonomy-menu-export'));

    // Modal opened
    expect(getByText('Select format to export')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();
  });

  test('should call import tags when menu click', () => {
    const { getByTestId } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on import menu
    fireEvent.click(getByTestId('taxonomy-menu-button'));
    fireEvent.click(getByTestId('taxonomy-menu-import'));

    expect(importTaxonomyTags).toHaveBeenCalled();
  });

  test('should export a taxonomy', () => {
    const { getByTestId, getByText, queryByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on export menu
    fireEvent.click(getByTestId('taxonomy-menu-button'));
    fireEvent.click(getByTestId('taxonomy-menu-export'));

    // Select JSON format and click on export
    fireEvent.click(getByText('JSON file'));
    fireEvent.click(getByTestId('export-button-1'));

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomyId, 'json');
  });

  test('should open delete dialog on delete menu click', () => {
    const { getByTestId, getByText, queryByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Modal closed
    expect(queryByText(`Delete "${taxonomyName}"`)).not.toBeInTheDocument();

    // Click on delete menu
    fireEvent.click(getByTestId('taxonomy-menu-button'));
    fireEvent.click(getByTestId('taxonomy-menu-delete'));

    // Modal opened
    expect(getByText(`Delete "${taxonomyName}"`)).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(queryByText(`Delete "${taxonomyName}"`)).not.toBeInTheDocument();
  });

  test('should delete a taxonomy', async () => {
    const { getByTestId, getByLabelText, queryByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on delete menu
    fireEvent.click(getByTestId('taxonomy-menu-button'));
    fireEvent.click(getByTestId('taxonomy-menu-delete'));

    const deleteButton = getByTestId('delete-button');

    // The delete button must to be disabled
    expect(deleteButton).toBeDisabled();

    // Testing delete button enabled/disabled changes
    const input = getByLabelText('Type DELETE to confirm');
    fireEvent.change(input, { target: { value: 'DELETE_INVALID' } });
    expect(deleteButton).toBeDisabled();
    fireEvent.change(input, { target: { value: 'DELETE' } });
    expect(deleteButton).toBeEnabled();

    deleteTaxonomy.mockResolvedValueOnce({});

    // Click on delete button
    fireEvent.click(deleteButton);

    // Modal closed
    expect(queryByText(`Delete "${taxonomyName}"`)).not.toBeInTheDocument();

    await waitFor(async () => {
      expect(deleteTaxonomy).toBeCalledTimes(1);
    });

    // Toast message shown
    expect(mockSetToastMessage).toBeCalledWith(`"${taxonomyName}" deleted`);
  });
});
