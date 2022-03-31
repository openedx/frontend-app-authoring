import React from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { render, screen } from '@testing-library/react';
import EditorContainer from './EditorContainer';

jest.mock('@edx/frontend-platform/analytics');

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
    sendTrackEvent.mockClear();
    render(<EditorContainer
      courseId="demoXDemocourse"
    />);
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Add To Course')).toBeTruthy();
    expect(screen.findByRole(mockRole)).toBeTruthy();
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.authoring.editor.enter', {
      courserun_key: 'demoXDemocourse',
      block_type: 'html',
      block_id: 'company-id1',
    });
  });
});
