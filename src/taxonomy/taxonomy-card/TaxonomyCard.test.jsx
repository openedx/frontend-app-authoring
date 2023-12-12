import React from 'react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { render, fireEvent } from '@testing-library/react';
import PropTypes from 'prop-types';

import initializeStore from '../../store';
import { getTaxonomyExportFile } from '../data/api';
import TaxonomyCard from '.';

let store;
const taxonomyId = 1;

const data = {
  id: taxonomyId,
  name: 'Taxonomy 1',
  description: 'This is a description',
};

jest.mock('../data/api', () => ({
  getTaxonomyExportFile: jest.fn(),
}));

const TaxonomyCardComponent = ({ original }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TaxonomyCard intl={injectIntl} original={original} />
    </IntlProvider>
  </AppProvider>
);

TaxonomyCardComponent.propTypes = {
  original: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    systemDefined: PropTypes.bool,
    orgsCount: PropTypes.number,
  }).isRequired,
};

describe('<TaxonomyCard />', async () => {
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

  it('should render title and description of the card', () => {
    const { getByText } = render(<TaxonomyCardComponent original={data} />);
    expect(getByText(data.name)).toBeInTheDocument();
    expect(getByText(data.description)).toBeInTheDocument();
  });

  it('not show the system-defined badge with normal taxonomies', () => {
    const { getByText } = render(<TaxonomyCardComponent original={data} />);
    expect(() => getByText('System-level')).toThrow();
  });

  it('shows the system-defined badge with system taxonomies', () => {
    const cardData = {
      systemDefined: true,
      ...data,
    };

    const { getByText } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByText('System-level')).toBeInTheDocument();
  });

  it('not show org count with taxonomies without orgs', () => {
    const { getByText } = render(<TaxonomyCardComponent original={data} />);
    expect(() => getByText('Assigned to 0 orgs')).toThrow();
  });

  it('shows org count with taxonomies with orgs', () => {
    const cardData = {
      orgsCount: 6,
      ...data,
    };
    const { getByText } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByText('Assigned to 6 orgs')).toBeInTheDocument();
  });

  test('should open and close menu on button click', () => {
    const { getByTestId } = render(<TaxonomyCardComponent original={data} />);

    // Menu closed/doesn't exist yet
    expect(() => getByTestId('taxonomy-card-menu-1')).toThrow();

    // Click on the menu button to open
    fireEvent.click(getByTestId('taxonomy-card-menu-button-1'));

    // Menu opened
    expect(getByTestId('taxonomy-card-menu-1')).toBeVisible();

    // Click on button again to close the menu
    fireEvent.click(getByTestId('taxonomy-card-menu-button-1'));

    // Menu closed
    // Jest bug: toBeVisible() isn't checking opacity correctly
    // expect(getByTestId('taxonomy-card-menu-1')).not.toBeVisible();
    expect(getByTestId('taxonomy-card-menu-1').style.opacity).toEqual('0');

    // Menu button still visible
    expect(getByTestId('taxonomy-card-menu-button-1')).toBeVisible();
  });

  test('should open export modal on export menu click', () => {
    const { getByTestId, getByText } = render(<TaxonomyCardComponent original={data} />);

    // Modal closed
    expect(() => getByText('Select format to export')).toThrow();

    // Click on export menu
    fireEvent.click(getByTestId('taxonomy-card-menu-button-1'));
    fireEvent.click(getByTestId('taxonomy-card-menu-export-1'));

    // Modal opened
    expect(getByText('Select format to export')).toBeInTheDocument();

    // Click on cancel button
    fireEvent.click(getByText('Cancel'));

    // Modal closed
    expect(() => getByText('Select format to export')).toThrow();
  });

  test('should export a taxonomy', () => {
    const { getByTestId, getByText } = render(<TaxonomyCardComponent original={data} />);

    // Click on export menu
    fireEvent.click(getByTestId('taxonomy-card-menu-button-1'));
    fireEvent.click(getByTestId('taxonomy-card-menu-export-1'));

    // Select JSON format and click on export
    fireEvent.click(getByText('JSON file'));
    fireEvent.click(getByTestId('export-button-1'));

    // Modal closed
    expect(() => getByText('Select format to export')).toThrow();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomyId, 'json');
  });
});
