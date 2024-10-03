import {
  initializeMocks,
  fireEvent,
  render,
  screen,
} from '../../testUtils';

import { type CollectionHit } from '../../search-manager';
import CollectionCard from './CollectionCard';

const CollectionHitSample: CollectionHit = {
  id: '1',
  type: 'collection',
  contextKey: 'lb:org1:Demo_Course',
  usageKey: 'lb:org1:Demo_Course:collection1',
  blockId: 'collection1',
  org: 'org1',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Collection Display Name',
  description: 'Collection description',
  formatted: {
    displayName: 'Collection Display Formated Name',
    description: 'Collection description',
  },
  created: 1722434322294,
  modified: 1722434322294,
  numChildren: 2,
  tags: {},
};

describe('<CollectionCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the card with title and description', () => {
    render(<CollectionCard collectionHit={CollectionHitSample} />);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('Collection description')).toBeInTheDocument();
    expect(screen.queryByText('Collection (2)')).toBeInTheDocument();
  });

  it('should navigate to the collection if the open menu clicked', async () => {
    render(<CollectionCard collectionHit={CollectionHitSample} />);

    // Open menu
    expect(screen.getByTestId('collection-card-menu-toggle')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('collection-card-menu-toggle'));

    // Open menu item
    const openMenuItem = screen.getByRole('link', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();

    expect(openMenuItem).toHaveAttribute('href', '/library/lb:org1:Demo_Course/collection/collection1/');
  });
});
