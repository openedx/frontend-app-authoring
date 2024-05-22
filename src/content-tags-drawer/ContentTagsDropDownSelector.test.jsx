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
    tagPages: {
      isLoading: true,
      isError: false,
      data: [],
    },
  })),
}));

const data = {
  taxonomyId: 123,
  level: 0,
  tagsTree: {},
  appliedContentTagsTree: {},
  stagedContentTagsTree: {},
};

const ContentTagsDropDownSelectorComponent = ({
  taxonomyId, level, lineage, tagsTree, searchTerm, appliedContentTagsTree, stagedContentTagsTree,
}) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsDropDownSelector
      taxonomyId={taxonomyId}
      level={level}
      lineage={lineage}
      tagsTree={tagsTree}
      searchTerm={searchTerm}
      appliedContentTagsTree={appliedContentTagsTree}
      stagedContentTagsTree={stagedContentTagsTree}
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

  async function getComponent(updatedData) {
    const componentData = (!updatedData ? data : updatedData);

    return render(
      <ContentTagsDropDownSelectorComponent
        taxonomyId={componentData.taxonomyId}
        level={componentData.level}
        lineage={componentData.lineage}
        tagsTree={componentData.tagsTree}
        searchTerm={componentData.searchTerm}
        appliedContentTagsTree={componentData.appliedContentTagsTree}
        stagedContentTagsTree={componentData.stagedContentTagsTree}
      />,
    );
  }

  it('should render taxonomy tags drop down selector loading with spinner', async () => {
    await act(async () => {
      const { getByRole } = await getComponent();
      const spinner = getByRole('status');
      expect(spinner.textContent).toEqual('Loading tags'); // Uses <Spinner />
    });
  });

  it('should render taxonomy tags drop down selector with no sub tags', async () => {
    useTaxonomyTagsData.mockReturnValue({
      hasMorePages: false,
      tagPages: {
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
      },
    });

    await act(async () => {
      const { container, getByText } = await getComponent();

      await waitFor(() => {
        expect(getByText('Tag 1')).toBeInTheDocument();
        expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(0);
      });
    });
  });

  it('should render taxonomy tags drop down selector with sub tags', async () => {
    useTaxonomyTagsData.mockReturnValue({
      hasMorePages: false,
      tagPages: {
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
      },
    });

    await act(async () => {
      const { container, getByText } = await getComponent();

      await waitFor(() => {
        expect(getByText('Tag 2')).toBeInTheDocument();
        expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(1);
      });
    });
  });

  it('should expand on click taxonomy tags drop down selector with sub tags', async () => {
    useTaxonomyTagsData.mockReturnValueOnce({
      hasMorePages: false,
      tagPages: {
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
      },
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
      const { container, getByText } = await getComponent(dataWithTagsTree);
      await waitFor(() => {
        expect(getByText('Tag 2')).toBeInTheDocument();
        expect(container.getElementsByClassName('taxonomy-tags-arrow-drop-down').length).toBe(1);
      });

      // Mock useTaxonomyTagsData again since it gets called in the recursive call
      useTaxonomyTagsData.mockReturnValueOnce({
        hasMorePages: false,
        tagPages: {
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
        },
      });

      // Expand the dropdown to see the subtags selectors
      const expandToggle = container.querySelector('.taxonomy-tags-arrow-drop-down span');
      fireEvent.click(expandToggle);

      await waitFor(() => {
        expect(getByText('Tag 3')).toBeInTheDocument();
      });
    });
  });

  it('should render taxonomy tags drop down selector and change search term', async () => {
    useTaxonomyTagsData.mockReturnValueOnce({
      hasMorePages: false,
      tagPages: {
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: [{
          value: 'Tag 1',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: null,
        }],
      },
    });

    const initalSearchTerm = 'test 1';
    await act(async () => {
      const { rerender } = await getComponent({ ...data, searchTerm: initalSearchTerm });

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
        appliedContentTagsTree={{}}
        stagedContentTagsTree={{}}
      />);

      await waitFor(() => {
        expect(useTaxonomyTagsData).toBeCalledWith(data.taxonomyId, null, 1, updatedSearchTerm);
      });

      // Clean search term
      const cleanSearchTerm = '';
      rerender(<ContentTagsDropDownSelectorComponent
        key={`selector-${data.taxonomyId}`}
        taxonomyId={data.taxonomyId}
        level={data.level}
        tagsTree={data.tagsTree}
        searchTerm={cleanSearchTerm}
        appliedContentTagsTree={{}}
        stagedContentTagsTree={{}}
      />);

      await waitFor(() => {
        expect(useTaxonomyTagsData).toBeCalledWith(data.taxonomyId, null, 1, cleanSearchTerm);
      });
    });
  });

  it('should render "noTag" message if search doesnt return taxonomies', async () => {
    useTaxonomyTagsData.mockReturnValueOnce({
      hasMorePages: false,
      tagPages: {
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: [],
      },
    });

    const searchTerm = 'uncommon search term';
    await act(async () => {
      const { getByText } = await getComponent({ ...data, searchTerm });

      await waitFor(() => {
        expect(useTaxonomyTagsData).toBeCalledWith(data.taxonomyId, null, 1, searchTerm);
      });

      const message = `No tags found with the search term "${searchTerm}"`;
      expect(getByText(message)).toBeInTheDocument();
    });
  });

  it('should render "noTagsInTaxonomy" message if taxonomy is empty', async () => {
    useTaxonomyTagsData.mockReturnValueOnce({
      hasMorePages: false,
      tagPages: {
        isLoading: false,
        isError: false,
        isSuccess: true,
        data: [],
      },
    });

    const searchTerm = '';
    await act(async () => {
      const { getByText } = await getComponent({ ...data, searchTerm });

      await waitFor(() => {
        expect(useTaxonomyTagsData).toBeCalledWith(data.taxonomyId, null, 1, searchTerm);
      });

      const message = 'No tags in this taxonomy yet';
      expect(getByText(message)).toBeInTheDocument();
    });
  });
});
