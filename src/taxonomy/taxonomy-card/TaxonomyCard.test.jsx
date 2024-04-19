import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';

import initializeStore from '../../store';
import TaxonomyCard from '.';

let store;
const taxonomyId = 1;

const data = {
  id: taxonomyId,
  name: 'Taxonomy 1',
  description: 'This is a description',
  systemDefined: false,
  canChangeTaxonomy: true,
  canDeleteTaxonomy: true,
  tagsCount: 0,
};

const queryClient = new QueryClient();

const TaxonomyCardComponent = ({ original }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TaxonomyCard
          original={original}
        />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

TaxonomyCardComponent.propTypes = TaxonomyCard.propTypes;

describe('<TaxonomyCard />', () => {
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

  it('should show the ⋮ menu', () => {
    const { getByTestId, queryByTestId } = render(<TaxonomyCardComponent original={data} />);

    // Menu closed/doesn't exist yet
    expect(queryByTestId('taxonomy-menu')).not.toBeInTheDocument();

    // Click on the menu button to open
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Menu opened
    expect(getByTestId('taxonomy-menu')).toBeVisible();
    expect(getByTestId('taxonomy-menu-import')).toBeVisible();
    expect(getByTestId('taxonomy-menu-export')).toBeVisible();
    expect(getByTestId('taxonomy-menu-delete')).toBeVisible();

    // Click on button again to close the menu
    fireEvent.click(getByTestId('taxonomy-menu-button'));

    // Menu closed
    // Jest bug: toBeVisible() isn't checking opacity correctly
    // expect(getByTestId('taxonomy-menu')).not.toBeVisible();
    expect(getByTestId('taxonomy-menu').style.opacity).toEqual('0');

    // Menu button still visible
    expect(getByTestId('taxonomy-menu-button')).toBeVisible();
  });

  it('not show the system-defined badge with normal taxonomies', () => {
    const { queryByText } = render(<TaxonomyCardComponent original={data} />);
    expect(queryByText('System-level')).not.toBeInTheDocument();
  });

  it('shows the system-defined badge with system taxonomies', () => {
    const cardData = { ...data };
    cardData.systemDefined = true;

    const { getByText } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByText('System-level')).toBeInTheDocument();
  });

  it('not show org count with taxonomies without orgs', () => {
    const { queryByText } = render(<TaxonomyCardComponent original={data} />);
    expect(queryByText('Assigned to 0 orgs')).not.toBeInTheDocument();
  });

  it('shows org count with taxonomies with orgs', () => {
    const cardData = {
      orgsCount: 6,
      ...data,
    };
    const { getByText } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByText('Assigned to 6 orgs')).toBeInTheDocument();
  });
});
