import * as reactRedux from 'react-redux';

import { RequestKeys } from '../../data/constants/requests';
import { selectors } from '../../data/redux';

import * as appHooks from '../../hooks';
import * as hooks from './hooks';
import analyticsEvt from '../../data/constants/analyticsEvt';

jest.mock('../../data/redux', () => ({
  selectors: {
    app: {
      isInitialized: (state) => ({ isInitialized: state }),
    },
    requests: {
      isFailed: (...args) => ({ requestFailed: args }),
    },
  },
}));
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  navigateCallback: jest.fn((args) => ({ navigateCallback: args })),
  saveBlock: jest.fn((args) => ({ saveBlock: args })),
}));

const dispatch = jest.fn();
describe('EditorContainer hooks', () => {
  describe('forwarded hooks', () => {
    it('forwards navigateCallback from app hooks', () => {
      expect(hooks.navigateCallback).toEqual(appHooks.navigateCallback);
    });
    it('forwards nullMethod from app hooks', () => {
      expect(hooks.nullMethod).toEqual(appHooks.nullMethod);
    });
    it('forwards saveBlock from app hooks', () => {
      expect(hooks.saveBlock).toEqual(appHooks.saveBlock);
    });
  });
  describe('local hooks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    describe('handleSaveClicked', () => {
      it('returns callback to saveBlock with dispatch and content from getContent', () => {
        const getContent = () => 'myTestContentValue';
        const output = hooks.handleSaveClicked({
          getContent,
          destination: 'testDEsTURL',
          analytics: 'soMEanALytics',
          dispatch,
        });
        output();
        expect(appHooks.saveBlock).toHaveBeenCalledWith({
          content: getContent(),
          destination: reactRedux.useSelector(selectors.app.returnUrl),
          analytics: reactRedux.useSelector(selectors.app.analytics),
          dispatch,
        });
      });
    });
    describe('handleCancelClicked', () => {
      it('calls navigateCallback to returnUrl if onClose is not passed', () => {
        expect(hooks.handleCancelClicked({})).toEqual(
          appHooks.navigateCallback({
            destination: reactRedux.useSelector(selectors.app.returnUrl),
            analyticsEvent: analyticsEvt.editorCancelClick,
            analytics: reactRedux.useSelector(selectors.app.analytics),
          }),
        );
      });
      it('calls onClose and not navigateCallback if onClose is passed', () => {
        const onClose = () => 'my close value';
        expect(hooks.handleCancelClicked({ onClose })).toEqual(onClose);
        expect(appHooks.navigateCallback).not.toHaveBeenCalled();
      });
    });
    describe('isInitialized', () => {
      it('forwards selectors.app.isInitialized', () => {
        expect(hooks.isInitialized()).toEqual(
          reactRedux.useSelector(selectors.app.isInitialized),
        );
      });
    });
    describe('saveFailed', () => {
      it('forwards requests.isFailed selector for saveBlock request', () => {
        const testState = { some: 'state' };
        const testValue = 'Some data';
        reactRedux.useSelector.mockReturnValueOnce(testValue);
        expect(hooks.saveFailed()).toEqual(testValue);
        const [[cb]] = reactRedux.useSelector.mock.calls;
        expect(cb(testState)).toEqual(
          selectors.requests.isFailed(testState, { requestKey: RequestKeys.saveBlock }),
        );
      });
    });
  });
});
