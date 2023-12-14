import React, { useMemo } from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { fireEvent, render } from '@testing-library/react';

import { useTaxonomyDetailData } from './data/api';
import initializeStore from '../../store';
import TaxonomyDetailPage from './TaxonomyDetailPage';
import { TaxonomyContext } from '../common/context';

let store;
const mockNavigate = jest.fn();
const mockMutate = jest.fn();
const mockSetToastMessage = jest.fn();

jest.mock('./data/api', () => ({
  useTaxonomyDetailData: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    taxonomyId: '1',
  }),
  useNavigate: () => mockNavigate,
}));
jest.mock('../data/apiHooks', () => ({
  useDeleteTaxonomy: () => mockMutate,
}));

jest.mock('./TaxonomyDetailSideCard', () => jest.fn(() => <>Mock TaxonomyDetailSideCard</>));
jest.mock('../tag-list/TagListTable', () => jest.fn(() => <>Mock TagListTable</>));

const RootWrapper = () => {
  const context = useMemo(() => ({
    toastMessage: null,
    setToastMessage: mockSetToastMessage,
  }), []);

  return (
    <AppProvider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <TaxonomyContext.Provider value={context}>
          <TaxonomyDetailPage />
        </TaxonomyContext.Provider>
      </IntlProvider>
    </AppProvider>
  );
};

describe('<TaxonomyDetailPage />', async () => {
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

  it('shows the spinner before the query is complete', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isFetched: false,
    });
    const { getByRole } = render(<RootWrapper />);
    const spinner = getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows the connector error component if got some error', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isFetched: true,
      isError: true,
    });
    const { getByTestId } = render(<RootWrapper />);
    expect(getByTestId('connectionErrorAlert')).toBeInTheDocument();
  });

  it('should render page and page title correctly', async () => {
    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: 'Test taxonomy',
        description: 'This is a description',
        systemDefined: true,
      },
    });
    const { getByRole } = render(<RootWrapper />);
    expect(getByRole('heading')).toHaveTextContent('Test taxonomy');
  });

  it('should open export modal on export menu click', () => {
    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: 'Test taxonomy',
        description: 'This is a description',
      },
    });

    const { getByRole, getByText } = render(<RootWrapper />);

    // Modal closed
    expect(() => getByText('Select format to export')).toThrow();

    // Click on export menu
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByText('Export'));

    // Modal opened
    expect(getByText('Select format to export')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(() => getByText('Select format to export')).toThrow();
  });

  it('should open delete dialog on delete menu click', () => {
    const taxonomyName = 'Test taxonomy';

    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: taxonomyName,
        description: 'This is a description',
      },
    });

    const { getByRole, getByText } = render(<RootWrapper />);

    // Modal closed
    expect(() => getByText(`Delete "${taxonomyName}"`)).toThrow();

    // Click on delete menu
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByText('Delete'));

    // Modal opened
    expect(getByText(`Delete "${taxonomyName}"`)).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(() => getByText(`Delete "${taxonomyName}"`)).toThrow();
  });

  it('should delete a taxonomy', () => {
    const taxonomyName = 'Test taxonomy';

    useTaxonomyDetailData.mockReturnValue({
      isSuccess: true,
      isFetched: true,
      isError: false,
      data: {
        id: 1,
        name: taxonomyName,
        description: 'This is a description',
      },
    });
    mockMutate.mockImplementationOnce(async (params, callbacks) => {
      callbacks.onSuccess();
    });

    const {
      getByRole, getByText, getByLabelText, getByTestId,
    } = render(<RootWrapper />);

    // Modal closed
    expect(() => getByText(`Delete "${taxonomyName}"`)).toThrow();

    // Click on delete menu
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByText('Delete'));

    // Modal opened
    expect(getByText(`Delete "${taxonomyName}"`)).toBeInTheDocument();

    const input = getByLabelText('Type DELETE to confirm');
    fireEvent.change(input, { target: { value: 'DELETE' } });

    // Click on delete button
    fireEvent.click(getByTestId('delete-button'));

    // Modal closed
    expect(() => getByText(`Delete "${taxonomyName}"`)).toThrow();
    expect(mockMutate).toBeCalledTimes(1);

    // Should redirect after a success delete
    expect(mockSetToastMessage).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith('/taxonomies');
  });
});
