import { render, screen, initializeMocks } from '@src/testUtils';
import CardSection from './CardSection';

describe('CardSection', () => {
  beforeEach(() => initializeMocks());
  test('renders children when open', () => {
    render(<CardSection summary="summary" isCardCollapsibleOpen><h1>Section Text</h1></CardSection>);
    expect(screen.getByText('Section Text')).toBeInTheDocument();
    expect(screen.queryByText('summary')).not.toBeInTheDocument();
  });

  test('renders summary when closed', () => {
    render(<CardSection summary="summary" isCardCollapsibleOpen={false}><h1>Section Text</h1></CardSection>);
    expect(screen.queryByText('Section Text')).not.toBeInTheDocument();
    expect(screen.getByText('summary')).toBeInTheDocument();
  });

  test('renders nothing when closed and not summary', () => {
    const { container } = render(<CardSection isCardCollapsibleOpen={false}><h1>Not showing text</h1></CardSection>);
    expect(screen.queryByText('Not showing text')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });
});
