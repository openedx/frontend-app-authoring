import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';
import { useTaxonomyTagsData } from './data/apiHooks';

jest.mock('./data/apiHooks', () => ({
  useTaxonomyTagsData: jest.fn(() => ({
    isSuccess: false,
    data: {},
  })),
}));

const data = {
  taxonomyId: 123,
  level: 0,
  tagsTree: {},
};

const ContentTagsDropDownSelectorComponent = ({
  taxonomyId, level, subTagsUrl, lineage, tagsTree,
}) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsDropDownSelector
      taxonomyId={taxonomyId}
      level={level}
      subTagsUrl={subTagsUrl}
      lineage={lineage}
      tagsTree={tagsTree}
    />
  </IntlProvider>
);

ContentTagsDropDownSelectorComponent.defaultProps = {
  subTagsUrl: undefined,
  lineage: [],
};

ContentTagsDropDownSelectorComponent.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  subTagsUrl: PropTypes.string,
  lineage: PropTypes.arrayOf(PropTypes.string),
  tagsTree: PropTypes.objectOf(
    PropTypes.shape({
      explicit: PropTypes.bool.isRequired,
      children: PropTypes.shape({}).isRequired,
    }).isRequired,
  ).isRequired,
};

describe('<ContentTagsDropDownSelector />', () => {
  it('should render taxonomy tags drop down selector loading with spinner', async () => {
    await act(async () => {
      const { getByRole } = render(
        <ContentTagsDropDownSelectorComponent
          taxonomyId={data.taxonomyId}
          level={data.level}
          tagsTree={data.tagsTree}
        />,
      );
      const spinner = getByRole('status');
      expect(spinner.textContent).toEqual('Loading tags'); // Uses <Spinner />
    });
  });

  it('should render taxonomy tags drop down selector with no sub tags', async () => {
    useTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: {
        results: [{
          value: 'Tag 1',
          subTagsUrl: null,
        }],
      },
    });
    await act(async () => {
      const { container, getByText } = render(
        <ContentTagsDropDownSelectorComponent
          key={`selector-${data.taxonomyId}`}
          taxonomyId={data.taxonomyId}
          level={data.level}
          tagsTree={data.tagsTree}
        />,
      );
      await waitFor(() => {
        expect(getByText('Tag 1')).toBeInTheDocument();
        expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(0);
      });
    });
  });

  it('should render taxonomy tags drop down selector with sub tags', async () => {
    useTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: {
        results: [{
          value: 'Tag 2',
          subTagsUrl: 'https://example.com',
        }],
      },
    });
    await act(async () => {
      const { container, getByText } = render(
        <ContentTagsDropDownSelectorComponent
          taxonomyId={data.taxonomyId}
          level={data.level}
          tagsTree={data.tagsTree}
        />,
      );
      await waitFor(() => {
        expect(getByText('Tag 2')).toBeInTheDocument();
        expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(1);
      });
    });
  });
});
