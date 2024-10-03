import 'CourseAuthoring/editors/setupEditorTest';
import * as reactRedux from 'react-redux';
import { MockUseState } from '../../testUtils';

import { RequestKeys } from '../../data/constants/requests';
import { selectors } from '../../data/redux';

import * as appHooks from '../../hooks';
import * as hooks from './hooks';
import analyticsEvt from '../../data/constants/analyticsEvt';

const hookState = new MockUseState(hooks);

jest.mock('../../data/redux', () => ({
  selectors: {
    app: {
      isInitialized: (state) => ({ isInitialized: state }),
      images: (state) => ({ images: state }),
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
    it('forwards clearSaveError from app hooks', () => {
      expect(hooks.clearSaveError).toEqual(appHooks.clearSaveError);
    });
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
      it('returns callback to saveBlock with dispatch and content from setAssetToStaticUrl', () => {
        const getContent = () => 'myTestContentValue';
        const setAssetToStaticUrl = () => 'myTestContentValue';
        const validateEntry = () => 'vaLIdAteENTry';
        const output = hooks.handleSaveClicked({
          getContent,
          images: {
            portableUrl: '/static/sOmEuiMAge.jpeg',
            displayName: 'sOmEuiMAge',
          },
          destination: 'testDEsTURL',
          analytics: 'soMEanALytics',
          dispatch,
          validateEntry,
        });
        output();
        expect(appHooks.saveBlock).toHaveBeenCalledWith({
          content: setAssetToStaticUrl(reactRedux.useSelector(selectors.app.images), getContent),
          destination: reactRedux.useSelector(selectors.app.returnUrl),
          analytics: reactRedux.useSelector(selectors.app.analytics),
          dispatch,
          validateEntry,
        });
      });
    });

    describe('cancelConfirmModalToggle', () => {
      const hookKey = hookState.keys.isCancelConfirmModalOpen;
      beforeEach(() => {
        jest.clearAllMocks();
      });
      describe('state hook', () => {
        hookState.testGetter(hookKey);
      });
      describe('using state', () => {
        beforeEach(() => {
          hookState.mock();
        });
        afterEach(() => {
          hookState.restore();
        });

        describe('cancelConfirmModalToggle', () => {
          let hook;
          beforeEach(() => {
            hook = hooks.cancelConfirmModalToggle();
          });
          test('isCancelConfirmOpen: state value', () => {
            expect(hook.isCancelConfirmOpen).toEqual(hookState.stateVals[hookKey]);
          });
          test('openCancelConfirmModal: calls setter with true', () => {
            hook.openCancelConfirmModal();
            expect(hookState.setState[hookKey]).toHaveBeenCalledWith(true);
          });
          test('closeCancelConfirmModal: calls setter with false', () => {
            hook.closeCancelConfirmModal();
            expect(hookState.setState[hookKey]).toHaveBeenCalledWith(false);
          });
        });
      });
    });

    describe('handleCancel', () => {
      it('calls navigateCallback to returnUrl if onClose is not passed', () => {
        expect(hooks.handleCancel({})).toEqual(
          appHooks.navigateCallback({
            destination: reactRedux.useSelector(selectors.app.returnUrl),
            analyticsEvent: analyticsEvt.editorCancelClick,
            analytics: reactRedux.useSelector(selectors.app.analytics),
            returnFunction: null,
          }),
        );
      });
      it('calls onClose and not navigateCallback if onClose is passed', () => {
        const onClose = () => 'my close value';
        expect(hooks.handleCancel({ onClose })).toEqual(onClose);
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
