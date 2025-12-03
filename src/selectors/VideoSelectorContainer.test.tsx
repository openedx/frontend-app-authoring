import React from 'react';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { render, initializeMocks } from '../testUtils';
import VideoSelectorContainer from './VideoSelectorContainer';

describe('VideoSelectorContainer', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the wrapper div with correct class', () => {
    const { container } = render(
      <CourseAuthoringProvider courseId="course-v1:edX+Test+2024">
        <VideoSelectorContainer />
      </CourseAuthoringProvider>,
    );
    expect(container.querySelector('.selector-page')).toBeInTheDocument();
  });
});
