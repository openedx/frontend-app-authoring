import { useMemo } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act, render, fireEvent, waitFor,
} from '@testing-library/react';
import PropTypes from 'prop-types';

import { TaxonomyContext } from '../common/context';
import initializeStore from '../../store';
import { deleteTaxonomy, getTaxonomy, getTaxonomyExportFile } from '../data/api';
import { TaxonomyMenu } from '.';

let store;
const taxonomyId = 1;
const taxonomyName = 'Taxonomy 1';

jest.mock('../data/api', () => ({
  ...jest.requireActual('../data/api'),
  getTaxonomyExportFile: jest.fn(),
  deleteTaxonomy: jest.fn(),
  getTaxonomy: jest.fn(),
}));

const queryClient = new QueryClient();

const mockSetToastMessage = jest.fn();

const TaxonomyMenuComponent = ({
  iconMenu,
  systemDefined,
  canChangeTaxonomy,
  canDeleteTaxonomy,
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
                tagsCount: 0,
                systemDefined,
                canChangeTaxonomy,
                canDeleteTaxonomy,
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
  canChangeTaxonomy: PropTypes.bool,
  systemDefined: PropTypes.bool,
  canDeleteTaxonomy: PropTypes.bool,
};

TaxonomyMenuComponent.defaultProps = {
  systemDefined: false,
  canChangeTaxonomy: true,
  canDeleteTaxonomy: true,
};

describe.each([true, false])('<TaxonomyMenu iconMenu=%s />', async (iconMenu) => {
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

  test('should open and close menu on button click', async () => {
    const { getByTestId, queryByTestId } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Menu closed/doesn't exist yet
    expect(queryByTestId('taxonomy-menu')).not.toBeInTheDocument();

    // Click on the menu button to open
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();

    // Click on button again to close the menu
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });

    // Menu closed
    // Jest bug: toBeVisible() isn't checking opacity correctly
    // expect(getByTestId('taxonomy-menu')).not.toBeVisible();
    expect(getByTestId('taxonomy-menu').style.opacity).toEqual('0');

    // Menu button still visible
    expect(getByTestId('taxonomy-menu-button')).toBeVisible();
  });

  test('Shows menu actions that user is permitted', async () => {
    const { getByTestId, queryByTestId } = render(
      <TaxonomyMenuComponent
        iconMenu={iconMenu}
      />,
    );

    // Click on the menu button to open
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();

    // Ensure expected menu items are found
    expect(queryByTestId('taxonomy-menu-export')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-import')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-manageOrgs')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-delete')).toBeInTheDocument();
  });

  test('Hides menu actions that user is not permitted', async () => {
    const { getByTestId, queryByTestId } = render(
      <TaxonomyMenuComponent
        iconMenu={iconMenu}
        systemDefined={false}
        canChangeTaxonomy={false}
        canDeleteTaxonomy={false}
      />,
    );

    // Click on the menu button to open
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });

    // Ensure expected menu items are found
    expect(queryByTestId('taxonomy-menu-export')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-import')).not.toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-manageOrgs')).not.toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-delete')).not.toBeInTheDocument();
  });

  test('Hides import/delete actions for system-defined taxonomies', async () => {
    const systemDefined = true;
    const { getByTestId, queryByTestId } = render(
      <TaxonomyMenuComponent
        iconMenu={iconMenu}
        systemDefined={systemDefined}
      />,
    );

    // Click on the menu button to open
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });

    // Ensure expected menu items are found
    expect(queryByTestId('taxonomy-menu-export')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-import')).not.toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-manageOrgs')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-menu-delete')).not.toBeInTheDocument();
  });

  test('should open export modal on export menu click', async () => {
    const { getByTestId, getByText, queryByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();

    // Click on export menu
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-export'));
    });

    // Modal opened
    expect(getByText('Select format to export')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();
  });

  test('should call import tags when menu click', async () => {
    const { getByTestId, getByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on import menu
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-import'));
    });

    expect(getByText('Update "Taxonomy 1"')).toBeInTheDocument();
  });

  test('should export a taxonomy', async () => {
    const { getByTestId, getByText, queryByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Click on export menu
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-export'));
    });

    // Select JSON format and click on export
    await act(async () => {
      fireEvent.click(getByText('JSON file'));
    });
    await act(async () => {
      fireEvent.click(getByTestId('export-button-1'));
    });

    // Modal closed
    expect(queryByText('Select format to export')).not.toBeInTheDocument();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomyId, 'json');
  });

  test('should open delete dialog on delete menu click', async () => {
    const { getByTestId, getByText, queryByText } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // Modal closed
    expect(queryByText(`Delete "${taxonomyName}"`)).not.toBeInTheDocument();

    // Click on delete menu
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-delete'));
    });

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
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-delete'));
    });

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

  it('should open manage orgs dialog menu click', async () => {
    const {
      findByText, getByTestId, getByText, queryByText,
    } = render(<TaxonomyMenuComponent iconMenu={iconMenu} />);

    // We need to provide a taxonomy or the modal will not open
    getTaxonomy.mockResolvedValue({
      id: 1,
      name: 'Taxonomy 1',
      orgs: [],
      allOrgs: true,
    });

    // Modal closed
    expect(queryByText('Assign to organizations')).not.toBeInTheDocument();

    // Click on delete menu
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-button'));
    });
    await act(async () => {
      fireEvent.click(getByTestId('taxonomy-menu-manageOrgs'));
    });

    // Modal opened
    expect(await findByText('Assign to organizations')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(queryByText('Assign to organizations')).not.toBeInTheDocument();
  });
});
