import React from 'react';
import { mount, shallow } from 'enzyme';
import { Editor, mapDispatchToProps, supportedEditors } from './Editor';
import { thunkActions } from './data/redux';
import * as hooks from './hooks';
import { blockTypes } from './data/constants/app';

jest.mock('./hooks', () => ({
  initializeApp: jest.fn(),
  prepareEditorRef: jest.fn().mockName('prepareEditorRef'),
}));

jest.mock('./containers/TextEditor/TextEditor', () => 'TextEditor');
jest.mock('./containers/VideoEditor/VideoEditor', () => 'VideoEditor');
jest.mock('./containers/ProblemEditor/ProblemEditor', () => 'ProblemEditor');
jest.mock('./components/EditorFooter', () => 'EditorFooter');
jest.mock('./components/EditorHeader', () => 'EditorHeader');

const props = {
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  blockId: 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4',
  studioEndpointUrl: 'fakeurl.com',
  initialize: jest.fn(),
};

describe('Editor', () => {
  describe('snapshots', () => {
    test('renders no editor when ref isnt ready', () => {
      hooks.prepareEditorRef.mockImplementationOnce(
        () => ({ editorRef: null, refReady: false, setEditorRef: jest.fn() }),
      );
      expect(shallow(<Editor blockType="AblOck" {...props} />)).toMatchSnapshot();
    });
    test.each(Object.values(blockTypes))('renders %p editor when ref is ready', (blockType) => {
      hooks.prepareEditorRef.mockImplementationOnce(
        () => ({ editorRef: { current: 'ref' }, refReady: true, setEditorRef: jest.fn().mockName('setEditorRef') }),
      );
      const wrapper = shallow(<Editor blockType={blockType} {...props} />);
      if(blockType == 'html'){ // snap just one editor to make viewing easier
        expect(wrapper).toMatchSnapshot();
      };
      expect(wrapper.children().children().at(1).is(supportedEditors[blockType])).toBe(true);
    });
    test('presents error message if no relevant editor found and ref ready', () => {
      hooks.prepareEditorRef.mockImplementationOnce(
        () => ({ editorRef: { current: 'ref' }, refReady: true, setEditorRef: jest.fn().mockName('setEditorRef') }),
      );
      expect(shallow(<Editor
        {...props}
        blockType="fAkEBlock"
      />)).toMatchSnapshot();
    });
  });
  describe('mapDispatchToProps', () => {
    test('initialize from thunkActions.app.initialize', () => {
      expect(mapDispatchToProps.initialize).toEqual(thunkActions.app.initialize);
    });
  });
});
