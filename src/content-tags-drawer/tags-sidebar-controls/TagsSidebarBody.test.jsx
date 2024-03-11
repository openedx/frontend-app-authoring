import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TagsSidebarBody from './TagsSidebarBody';
import { useContentTaxonomyTagsData } from '../data/apiHooks';
import { contentTaxonomyTagsMock } from '../__mocks__';

const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';

jest.mock('../data/apiHooks', () => ({
  useContentTaxonomyTagsData: jest.fn(() => ({
    isSuccess: false,
    data: {},
  })),
}));
jest.mock('../ContentTagsDrawer', () => jest.fn(() => <div>Mocked ContentTagsDrawer</div>));

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <TagsSidebarBody />
  </IntlProvider>
);

describe('<TagSidebarBody>', () => {
  it('shows spinner before the content data query is complete', () => {
    render(<RootWrapper />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render data after wuery is complete', () => {
    useContentTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: contentTaxonomyTagsMock[contentId],
    });
    render(<RootWrapper />);
    const taxonomyButton = screen.getByRole('button', { name: /hierarchicaltaxonomy/i });
    expect(taxonomyButton).toBeInTheDocument();

    /// ContentTagsDrawer must be closed
    expect(screen.queryByText('Mocked ContentTagsDrawer')).not.toBeInTheDocument();
  });

  it('should open ContentTagsDrawer', () => {
    useContentTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: contentTaxonomyTagsMock[contentId],
    });
    render(<RootWrapper />);

    const manageButton = screen.getByRole('button', { name: /manage tags/i });
    fireEvent.click(manageButton);

    expect(screen.getByText('Mocked ContentTagsDrawer')).toBeInTheDocument();
  });
});
