import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor, render } from '@testing-library/react';
import PropTypes from 'prop-types';

import initializeStore from '../../store';
import { getTaxonomyExportFile } from '../data/api';
import ImportTagsWizard from './ImportTagsWizard';

let store;

const queryClient = new QueryClient();
/*
ImportTagsWizard.propTypes = {
  taxonomy: TaxonomyProp.isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

const TaxonomyProp = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});
*/

jest.mock('../data/api', () => ({
  getTaxonomyExportFile: jest.fn(),
}));

const taxonomy = {
  id: 1,
  name: 'Test Taxonomy',
};

const RootWrapper = ({ close }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <ImportTagsWizard taxonomy={taxonomy} isOpen close={close} />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

RootWrapper.propTypes = {
  close: PropTypes.func.isRequired,
};

describe('<ImportTagsWizard />', () => {
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

  it('render the dialog in the first step can close on cancel', () => {
    const close = jest.fn();
    const { getByTestId } = render(<RootWrapper close={close} />);

    waitFor(() => {
      expect(getByTestId('import-tags-wizard')).toBeInTheDocument();
    });
    expect(getByTestId('export-step')).toBeInTheDocument();
    const cancelButton = getByTestId('cancel-button');
    cancelButton.click();
    expect(close).toHaveBeenCalled();
  });

  it('can export taxonomies from the dialog', () => {
    const close = jest.fn();
    const { getByTestId } = render(<RootWrapper close={close} />);

    waitFor(() => {
      expect(getByTestId('import-tags-wizard')).toBeInTheDocument();
    });
    expect(getByTestId('export-step')).toBeInTheDocument();

    const exportJsonButton = getByTestId('export-json-button');
    exportJsonButton.click();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomy.id, 'json');

    const exportCsvButton = getByTestId('export-csv-button');
    exportCsvButton.click();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomy.id, 'csv');
  });
});
