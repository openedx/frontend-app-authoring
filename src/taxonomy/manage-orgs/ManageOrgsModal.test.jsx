import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
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

const orgs = ['org1', 'org2', 'org3'];

jest.mock('../data/api', () => ({
  ...jest.requireActual('../data/api'),
  getTaxonomy: jest.fn().mockResolvedValue(taxonomy),
}));

jest.mock('../../generic/data/apiHooks', () => ({
  ...jest.requireActual('../../generic/data/apiHooks'),
  getOrganizations: jest.fn().mockResolvedValue(orgs),
}));

// const mockUseImportTagsMutate = jest.fn();

// jest.mock('./data/api', () => ({
//   ...jest.requireActual('./data/api'),
//   planImportTags: jest.fn(),
//   useImportTags: jest.fn(() => ({
//     ...jest.requireActual('./data/api').useImportTags(),
//     mutateAsync: mockUseImportTagsMutate,
//   })),
// }));

const mockSetToastMessage = jest.fn();
const mockSetAlertProps = jest.fn();
const context = {
  toastMessage: null,
  setToastMessage: mockSetToastMessage,
  alertProps: null,
  setAlertProps: mockSetAlertProps,
};

const queryClient = new QueryClient();

const RootWrapper = ({ close }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TaxonomyContext.Provider value={context}>
          <ManageOrgsModal taxonomyId={taxonomy.id} isOpen close={close} />
        </TaxonomyContext.Provider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

RootWrapper.propTypes = {
  close: PropTypes.func.isRequired,
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

  it('should render the dialog and close on cancel', async () => {
    const close = jest.fn();
    const { getByText, getByRole } = render(<RootWrapper close={close} />);

    await waitFor(() => {
      expect(getByText('Assign to organizations')).toBeInTheDocument();
    });

    const cancelButton = getByRole('button', { name: 'Cancel' });
    cancelButton.click();
    expect(close).toHaveBeenCalled();
  });

  it.each(['success', 'error'])('can assign orgs to taxonomies from the dialog (%p)', async (expectedResult) => {
    const close = jest.fn();
    const { getByText } = render(<RootWrapper close={close} />);

    await waitFor(() => {
      expect(getByText('Assign to organizations')).toBeInTheDocument();
    });
    //
    // await waitFor(() => {
    //   expect(mockUseImportTagsMutate).toHaveBeenCalledWith({ taxonomyId: taxonomy.id, file: fileJson });
    // });

    if (expectedResult === 'success') {
      // Toast message shown
      expect(mockSetToastMessage).toBeCalledWith('Assigned organizations updated');
    } else {
      // ToDo: check error
      // Alert message shown
      // expect(mockSetAlertProps).toBeCalledWith(
      //   expect.objectContaining({
      //     variant: 'danger',
      //     title: 'Import error',
      //     description: 'Test error',
      //   }),
      // );
    }
  });
});
