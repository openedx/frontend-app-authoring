import { shallow } from '@edx/react-unit-test-utils';
import { useDispatch } from 'react-redux';

import { EditorContainer } from '.';
import * as hooks from './hooks';
import { formatMessage } from '../../../testUtils';

const props = {
  getContent: jest.fn().mockName('props.getContent'),
  onClose: jest.fn().mockName('props.onClose'),
  validateEntry: jest.fn().mockName('props.validateEntry'),
  returnFunction: jest.fn().mockName('props.returnFunction'),
  // inject
  intl: { formatMessage },
};

jest.mock('./hooks', () => ({
  clearSaveError: jest.fn().mockName('hooks.clearSaveError'),
  isInitialized: jest.fn().mockReturnValue(true),
  handleCancel: (args) => ({ handleCancel: args }),
  handleSaveClicked: (args) => ({ handleSaveClicked: args }),
  saveFailed: jest.fn().mockName('hooks.saveFailed'),
  cancelConfirmModalToggle: jest.fn(() => ({
    isCancelConfirmOpen: false,
    openCancelConfirmModal: jest.fn().mockName('openCancelConfirmModal'),
    closeCancelConfirmModal: jest.fn().mockName('closeCancelConfirmModal'),
  })),
}));

let el;

describe('EditorContainer component', () => {
  describe('render', () => {
    const testContent = (<h1>My test content</h1>);
    test('snapshot: not initialized. disable save and pass to header', () => {
      hooks.isInitialized.mockReturnValueOnce(false);
      expect(
        shallow(<EditorContainer {...props}>{testContent}</EditorContainer>).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshot: initialized. enable save and pass to header', () => {
      expect(
        shallow(<EditorContainer {...props}>{testContent}</EditorContainer>).snapshot,
      ).toMatchSnapshot();
    });
    describe('behavior inspection', () => {
      beforeEach(() => {
        el = shallow(<EditorContainer {...props}>{testContent}</EditorContainer>);
      });
      test('save behavior is linked to footer onSave', () => {
        const expected = hooks.handleSaveClicked({
          dispatch: useDispatch(),
          getContent: props.getContent,
          validateEntry: props.validateEntry,
          returnFunction: props.returnFunction,
        });
        expect(el.shallowWrapper.props.children[3]
          .props.onSave).toEqual(expected);
      });
      test('behavior is linked to clearSaveError', () => {
        const expected = hooks.clearSaveError({ dispatch: useDispatch() });
        expect(el.shallowWrapper.props.children[3]
          .props.clearSaveFailed).toEqual(expected);
      });
    });
  });
});
