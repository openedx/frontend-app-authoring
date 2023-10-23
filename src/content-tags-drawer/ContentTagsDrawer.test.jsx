import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render, fireEvent } from '@testing-library/react';

import ContentTagsDrawer from './ContentTagsDrawer';
import {
  useContentTaxonomyTagsDataResponse,
  useIsContentTaxonomyTagsDataLoaded,
  useContentDataResponse,
  useIsContentDataLoaded,
} from './data/apiHooks';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from '../taxonomy/data/apiHooks';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    contentId: 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@7f47fe2dbcaf47c5a071671c741fe1ab',
  }),
}));

jest.mock('./data/apiHooks', () => ({
  useContentTaxonomyTagsDataResponse: jest.fn(),
  useIsContentTaxonomyTagsDataLoaded: jest.fn(),
  useContentDataResponse: jest.fn(),
  useIsContentDataLoaded: jest.fn(),
  useTaxonomyTagsDataResponse: jest.fn(),
  useIsTaxonomyTagsDataLoaded: jest.fn(),
}));

jest.mock('../taxonomy/data/apiHooks', () => ({
  useTaxonomyListDataResponse: jest.fn(),
  useIsTaxonomyListDataLoaded: jest.fn(),
}));

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsDrawer />
  </IntlProvider>
);

describe('<ContentTagsDrawer />', () => {
  it('should render page and page title correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Manage tags')).toBeInTheDocument();
  });

  it('shows spinner before the content data query is complete', async () => {
    useIsContentDataLoaded.mockReturnValue(false);
    await act(async () => {
      const { getAllByRole } = render(<RootWrapper />);
      const spinner = getAllByRole('status')[0];
      expect(spinner.textContent).toEqual('Loading'); // Uses <Spinner />
    });
  });

  it('shows spinner before the taxonomy tags query is complete', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(false);
    useIsContentTaxonomyTagsDataLoaded.mockReturnValue(false);
    await act(async () => {
      const { getAllByRole } = render(<RootWrapper />);
      const spinner = getAllByRole('status')[1];
      expect(spinner.textContent).toEqual('Loading...'); // Uses <Loading />
    });
  });

  it('shows the content display name after the query is complete', async () => {
    useIsContentDataLoaded.mockReturnValue(true);
    useContentDataResponse.mockReturnValue({
      displayName: 'Unit 1',
    });
    await act(async () => {
      const { getByText } = render(<RootWrapper />);
      expect(getByText('Unit 1')).toBeInTheDocument();
    });
  });

  it('shows the taxonomies data including tag numbers after the query is complete', async () => {
    useIsTaxonomyListDataLoaded.mockReturnValue(true);
    useIsContentTaxonomyTagsDataLoaded.mockReturnValue(true);
    useContentTaxonomyTagsDataResponse.mockReturnValue({
      taxonomies: [
        {
          name: 'Taxonomy 1',
          taxonomyId: 123,
          editable: true,
          tags: [
            {
              value: 'Tag 1',
              lineage: ['Tag 1'],
            },
            {
              value: 'Tag 2',
              lineage: ['Tag 2'],
            },
          ],
        },
        {
          name: 'Taxonomy 2',
          taxonomyId: 124,
          editable: true,
          tags: [
            {
              value: 'Tag 3',
              lineage: ['Tag 3'],
            },
          ],
        },
      ],
    });
    useTaxonomyListDataResponse.mockReturnValue({
      results: [{
        id: 123,
        name: 'Taxonomy 1',
        description: 'This is a description 1',
      }, {
        id: 124,
        name: 'Taxonomy 2',
        description: 'This is a description 2',
      }],
    });
    await act(async () => {
      const { container, getByText } = render(<RootWrapper />);
      expect(getByText('Taxonomy 1')).toBeInTheDocument();
      expect(getByText('Taxonomy 2')).toBeInTheDocument();
      const tagCountBadges = container.getElementsByClassName('badge');
      expect(tagCountBadges[0].textContent).toBe('2');
      expect(tagCountBadges[1].textContent).toBe('1');
    });
  });

  it('should call closeContentTagsDrawer when CloseButton is clicked', async () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    const { getByTestId } = render(<RootWrapper />);

    // Find the CloseButton element by its test ID and trigger a click event
    const closeButton = getByTestId('drawer-close-button');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(postMessageSpy).toHaveBeenCalledWith('closeManageTagsDrawer', '*');

    postMessageSpy.mockRestore();
  });

  it('should call closeContentTagsDrawer when Escape key is pressed and no selectable box is active', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    const { container } = render(<RootWrapper />);

    act(() => {
      fireEvent.keyDown(container, {
        key: 'Escape',
      });
    });

    expect(postMessageSpy).toHaveBeenCalledWith('closeManageTagsDrawer', '*');

    postMessageSpy.mockRestore();
  });

  it('should not call closeContentTagsDrawer when Escape key is pressed and a selectable box is active', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    const { container } = render(<RootWrapper />);

    // Simulate that the selectable box is open by adding an element with the data attribute
    const selectableBox = document.createElement('div');
    selectableBox.setAttribute('data-selectable-box', 'taxonomy-tags');
    document.body.appendChild(selectableBox);

    act(() => {
      fireEvent.keyDown(container, {
        key: 'Escape',
      });
    });

    expect(postMessageSpy).not.toHaveBeenCalled();

    // Remove the added element
    document.body.removeChild(selectableBox);

    postMessageSpy.mockRestore();
  });
});
