import userEvent from '@testing-library/user-event';

import {
  initializeMocks, render as baseRender, screen, waitFor,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { mockContentLibrary, mockGetContainerChildren } from '../data/api.mocks';
import { type ContainerHit, PublishStatus } from '../../search-manager';
import ContainerCard from './ContainerCard';

const containerHitSample: ContainerHit = {
  id: 'lctorg1democourse-unit-display-name-123',
  type: 'library_container',
  contextKey: 'lb:org1:Demo_Course',
  usageKey: 'lct:org1:Demo_Course:unit:unit-display-name-123',
  org: 'org1',
  blockId: 'unit-display-name-123',
  blockType: 'unit',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Unit Display Name',
  formatted: {
    displayName: 'Unit Display Formated Name',
    published: {
      displayName: 'Published Unit Display Name',
    },
  },
  created: 1722434322294,
  modified: 1722434322294,
  numChildren: 2,
  published: {
    numChildren: 1,
  },
  tags: {},
  publishStatus: PublishStatus.Published,
};

mockContentLibrary.applyMock();
mockGetContainerChildren.applyMock();

const render = (ui: React.ReactElement, showOnlyPublished: boolean = false) => baseRender(ui, {
  extraWrapper: ({ children }) => (
    <LibraryProvider
      libraryId="lib:Axim:TEST"
      showOnlyPublished={showOnlyPublished}
    >
      {children}
    </LibraryProvider>
  ),
});

describe('<ContainerCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the card with title', () => {
    render(<ContainerCard hit={containerHitSample} />);

    expect(screen.queryByText('Unit Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('2')).toBeInTheDocument(); // Component count
  });

  it('should render published content', () => {
    render(<ContainerCard hit={containerHitSample} />, true);

    expect(screen.queryByText('Published Unit Display Name')).toBeInTheDocument();
    expect(screen.queryByText('1')).toBeInTheDocument(); // Published Component Count
  });

  it('should navigate to the container if the open menu clicked', async () => {
    render(<ContainerCard hit={containerHitSample} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

    // Open menu item
    const openMenuItem = screen.getByRole('link', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();

    // TODO: To be implemented
    // expect(openMenuItem).toHaveAttribute(
    //   'href',
    //   '/library/lb:org1:Demo_Course/container/container-display-name-123',
    // );
  });

  it('should render no child blocks in card preview', async () => {
    render(<ContainerCard hit={containerHitSample} />);

    expect(screen.queryByTitle('text block')).not.toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('should render <=5 child blocks in card preview', async () => {
    const containerWith5Children = {
      ...containerHitSample,
      usageKey: mockGetContainerChildren.fiveChildren,
    };
    render(<ContainerCard hit={containerWith5Children} />);

    await waitFor(() => {
      expect(screen.getAllByTitle('text block').length).toBe(5);
    });
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('should render >5 child blocks with +N in card preview', async () => {
    const containerWith6Children = {
      ...containerHitSample,
      usageKey: mockGetContainerChildren.sixChildren,
    };
    render(<ContainerCard hit={containerWith6Children} />);

    await waitFor(() => {
      expect(screen.getAllByTitle('text block').length).toBe(4);
    });
    expect(screen.queryByText('+2')).toBeInTheDocument();
  });
});
