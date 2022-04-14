import React from 'react';
import { useDispatch } from 'react-redux';
import { shallow } from 'enzyme';
import { Editor, supportedEditors } from './Editor';
import * as hooks from './hooks';
import { blockTypes } from './data/constants/app';

jest.mock('./hooks', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('./containers/TextEditor', () => 'TextEditor');
jest.mock('./containers/VideoEditor', () => 'VideoEditor');
jest.mock('./containers/ProblemEditor/ProblemEditor', () => 'ProblemEditor');

const initData = {
  blockId: 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4',
  blockType: blockTypes.html,
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};
const props = {
  initialize: jest.fn(),
  onClose: jest.fn().mockName('props.onClose'),
  ...initData,
};

let el;
describe('Editor', () => {
  describe('render', () => {
    test('snapshot: renders correct editor given blockType (html -> TextEditor)', () => {
      expect(shallow(<Editor {...props} />)).toMatchSnapshot();
    });
    test('presents error message if no relevant editor found and ref ready', () => {
      expect(shallow(<Editor {...props} blockType="fAkEBlock" />)).toMatchSnapshot();
    });
    test.each(Object.values(blockTypes))('renders %p editor when ref is ready', (blockType) => {
      el = shallow(<Editor {...props} blockType={blockType} />);
      expect(el.children().children().at(0).is(supportedEditors[blockType])).toBe(true);
    });
  });
  describe('behavior', () => {
    it('calls initializeApp hook with dispatch, and passed data', () => {
      el = shallow(<Editor {...props} blockType={blockTypes.html} />);
      expect(hooks.initializeApp).toHaveBeenCalledWith({
        dispatch: useDispatch(),
        data: initData,
      });
    });
  });
});
