import { render, screen } from '@testing-library/react';
import ComponentCount from '.';

describe('<ComponentCount>', () => {
  it('should render the component', () => {
    render(<ComponentCount count={17} />);
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('should render the component with zero', () => {
    render(<ComponentCount count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
