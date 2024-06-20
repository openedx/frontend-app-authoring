import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { render } from '@testing-library/react';

import initializeStore from '../../store';

import TaxonomyDetailSideCard from './TaxonomyDetailSideCard';

let store;

const data = {
  id: 1,
  name: 'Taxonomy 1',
  description: 'This is a description',
};

const TaxonomyCardComponent = ({ taxonomy }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TaxonomyDetailSideCard taxonomy={taxonomy} />
    </IntlProvider>
  </AppProvider>
);

TaxonomyCardComponent.propTypes = TaxonomyDetailSideCard.propTypes;

describe('<TaxonomyDetailSideCard/>', () => {
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
    const { getByText } = render(<TaxonomyCardComponent taxonomy={data} />);
    expect(getByText(data.name)).toBeInTheDocument();
    expect(getByText(data.description)).toBeInTheDocument();
  });
});
