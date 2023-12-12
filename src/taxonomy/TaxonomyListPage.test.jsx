import React, { useMemo } from 'react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { act, render, fireEvent } from '@testing-library/react';

import initializeStore from '../store';

import TaxonomyListPage from './TaxonomyListPage';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './data/apiHooks';
import { importTaxonomy } from './import-tags';
import { TaxonomyContext } from './common/context';

let store;
const mockSetToastMessage = jest.fn();
const mockDeleteTaxonomy = jest.fn();
const taxonomies = [{
  id: 1,
  name: 'Taxonomy',
  description: 'This is a description',
}];

jest.mock('./data/apiHooks', () => ({
  useTaxonomyListDataResponse: jest.fn(),
  useIsTaxonomyListDataLoaded: jest.fn(),
  useDeleteTaxonomy: () => mockDeleteTaxonomy,
}));
jest.mock('./taxonomy-card/TaxonomyCardMenu', () => jest.fn(({ onClickMenuItem }) => (
  // eslint-disable-next-line jsx-a11y/control-has-associated-label
  <button type="button" data-testid="test-delete-button" onClick={() => onClickMenuItem('delete')} />
)));

jest.mock('./import-tags', () => ({
  importTaxonomy: jest.fn(),
}));

const RootWrapper = () => {
  const context = useMemo(() => ({
    toastMessage: null,
    setToastMessage: mockSetToastMessage,
  }), []);

  return (
    <AppProvider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <TaxonomyContext.Provider value={context}>
          <TaxonomyListPage intl={injectIntl} />
        </TaxonomyContext.Provider>
      </IntlProvider>
    </AppProvider>
  );
};

describe('<TaxonomyListPage />', async () => {
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

  it('should render page and page title correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Taxonomies')).toBeInTheDocument();
  });

  it('shows the spinner before the query is complete', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(false);
    await act(async () => {
      const { getByRole } = render(<RootWrapper />);
      const spinner = getByRole('status');
      expect(spinner.textContent).toEqual('Loading');
    });
  });

  it('shows the data table after the query is complete', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: taxonomies,
    });
    await act(async () => {
      const { getByTestId } = render(<RootWrapper />);
      expect(getByTestId('taxonomy-card-1')).toBeInTheDocument();
    });
  });

  it('calls the import taxonomy action when the import button is clicked', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: [{
        id: 1,
        name: 'Taxonomy',
        description: 'This is a description',
      }],
    });
    await act(async () => {
      const { getByTestId } = render(<RootWrapper />);
      const importButton = getByTestId('taxonomy-import-button');
      expect(importButton).toBeInTheDocument();
      importButton.click();
      expect(importTaxonomy).toHaveBeenCalled();
    });
  });

  it('should show the success toast after delete', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useTaxonomyListDataResponse.mockReturnValue({
      results: taxonomies,
    });
    mockDeleteTaxonomy.mockImplementationOnce(async (params, callbacks) => {
      callbacks.onSuccess();
    });
    const { getByTestId, getByLabelText } = render(<RootWrapper />);
    fireEvent.click(getByTestId('test-delete-button'));
    fireEvent.change(getByLabelText('Type DELETE to confirm'), { target: { value: 'DELETE' } });
    fireEvent.click(getByTestId('delete-button'));

    expect(mockDeleteTaxonomy).toBeCalledTimes(1);
    expect(mockSetToastMessage).toBeCalledWith(`"${taxonomies[0].name}" deleted`);
  });
});
