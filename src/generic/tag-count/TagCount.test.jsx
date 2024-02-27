import React from 'react';
import { render, screen } from '@testing-library/react';
import TagCount from '.';

describe('<TagCount>', () => {
  it('should render the component', () => {
    const count = 17;
    render(<TagCount count={count} />);
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('should render the component with zero', () => {
    const count = 0;
    render(<TagCount count={count} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
