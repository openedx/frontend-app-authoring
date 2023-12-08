import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  act,
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import PropTypes from 'prop-types';

import ContentTagsCollapsible from './ContentTagsCollapsible';
import messages from './messages';
import { useTaxonomyTagsData } from './data/apiHooks';

jest.mock('./data/apiHooks', () => ({
  useContentTaxonomyTagsUpdater: jest.fn(() => ({
    isError: false,
    mutate: jest.fn(),
  })),
  useTaxonomyTagsData: jest.fn(() => ({
    isSuccess: false,
    data: {},
  })),
}));

const data = {
  contentId: 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@7f47fe2dbcaf47c5a071671c741fe1ab',
  taxonomyAndTagsData: {
    id: 123,
    name: 'Taxonomy 1',
    contentTags: [
      {
        value: 'Tag 1',
        lineage: ['Tag 1'],
      },
      {
        value: 'Tag 1.1',
        lineage: ['Tag 1', 'Tag 1.1'],
      },
      {
        value: 'Tag 2',
        lineage: ['Tag 2'],
      },
    ],
  },
  editable: true,
};

const ContentTagsCollapsibleComponent = ({ contentId, taxonomyAndTagsData, editable }) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsCollapsible contentId={contentId} taxonomyAndTagsData={taxonomyAndTagsData} editable={editable} />
  </IntlProvider>
);

ContentTagsCollapsibleComponent.propTypes = {
  contentId: PropTypes.string.isRequired,
  taxonomyAndTagsData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    contentTags: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      lineage: PropTypes.arrayOf(PropTypes.string),
    })),
  }).isRequired,
  editable: PropTypes.bool.isRequired,
};

describe('<ContentTagsCollapsible />', () => {
  it('should render taxonomy tags data along content tags number badge', async () => {
    await act(async () => {
      const { container, getByText } = render(
        <ContentTagsCollapsibleComponent
          contentId={data.contentId}
          taxonomyAndTagsData={data.taxonomyAndTagsData}
          editable={data.editable}
        />,
      );
      expect(getByText('Taxonomy 1')).toBeInTheDocument();
      expect(container.getElementsByClassName('badge').length).toBe(1);
      expect(getByText('3')).toBeInTheDocument();
    });
  });

  it('should render new tags as they are checked in the dropdown', async () => {
    useTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: {
        results: [{
          value: 'Tag 1',
          subTagsUrl: null,
        }, {
          value: 'Tag 2',
          subTagsUrl: null,
        }, {
          value: 'Tag 3',
          subTagsUrl: null,
        }],
      },
    });

    await act(async () => {
      const { container, getByText, getAllByText } = render(
        <ContentTagsCollapsibleComponent
          contentId={data.contentId}
          taxonomyAndTagsData={data.taxonomyAndTagsData}
          editable={data.editable}
        />,
      );

      // Expand the Taxonomy to view applied tags and "Add tags" button
      const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];
      await act(async () => {
        fireEvent.click(expandToggle);
      });

      // Click on "Add tags" button to open dropdown to select new tags
      const addTagsButton = getByText(messages.addTagsButtonText.defaultMessage);
      await act(async () => {
        fireEvent.click(addTagsButton);
      });

      // Wait for the dropdown selector for tags to open,
      // Tag 3 should only appear there
      await waitFor(() => {
        expect(getByText('Tag 3')).toBeInTheDocument();
        expect(getAllByText('Tag 3').length === 1);
      });

      const tag3 = getByText('Tag 3');
      await act(async () => {
        fireEvent.click(tag3);
      });

      // After clicking on Tag 3, it should also appear in amongst
      // the tag bubbles in the tree
      await waitFor(() => {
        expect(getAllByText('Tag 3').length === 2);
      });
    });
  });

  it('should remove tag when they are unchecked in the dropdown', async () => {
    useTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: {
        results: [{
          value: 'Tag 1',
          subTagsUrl: null,
        }, {
          value: 'Tag 2',
          subTagsUrl: null,
        }, {
          value: 'Tag 3',
          subTagsUrl: null,
        }],
      },
    });

    await act(async () => {
      const { container, getByText, getAllByText } = render(
        <ContentTagsCollapsibleComponent
          contentId={data.contentId}
          taxonomyAndTagsData={data.taxonomyAndTagsData}
          editable={data.editable}
        />,
      );

      // Expand the Taxonomy to view applied tags and "Add tags" button
      const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];
      await act(async () => {
        fireEvent.click(expandToggle);
      });

      // Check that Tag 2 appears in tag bubbles
      await waitFor(() => {
        expect(getByText('Tag 2')).toBeInTheDocument();
      });

      // Click on "Add tags" button to open dropdown to select new tags
      const addTagsButton = getByText(messages.addTagsButtonText.defaultMessage);
      await act(async () => {
        fireEvent.click(addTagsButton);
      });

      // Wait for the dropdown selector for tags to open,
      // Tag 3 should only appear there, (i.e. the dropdown is open, since Tag 3 is not applied)
      await waitFor(() => {
        expect(getByText('Tag 3')).toBeInTheDocument();
      });

      // Get the Tag 2 checkbox and click on it
      const tag2 = getAllByText('Tag 2')[1];
      await act(async () => {
        fireEvent.click(tag2);
      });

      // After clicking on Tag 2, it should be removed from
      // the tag bubbles in so only the one in the dropdown appears
      expect(getAllByText('Tag 2').length === 1);
    });
  });

  it('should render taxonomy tags data without tags number badge', async () => {
    const updatedData = { ...data };
    updatedData.taxonomyAndTagsData.contentTags = [];
    await act(async () => {
      const { container, getByText } = render(
        <ContentTagsCollapsibleComponent
          contentId={updatedData.contentId}
          taxonomyAndTagsData={updatedData.taxonomyAndTagsData}
          editable={updatedData.editable}
        />,
      );
      expect(getByText('Taxonomy 1')).toBeInTheDocument();
      expect(container.getElementsByClassName('invisible').length).toBe(1);
    });
  });
});
