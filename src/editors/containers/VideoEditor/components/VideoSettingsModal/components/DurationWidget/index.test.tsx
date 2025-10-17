import React from 'react';
import { screen } from '@testing-library/react';
import { initializeMocks } from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';

import DurationWidget from '.'; // default export now uses hooks

jest.mock('./hooks', () => ({
  durationWidget: jest.fn(() => ({
    unsavedDuration: { startTime: '00:00', stopTime: '00:10' },
    onBlur: jest.fn(() => () => {}),
    onChange: jest.fn(() => () => {}),
    onKeyDown: jest.fn(() => () => {}),
    getTotalLabel: jest.fn(() => 'Duration: 10 seconds'),
  })),
}));

describe('DurationWidget', () => {
  const initialState: PartialEditorState = {
    video: {
      duration: {
        startTime: '0',
        stopTime: '10',
      },
    },
    app: {
    },
  };
  beforeEach(() => initializeMocks());

  test('renders as expected with default state', () => {
    editorRender(<DurationWidget />, {
      initialState,
    });

    expect(
      screen.getByText('Set a specific section of the video to play.'),
    ).toBeInTheDocument();

    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Duration: 10 seconds')).toBeInTheDocument();
  });
});
