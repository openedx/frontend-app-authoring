import { initializeMocks, render, screen } from '@src/testUtils';

import ViewOnlyPermissionsAlert from './ViewOnlyPermissionsAlert';

describe('<ViewOnlyPermissionsAlert />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the view-only message', () => {
    render(<ViewOnlyPermissionsAlert />);

    expect(screen.getByTestId('viewOnlyPermissionsAlert')).toBeInTheDocument();
    expect(screen.getByText(
      'You have view-only access to this page. Contact your organization admin to request editing permissions.',
    )).toBeInTheDocument();
  });

  it('renders a lock icon', () => {
    const { container } = render(<ViewOnlyPermissionsAlert />);

    expect(container.querySelector('.alert-icon svg')).toBeInTheDocument();
  });

  it('applies a passed className', () => {
    render(<ViewOnlyPermissionsAlert className="mt-4" />);

    expect(screen.getByTestId('viewOnlyPermissionsAlert')).toHaveClass('mt-4');
  });
});
