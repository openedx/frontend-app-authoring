import { initializeMocks, render, screen } from '../../testUtils';

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
});
