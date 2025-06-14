import React from 'react';
import { render, initializeMocks } from '../testUtils';
import VideoSelectorContainer from './VideoSelectorContainer';

describe('VideoSelectorContainer', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the wrapper div with correct class', () => {
    const { container } = render(<VideoSelectorContainer courseId="course-v1:edX+Test+2024" />);
    expect(container.querySelector('.selector-page')).toBeInTheDocument();
  });
});
