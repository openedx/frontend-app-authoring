import { initializeMocks, render, screen } from '../../testUtils';

import { type CollectionHit } from '../../search-manager';
import CollectionCard from './CollectionCard';

const CollectionHitSample: CollectionHit = {
  id: '1',
  type: 'collection',
  contextKey: 'lb:org1:Demo_Course',
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

    expect(screen.getByText('Collection Display Formated Name')).toBeInTheDocument();
    expect(screen.getByText('Collection description')).toBeInTheDocument();
  });
});
