import { render, screen, initializeMocks } from '@src/testUtils';
import Button from '.';

describe('Button', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders with its default variant and no text/children/className', () => {
    render(<Button />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('shared-button');
    expect(button).toHaveTextContent('');
  });

  it('prefers children over text when both are given', () => {
    render(
      <Button text="fallback text">
        <span>actual child</span>
      </Button>,
    );
    expect(screen.getByText('actual child')).toBeInTheDocument();
    expect(screen.queryByText('fallback text')).not.toBeInTheDocument();
  });
});
