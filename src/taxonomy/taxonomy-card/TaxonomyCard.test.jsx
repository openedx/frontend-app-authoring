import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import PropTypes from 'prop-types';

import initializeStore from '../../store';
import TaxonomyCard from '.';

let store;
const taxonomyId = 1;

const data = {
  id: taxonomyId,
  name: 'Taxonomy 1',
  description: 'This is a description',
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

TaxonomyCardComponent.propTypes = {
  original: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    systemDefined: PropTypes.bool,
    orgsCount: PropTypes.number,
    onDeleteTaxonomy: PropTypes.func,
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
    const { queryByText } = render(<TaxonomyCardComponent original={data} />);
    expect(queryByText('System-level')).not.toBeInTheDocument();
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
