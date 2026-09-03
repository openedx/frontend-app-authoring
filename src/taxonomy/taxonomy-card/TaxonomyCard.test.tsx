import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';

import initializeStore from '../../store';
import { TaxonomyType } from '../data/constants';
import { TaxonomyCard } from '.';
import { TaxonomyCardData } from './TaxonomyCard';

let store;
const taxonomyId = 1;

const data: TaxonomyCardData = {
  id: taxonomyId,
  name: 'Taxonomy 1',
  description: 'This is a description',
  readOnly: false,
  canChangeTaxonomy: true,
  canDeleteTaxonomy: true,
  tagsCount: 0,
};

const queryClient = new QueryClient();

const TaxonomyCardComponent = ({ original }: { original: TaxonomyCardData; }) => (
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

  const readOnlyBadgeText = 'Read only';

  it('not show the read-only badge with normal taxonomies', () => {
    const { queryByText } = render(<TaxonomyCardComponent original={data} />);
    expect(queryByText(readOnlyBadgeText)).not.toBeInTheDocument();
  });

  it('shows the read-only badge with system taxonomies', () => {
    const cardData = { ...data };
    cardData.readOnly = true;

    const { getByText } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByText(readOnlyBadgeText)).toBeInTheDocument();
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

  const competencyIconAltText = 'Competency taxonomy';
  const tagsIconAltText = 'Tags taxonomy';

  it('shows the competency type icon with competency taxonomies', () => {
    const cardData = { ...data, taxonomyType: TaxonomyType.Competency };

    const { getByText, getByTestId, queryByTestId } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByTestId('taxonomy-type-icon-competency')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-type-icon-tags')).not.toBeInTheDocument();

    // The glyph is hidden from assistive tech, so the type has to be readable as text
    expect(getByText(competencyIconAltText)).toBeInTheDocument();
  });

  it('shows the tags type icon with tags taxonomies', () => {
    const cardData = { ...data, taxonomyType: TaxonomyType.Tags };

    const { getByText, getByTestId, queryByTestId } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByTestId('taxonomy-type-icon-tags')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-type-icon-competency')).not.toBeInTheDocument();
    expect(getByText(tagsIconAltText)).toBeInTheDocument();
  });

  it('shows a type icon even when the taxonomy has no type, along with the read-only badge', () => {
    const cardData = { ...data, readOnly: true };

    const { getByText, getByTestId } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByTestId('taxonomy-type-icon-tags')).toBeInTheDocument();
    expect(getByText(tagsIconAltText)).toBeInTheDocument();
    expect(getByText(readOnlyBadgeText)).toBeInTheDocument();
  });

  it('shows the tags type icon when the taxonomy type is not one we know', () => {
    // A type the backend may send that this version of the frontend doesn't know about yet
    const cardData = { ...data, taxonomyType: 'unknown-type' as TaxonomyType };

    const { getByText, getByTestId, queryByTestId } = render(<TaxonomyCardComponent original={cardData} />);
    expect(getByTestId('taxonomy-type-icon-tags')).toBeInTheDocument();
    expect(queryByTestId('taxonomy-type-icon-competency')).not.toBeInTheDocument();
    expect(getByText(tagsIconAltText)).toBeInTheDocument();
  });
});
