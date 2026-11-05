import { initializeMocks, render, screen } from '@src/testUtils';
import LogicOperatorSelect from './LogicOperatorSelect';

const labels = { and: 'all', or: 'any' };

describe('<LogicOperatorSelect />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it.each(
    [
      ['AND', 'all'],
      ['OR', 'any'],
    ] as const,
  )('renders the %s label as plain text with no control', (value, label) => {
    render(<LogicOperatorSelect value={value} labels={labels} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
