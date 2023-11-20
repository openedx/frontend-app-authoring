import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render } from '@testing-library/react';
import PropTypes from 'prop-types';

import ContentTagsCollapsible from './ContentTagsCollapsible';

jest.mock('./data/apiHooks', () => ({
  useTaxonomyTagsDataResponse: jest.fn(),
  useIsTaxonomyTagsDataLoaded: jest.fn(),
}));

const data = {
  id: 123,
  name: 'Taxonomy 1',
  contentTags: [
    {
      value: 'Tag 1',
      lineage: ['Tag 1'],
    },
    {
      value: 'Tag 2',
      lineage: ['Tag 2'],
    },
  ],
};

const ContentTagsCollapsibleComponent = ({ taxonomyAndTagsData }) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsCollapsible taxonomyAndTagsData={taxonomyAndTagsData} />
  </IntlProvider>
);

ContentTagsCollapsibleComponent.propTypes = {
  taxonomyAndTagsData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    contentTags: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      lineage: PropTypes.arrayOf(PropTypes.string),
    })),
  }).isRequired,
};

describe('<ContentTagsCollapsible />', () => {
  it('should render taxonomy tags data along content tags number badge', async () => {
    await act(async () => {
      const { container, getByText } = render(<ContentTagsCollapsibleComponent taxonomyAndTagsData={data} />);
      expect(getByText('Taxonomy 1')).toBeInTheDocument();
      expect(container.getElementsByClassName('badge').length).toBe(1);
      expect(getByText('2')).toBeInTheDocument();
    });
  });

  it('should render taxonomy tags data without tags number badge', async () => {
    data.contentTags = [];
    await act(async () => {
      const { container, getByText } = render(<ContentTagsCollapsibleComponent taxonomyAndTagsData={data} />);
      expect(getByText('Taxonomy 1')).toBeInTheDocument();
      expect(container.getElementsByClassName('invisible').length).toBe(1);
    });
  });
});
