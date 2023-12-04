import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { withPath, withNavigate } from '../hoc';
import { ROUTES } from '../../common';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/library/lib-id/blocks/block-id',
  }),
}));

// eslint-disable-next-line react/prop-types
const MockComponent = ({ navigate, path }) => (
  // eslint-disable-next-line react/button-has-type, react/prop-types
  <button data-testid="btn" onClick={() => navigate('/some-route')}>{path}</button>
);
const WrappedComponent = withNavigate(withPath(MockComponent));

test('Provide Navigation to Component', () => {
  render(<WrappedComponent />);
  const btn = screen.getByTestId('btn');
  fireEvent.click(btn);

  expect(mockNavigate).toHaveBeenCalledWith('/some-route');
});

test('Provide Current Path to Component', () => {
  render(<WrappedComponent />);

  expect(screen.getByTestId('btn').textContent).toContain(ROUTES.Block.HOME);
});
