import React from 'react';
import { render, screen } from '@testing-library/react';
import ProblemEditor from './ProblemEditor';

test('Videoeditor: Basic Render', () => {
  render(<ProblemEditor />);
  expect(screen.findByText('Problem')).toBeTruthy();
});
