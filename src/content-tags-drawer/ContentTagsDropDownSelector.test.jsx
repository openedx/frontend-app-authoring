import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render } from '@testing-library/react';
import PropTypes from 'prop-types';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';
import { useTaxonomyTagsDataResponse, useIsTaxonomyTagsDataLoaded } from './data/apiHooks';

jest.mock('./data/apiHooks', () => ({
  useTaxonomyTagsDataResponse: jest.fn(),
  useIsTaxonomyTagsDataLoaded: jest.fn(),
}));

const data = {
  taxonomyId: 123,
  level: 0,
};

const TaxonomyTagsDropDownSelectorComponent = ({
  taxonomyId, level, subTagsUrl,
}) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsDropDownSelector
      taxonomyId={taxonomyId}
      level={level}
      subTagsUrl={subTagsUrl}
    />
  </IntlProvider>
);

TaxonomyTagsDropDownSelectorComponent.defaultProps = {
  subTagsUrl: undefined,
};

TaxonomyTagsDropDownSelectorComponent.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  subTagsUrl: PropTypes.string,
};

describe('<ContentTagsDropDownSelector />', () => {
  it('should render taxonomy tags drop down selector loading with spinner', async () => {
    useIsTaxonomyTagsDataLoaded.mockReturnValue(false);
    await act(async () => {
      const { getByRole } = render(
        <TaxonomyTagsDropDownSelectorComponent
          taxonomyId={data.taxonomyId}
          level={data.level}
        />,
      );
      const spinner = getByRole('status');
      expect(spinner.textContent).toEqual('Loading tags'); // Uses <Spinner />
    });
  });

  it('should render taxonomy tags drop down selector with no sub tags', async () => {
    useIsTaxonomyTagsDataLoaded.mockReturnValue(true);
    useTaxonomyTagsDataResponse.mockReturnValue({
      results: [{
        value: 'Tag 1',
        subTagsUrl: null,
      }],
    });
    await act(async () => {
      const { container, getByText } = render(
        <TaxonomyTagsDropDownSelectorComponent
          key={`selector-${data.taxonomyId}`}
          taxonomyId={data.taxonomyId}
          level={data.level}
        />,
      );
      expect(getByText('Tag 1')).toBeInTheDocument();
      expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(0);
    });
  });

  it('should render taxonomy tags drop down selector with sub tags', async () => {
    useIsTaxonomyTagsDataLoaded.mockReturnValue(true);
    useTaxonomyTagsDataResponse.mockReturnValue({
      results: [{
        value: 'Tag 2',
        subTagsUrl: 'https://example.com',
      }],
    });
    await act(async () => {
      const { container, getByText } = render(
        <TaxonomyTagsDropDownSelectorComponent
          taxonomyId={data.taxonomyId}
          level={data.level}
        />,
      );
      expect(getByText('Tag 2')).toBeInTheDocument();
      expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(1);
    });
  });
});
