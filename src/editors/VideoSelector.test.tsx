import React from 'react';
import * as reactRedux from 'react-redux';
import * as hooks from './hooks';
import VideoSelector from './VideoSelector';
import { editorRender } from './editorTestRender';
import { initializeMocks, screen } from '../testUtils';

const defaultProps = {
  blockId: 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4',
  learningContextId: 'course-v1:edX+DemoX+Demo_Course',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};

describe('VideoSelector', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders VideoGallery when loading is false', () => {
    jest.spyOn(hooks, 'useInitializeApp').mockReturnValue(false);
    editorRender(<VideoSelector {...defaultProps} />);
    expect(screen.getByText('Add video to your course')).toBeInTheDocument();
  });

  // TODO: transform into user-centric test to follow the best practices:
  // "testing the application components in the way the user would use it"
  test('renders nothing when loading is true', () => {
    jest.spyOn(hooks, 'useInitializeApp').mockReturnValue(true);
    editorRender(<VideoSelector {...defaultProps} />);
    expect(screen.queryByText('Add video to your course')).not.toBeInTheDocument();
  });

  // TODO: transform into user-centric test to follow the best practices:
  // "testing the application components in the way the user would use it"
  test('calls initializeApp hook with dispatch, and passed data', () => {
    const initData = {
      blockType: 'video',
      ...defaultProps,
    };
    const mockDispatch = jest.fn();
    jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch);
    jest.spyOn(hooks, 'useInitializeApp');
    editorRender(<VideoSelector {...defaultProps} />);
    expect(hooks.useInitializeApp).toHaveBeenCalledWith({
      dispatch: mockDispatch,
      data: initData,
    });
  });
});
