import React from 'react';
import { render, screen } from '@testing-library/react';
import EditorContainer from './EditorContainer';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'), // use actual for all non-hook parts
  useParams: () => ({
    blockId: 'company-id1',
    blockType: 'html',
  }),
}));

const mockRole = 'Tiny-MCE-Mock';
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => <div role={mockRole} />
    ,
  };
});

describe('Editor Container', () => {
  it('shows a rich text editor loading with an error', () => {
    render(<EditorContainer
      courseId="demoXDemocourse"
    />);
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Add To Course')).toBeTruthy();
    expect(screen.findByRole(mockRole)).toBeTruthy();
  });
});
