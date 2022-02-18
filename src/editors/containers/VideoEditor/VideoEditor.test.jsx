import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoEditor from './VideoEditor';

test('Videoeditor: Basic Render', () => {
  render(<VideoEditor />);
  expect(screen.findByText('Video')).toBeTruthy();
});
