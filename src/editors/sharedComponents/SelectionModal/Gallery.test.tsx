import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { render, screen, initializeMocks } from '../../../testUtils';
import Gallery from './Gallery';

const intlWrapper = (ui) => (
  <IntlProvider locale="en" messages={{}}>
    {ui}
  </IntlProvider>
);

const baseProps = {
  galleryIsEmpty: false,
  searchIsEmpty: false,
  displayList: [{ id: 1 }, { id: 2 }],
  highlighted: '1',
  onHighlightChange: jest.fn(),
  emptyGalleryLabel: { id: 'emptyGalleryMsg', defaultMessage: 'Empty Gallery' },
  isLoaded: true,
  isLibrary: false,
  showIdsOnCards: false,
  height: '375px',
  thumbnailFallback: <span>fallback</span>,
  allowLazyLoad: false,
  fetchNextPage: jest.fn(),
  assetCount: 2,
};

jest.mock('../SelectableBox', () => {
  const Set = (props: { children: React.ReactNode }) => <div data-mock="SelectableBox.Set">{props?.children}</div>;
  return { Set };
});

jest.mock('./GalleryCard', () => function mockGalleryCard(props) {
  return <div data-mock="GalleryCard">GalleryCard {props?.asset?.id}</div>;
});

jest.mock('./GalleryLoadMoreButton', () => function mockGalleryLoadMoreButton(props) {
  return <button type="button" data-mock="GalleryLoadMoreButton" onClick={props.fetchNextPage}>Load More</button>;
});

describe('Gallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMocks();
  });

  it('renders spinner when not loaded and allowLazyLoad is false', () => {
    render(intlWrapper(<Gallery {...baseProps} isLoaded={false} allowLazyLoad={false} />));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders empty gallery message when galleryIsEmpty is true', () => {
    render(intlWrapper(<Gallery {...baseProps} galleryIsEmpty />));
    expect(screen.getByText('Empty Gallery')).toBeInTheDocument();
  });

  it('renders empty search message when searchIsEmpty is true', () => {
    render(intlWrapper(<Gallery {...baseProps} searchIsEmpty />));
    expect(screen.getByText('No search results.')).toBeInTheDocument();
  });

  it('renders gallery with SelectableBox.Set and GalleryCard for each asset', () => {
    render(intlWrapper(<Gallery {...baseProps} />));
    expect(screen.getByText('GalleryCard 1')).toBeInTheDocument();
    expect(screen.getByText('GalleryCard 2')).toBeInTheDocument();
    expect(screen.getByText('GalleryCard 1').closest('[data-mock="GalleryCard"]')).toBeInTheDocument();
    expect(screen.getByText('GalleryCard 2').closest('[data-mock="GalleryCard"]')).toBeInTheDocument();
    expect(screen.getByText('GalleryCard 1').parentElement).toBeInTheDocument();
  });

  it('renders GalleryLoadMoreButton when allowLazyLoad is true and isLibrary is false', () => {
    render(intlWrapper(<Gallery {...baseProps} allowLazyLoad isLibrary={false} />));
    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
  });

  it('does not render GalleryLoadMoreButton when isLibrary is true', () => {
    render(intlWrapper(<Gallery {...baseProps} allowLazyLoad isLibrary />));
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });

  it('uses default props when not provided', () => {
    const minimalProps = {
      galleryIsEmpty: false,
      searchIsEmpty: false,
      displayList: [{ id: 1 }],
      onHighlightChange: jest.fn(),
      emptyGalleryLabel: { id: 'emptyGalleryMsg', defaultMessage: 'Empty Gallery' },
      isLoaded: true,
    };
    render(intlWrapper(<Gallery {...minimalProps} />));
    expect(screen.getByText('GalleryCard 1')).toBeInTheDocument();
  });

  it('GalleryLoadMoreButton receives correct props', () => {
    render(intlWrapper(<Gallery {...baseProps} allowLazyLoad isLibrary={false} assetCount={5} />));
    const btn = screen.getByRole('button', { name: /load more/i });
    userEvent.click(btn);
    expect(baseProps.fetchNextPage).toHaveBeenCalled();
  });
});
