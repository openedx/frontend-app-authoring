import React from 'react';
import { render, screen } from '@testing-library/react';
import EditorPage from './EditorPage';

test('rendering correctly with expected Input', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const blockType = 'html';
  const blockId = 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4';
  const studioEndpointUrl = 'fakeurl.com';
  render(<EditorPage
    courseId={courseId}
    blockType={blockType}
    blockId={blockId}
    studioEndpointUrl={studioEndpointUrl}
  />);
  expect(screen.getByText('Text')).toBeTruthy();
  expect(screen.getByText('Cancel')).toBeTruthy();
  expect(screen.getAllByLabelText('Close')).toBeTruthy();
  expect(screen.getByText('Add To Course')).toBeTruthy();
  expect(screen.getByText('Error: Could Not Load Text Content')).toBeTruthy();
});

test('rendering correctly with expected Error', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const blockType = 'Smelly Garbage Xblock';
  const blockId = 'BadGarbadioU@Garbagefha4521ea ';
  const studioEndpointUrl = 'fakeurl.com';
  render(<EditorPage
    courseId={courseId}
    blockType={blockType}
    blockId={blockId}
    studioEndpointUrl={studioEndpointUrl}
  />);
  expect(screen.getByText(blockType)).toBeTruthy();
  expect(screen.getByText('Cancel')).toBeTruthy();
  expect(screen.getAllByLabelText('Close')).toBeTruthy();
  expect(screen.getByText('Add To Course')).toBeTruthy();
  expect(screen.getByText('Error: Could Not find Editor')).toBeTruthy();
});
