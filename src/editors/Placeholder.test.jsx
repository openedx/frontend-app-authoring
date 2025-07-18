import React from 'react';
import { render, initializeMocks, screen } from '@src/testUtils';

import Placeholder from './Placeholder';

describe('<Placeholder />', () => {
  beforeEach(() => initializeMocks());
  it('renders correctly', () => {
    render(<Placeholder />);
    expect(screen.getByText(/Under Construction/)).toBeInTheDocument();
  });
});
