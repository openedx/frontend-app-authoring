import { initializeMocks, render, screen } from '@src/testUtils';
import GroupConnector from './GroupConnector';

describe('<GroupConnector />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders \'And\' as plain text with no control for an AND operator', () => {
    render(<GroupConnector logicOperator="AND" />);
    expect(screen.getByText('And')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders \'Or\' as plain text for an OR operator', () => {
    render(<GroupConnector logicOperator="OR" />);
    expect(screen.getByText('Or')).toBeInTheDocument();
  });
});
