import { IconButton } from '@edx/paragon';
import { shallow } from 'enzyme';
import { useDispatch } from 'react-redux';

import { EditorContainer } from '.';
import * as hooks from './hooks';

const props = {
  getContent: jest.fn().mockName('props.getContent'),
  onClose: jest.fn().mockName('props.onClose'),
  validateEntry: jest.fn().mockName('props.validateEntry'),
};

jest.mock('./hooks', () => ({
  isInitialized: jest.fn().mockReturnValue(true),
  handleCancelClicked: (args) => ({ handleCancelClicked: args }),
  handleSaveClicked: (args) => ({ handleSaveClicked: args }),
  saveFailed: jest.fn().mockName('hooks.saveFailed'),
}));

let el;

describe('EditorContainer component', () => {
  describe('render', () => {
    const testContent = (<h1>My test content</h1>);
    test('snapshot: not initialized. disable save and pass to header', () => {
      hooks.isInitialized.mockReturnValueOnce(false);
      expect(
        shallow(<EditorContainer {...props}>{testContent}</EditorContainer>),
      ).toMatchSnapshot();
    });
    test('snapshot: initialized. enable save and pass to header', () => {
      expect(
        shallow(<EditorContainer {...props}>{testContent}</EditorContainer>),
      ).toMatchSnapshot();
    });
    describe('behavior inspection', () => {
      beforeEach(() => {
        el = shallow(<EditorContainer {...props}>{testContent}</EditorContainer>);
      });

      test('close behavior is linked to modal onClose', () => {
        const expected = hooks.handleCancelClicked({ onClose: props.onClose });
        expect(el.find(IconButton)
          .props().onClick).toEqual(expected);
      });
      test('close behavior is linked to footer onCancel', () => {
        const expected = hooks.handleCancelClicked({ onClose: props.onClose });
        expect(el.children().at(2)
          .props().onCancel).toEqual(expected);
      });
      test('save behavior is linked to footer onSave', () => {
        const expected = hooks.handleSaveClicked({
          dispatch: useDispatch(),
          getContent: props.getContent,
          validateEntry: props.validateEntry,
        });
        expect(el.children().at(2)
          .props().onSave).toEqual(expected);
      });
    });
  });
});
