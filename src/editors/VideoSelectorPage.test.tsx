import React from 'react';
import { render, screen, initializeMocks } from '../testUtils';
import VideoSelectorPage from './VideoSelectorPage';

const props = {
  blockId: 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};

describe('Video Selector Page', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('rendering correctly with expected Input', () => {
    render(<VideoSelectorPage {...props} />);
    expect(screen.getByText('Add video to your course')).toBeInTheDocument();
  });

  test('rendering with props to null', () => {
    const errorMessage = 'An unexpected error occurred. Please click the button below to refresh the page.';
    render(<VideoSelectorPage />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
