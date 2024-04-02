import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import PropTypes from 'prop-types';

import initializeStore from '../../store';
import { TaxonomyContext } from '../common/context';
import ManageOrgsModal from './ManageOrgsModal';

let store;

const taxonomy = {
  id: 1,
  name: 'Test Taxonomy',
  allOrgs: false,
  orgs: ['org1', 'org2'],
};

const orgs = ['org1', 'org2', 'org3', 'org4', 'org5'];

jest.mock('../data/api', () => ({
  ...jest.requireActual('../data/api'),
  getTaxonomy: jest.fn().mockResolvedValue(taxonomy),
}));

jest.mock('../../generic/data/api', () => ({
  ...jest.requireActual('../../generic/data/api'),
  getOrganizations: jest.fn().mockResolvedValue(orgs),
}));

const mockUseManageOrgsMutate = jest.fn();

jest.mock('./data/api', () => ({
  ...jest.requireActual('./data/api'),
  useManageOrgs: jest.fn(() => ({
    ...jest.requireActual('./data/api').useManageOrgs(),
    mutateAsync: mockUseManageOrgsMutate,
  })),
}));

const mockSetToastMessage = jest.fn();
const mockSetAlertProps = jest.fn();
const context = {
  toastMessage: null,
  setToastMessage: mockSetToastMessage,
  alertProps: null,
  setAlertProps: mockSetAlertProps,
};

const queryClient = new QueryClient();

const RootWrapper = ({ onClose }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TaxonomyContext.Provider value={context}>
          <ManageOrgsModal taxonomyId={taxonomy.id} isOpen onClose={onClose} />
        </TaxonomyContext.Provider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

RootWrapper.propTypes = {
  onClose: PropTypes.func.isRequired,
};

describe('<ManageOrgsModal />', () => {
  beforeEach(() => {
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
    queryClient.clear();
  });

  const checkDialogRender = async (getByText) => {
    await waitFor(() => {
      // Dialog title
      expect(getByText('Assign to organizations')).toBeInTheDocument();
      // Orgs assigned to the taxonomy
      expect(getByText('org1')).toBeInTheDocument();
      expect(getByText('org2')).toBeInTheDocument();
    });
  };

  it('should render the dialog and close on cancel', async () => {
    const onClose = jest.fn();
    const { getByText, getByRole } = render(<RootWrapper onClose={onClose} />);

    await checkDialogRender(getByText);

    const cancelButton = getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('can assign orgs to taxonomies from the dialog', async () => {
    const onClose = jest.fn();
    const {
      queryAllByTestId,
      getByTestId,
      getByText,
      getByRole,
      queryByRole,
    } = render(<RootWrapper onClose={onClose} />);

    // First, org1 and org2 are already added
    await checkDialogRender(getByText);

    // Remove org2
    fireEvent.click(getByRole('button', { name: 'Remove org2' }));

    expect(getByRole('button', { name: 'Remove org1' })).toBeInTheDocument();
    expect(queryByRole('button', { name: 'Remove org2' })).not.toBeInTheDocument();

    const input = getByTestId('autosuggest-iconbutton');
    fireEvent.click(input);

    // We get the following options in the dropdown list:
    const list = queryAllByTestId('autosuggest-optionitem');
    expect(list.length).toBe(4);
    expect(getByRole('option', { name: 'org2' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'org3' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'org4' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'org5' })).toBeInTheDocument();

    // Select org3
    fireEvent.click(getByRole('option', { name: 'org3' }));
    expect(getByRole('button', { name: 'Remove org1' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Remove org3' })).toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUseManageOrgsMutate).toHaveBeenCalledWith({
        taxonomyId: taxonomy.id,
        orgs: ['org1', 'org3'],
        allOrgs: false,
      });
    });

    // Toast message shown
    expect(mockSetToastMessage).toBeCalledWith('Assigned organizations updated');
  });

  it('can assign all orgs to taxonomies from the dialog', async () => {
    const onClose = jest.fn();
    const { getByRole, getByText } = render(<RootWrapper onClose={onClose} />);

    await checkDialogRender(getByText);

    const checkbox = getByRole('checkbox', { name: 'Assign to all organizations' });
    fireEvent.click(checkbox);

    fireEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUseManageOrgsMutate).toHaveBeenCalledWith({
        taxonomyId: taxonomy.id,
        allOrgs: true,
      });
    });

    // Toast message shown
    expect(mockSetToastMessage).toBeCalledWith('Assigned organizations updated');
  });

  it('can assign no orgs to taxonomies from the dialog', async () => {
    const onClose = jest.fn();
    const { getByRole, getByText } = render(<RootWrapper onClose={onClose} />);

    await checkDialogRender(getByText);

    // Remove org1
    fireEvent.click(getByText('org1').nextSibling);
    // Remove org2
    fireEvent.click(getByText('org2').nextSibling);

    fireEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      // Check confirm modal is open
      expect(getByText('Unassign taxonomy')).toBeInTheDocument();
    });

    fireEvent.click(getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockUseManageOrgsMutate).toHaveBeenCalledWith({
        taxonomyId: taxonomy.id,
        allOrgs: false,
        orgs: [],
      });
    });

    // Toast message shown
    expect(mockSetToastMessage).toBeCalledWith('Assigned organizations updated');
  });
});
