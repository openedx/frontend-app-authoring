import React from 'react';
import { Provider } from 'react-redux';
import * as reactRedux from 'react-redux';
import * as hooks from './hooks';
import VideoSelector from './VideoSelector';
import { render, initializeMocks } from '../testUtils';
import editorStore from './data/store';
import { EditorContextProvider } from './EditorContext';

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
    const { getByText } = render(
      <EditorContextProvider learningContextId="course-v1:Org+COURSE+RUN">
        <Provider store={editorStore}>
          <VideoSelector {...defaultProps} />
        </Provider>
      </EditorContextProvider>,
    );
    expect(getByText('Add video to your course')).toBeInTheDocument();
  });

  test('renders nothing when loading is true', () => {
    jest.spyOn(hooks, 'useInitializeApp').mockReturnValue(true);
    const { queryByText } = render(
      <EditorContextProvider learningContextId="course-v1:Org+COURSE+RUN">
        <Provider store={editorStore}>
          <VideoSelector {...defaultProps} />
        </Provider>
      </EditorContextProvider>,
    );
    expect(queryByText('Add video to your course')).not.toBeInTheDocument();
  });

  test('calls initializeApp hook with dispatch, and passed data', () => {
    const initData = {
      blockType: 'video',
      ...defaultProps,
    };
    const mockDispatch = jest.fn();
    jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch);
    jest.spyOn(hooks, 'useInitializeApp');
    render(
      <EditorContextProvider learningContextId="course-v1:Org+COURSE+RUN">
        <Provider store={editorStore}>
          <VideoSelector {...defaultProps} />
        </Provider>
      </EditorContextProvider>,
    );
    expect(hooks.useInitializeApp).toHaveBeenCalledWith({
      dispatch: mockDispatch,
      data: initData,
    });
  });
});
