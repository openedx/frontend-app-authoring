import { initializeMocks, render, screen } from '@src/testUtils';
import GroupConnector from './GroupConnector';

describe('<GroupConnector />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders \'And\' as plain text with no control for an and operator', () => {
    render(<GroupConnector logicOperator="and" />);
    expect(screen.getByText('And')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders \'Or\' as plain text for an or operator', () => {
    render(<GroupConnector logicOperator="or" />);
    expect(screen.getByText('Or')).toBeInTheDocument();
  });
});
