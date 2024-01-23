import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  act,
  render,
  waitFor,
  fireEvent,
} from '@testing-library/react';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';
import { useTaxonomyTagsData } from './data/apiHooks';

jest.mock('./data/apiHooks', () => ({
  useTaxonomyTagsData: jest.fn(() => ({
    hasMorePages: false,
    tagPages: [{
      isLoading: true,
      isError: false,
      data: [],
    }],
  })),
}));

const data = {
  taxonomyId: 123,
  level: 0,
  tagsTree: {},
};

const ContentTagsDropDownSelectorComponent = ({
  taxonomyId, level, lineage, tagsTree, searchTerm,
}) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsDropDownSelector
      taxonomyId={taxonomyId}
      level={level}
      lineage={lineage}
      tagsTree={tagsTree}
      searchTerm={searchTerm}
    />
  </IntlProvider>
);

ContentTagsDropDownSelectorComponent.defaultProps = {
  lineage: [],
  searchTerm: '',
};

ContentTagsDropDownSelectorComponent.propTypes = ContentTagsDropDownSelector.propTypes;

describe('<ContentTagsDropDownSelector />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
      hasMorePages: false,
      tagPages: [{
        isLoading: false,
        isError: false,
        data: [{
          value: 'Tag 1',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: null,
        }],
      }],
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
      hasMorePages: false,
      tagPages: [{
        isLoading: false,
        isError: false,
        data: [{
          value: 'Tag 2',
          externalId: null,
          childCount: 1,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: 'http://localhost:18010/api/content_tagging/v1/taxonomies/4/tags/?parent_tag=Tag%202',
        }],
      }],
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

  it('should expand on click taxonomy tags drop down selector with sub tags', async () => {
    useTaxonomyTagsData.mockReturnValueOnce({
      hasMorePages: false,
      tagPages: [{
        isLoading: false,
        isError: false,
        data: [{
          value: 'Tag 2',
          externalId: null,
          childCount: 1,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: 'http://localhost:18010/api/content_tagging/v1/taxonomies/4/tags/?parent_tag=Tag%202',
        }],
      }],
    });

    await act(async () => {
      const dataWithTagsTree = {
        ...data,
        tagsTree: {
          'Tag 3': {
            explicit: false,
            children: {},
          },
        },
      };
      const { container, getByText } = render(
        <ContentTagsDropDownSelectorComponent
          taxonomyId={dataWithTagsTree.taxonomyId}
          level={dataWithTagsTree.level}
          tagsTree={dataWithTagsTree.tagsTree}
        />,
      );
      await waitFor(() => {
        expect(getByText('Tag 2')).toBeInTheDocument();
        expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(1);
      });

      // Mock useTaxonomyTagsData again since it gets called in the recursive call
      useTaxonomyTagsData.mockReturnValueOnce({
        hasMorePages: false,
        tagPages: [{
          isLoading: false,
          isError: false,
          data: [{
            value: 'Tag 3',
            externalId: null,
            childCount: 0,
            depth: 1,
            parentValue: 'Tag 2',
            id: 12346,
            subTagsUrl: null,
          }],
        }],
      });

      // Expand the dropdown to see the subtags selectors
      const expandToggle = container.querySelector('.taxonomy-tags-arrow-drop-down span');
      fireEvent.click(expandToggle);

      await waitFor(() => {
        expect(getByText('Tag 3')).toBeInTheDocument();
      });
    });
  });

  it('should expand on enter key taxonomy tags drop down selector with sub tags', async () => {
    useTaxonomyTagsData.mockReturnValueOnce({
      hasMorePages: false,
      tagPages: [{
        isLoading: false,
        isError: false,
        data: [{
          value: 'Tag 2',
          externalId: null,
          childCount: 1,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: 'http://localhost:18010/api/content_tagging/v1/taxonomies/4/tags/?parent_tag=Tag%202',
        }],
      }],
    });

    await act(async () => {
      const dataWithTagsTree = {
        ...data,
        tagsTree: {
          'Tag 3': {
            explicit: false,
            children: {},
          },
        },
      };
      const { container, getByText } = render(
        <ContentTagsDropDownSelectorComponent
          taxonomyId={dataWithTagsTree.taxonomyId}
          level={dataWithTagsTree.level}
          tagsTree={dataWithTagsTree.tagsTree}
        />,
      );
      await waitFor(() => {
        expect(getByText('Tag 2')).toBeInTheDocument();
        expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(1);
      });

      // Mock useTaxonomyTagsData again since it gets called in the recursive call
      useTaxonomyTagsData.mockReturnValueOnce({
        hasMorePages: false,
        tagPages: [{
          isLoading: false,
          isError: false,
          data: [{
            value: 'Tag 3',
            externalId: null,
            childCount: 0,
            depth: 1,
            parentValue: 'Tag 2',
            id: 12346,
            subTagsUrl: null,
          }],
        }],
      });

      // Expand the dropdown to see the subtags selectors
      const expandToggle = container.querySelector('.taxonomy-tags-arrow-drop-down span');
      fireEvent.keyPress(expandToggle, { key: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(getByText('Tag 3')).toBeInTheDocument();
      });
    });
  });

  it('should render taxonomy tags drop down selector and change search term', async () => {
    useTaxonomyTagsData.mockReturnValueOnce({
      hasMorePages: false,
      tagPages: [{
        isLoading: false,
        isError: false,
        data: [{
          value: 'Tag 1',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: null,
        }],
      }],
    });

    const initalSearchTerm = 'test 1';
    await act(async () => {
      const { rerender } = render(
        <ContentTagsDropDownSelectorComponent
          key={`selector-${data.taxonomyId}`}
          taxonomyId={data.taxonomyId}
          level={data.level}
          tagsTree={data.tagsTree}
          searchTerm={initalSearchTerm}
        />,
      );

      await waitFor(() => {
        expect(useTaxonomyTagsData).toBeCalledWith(data.taxonomyId, null, 1, initalSearchTerm);
      });

      const updatedSearchTerm = 'test 2';
      rerender(<ContentTagsDropDownSelectorComponent
        key={`selector-${data.taxonomyId}`}
        taxonomyId={data.taxonomyId}
        level={data.level}
        tagsTree={data.tagsTree}
        searchTerm={updatedSearchTerm}
      />);

      await waitFor(() => {
        expect(useTaxonomyTagsData).toBeCalledWith(data.taxonomyId, null, 1, updatedSearchTerm);
      });
    });
  });
});
