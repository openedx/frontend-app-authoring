import React from 'react';
import { render, screen } from '@testing-library/react';
import TagCount from '.';

describe('<TagCount>', () => {
  it('should render the component', () => {
    render(<TagCount count={17} />);
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('should render the component with zero', () => {
    render(<TagCount count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render a button with onClick', () => {
    render(<TagCount count={17} onClick={() => {}} />);
    expect(screen.getByRole('button', {
      name: /17/i,
    }));
  });
});
