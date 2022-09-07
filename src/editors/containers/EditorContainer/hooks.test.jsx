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
  describe('non-state hooks', () => {
    describe('replaceStaticwithAsset', () => {
      it('returns content with updated img links', () => {
        const getContent = jest.fn(() => '<img src="/asset@asset-block/soMEImagEURl1"/> <img src="/asset@soMEImagEURl" />');
        const images = [
          { portableUrl: '/static/soMEImagEURl', displayName: 'soMEImagEURl' },
          { portableUrl: '/static/soMEImagEURl1', displayName: 'soMEImagEURl1' },
        ];
        const content = hooks.setAssetToStaticUrl(images, getContent);
        expect(getContent).toHaveBeenCalled();
        expect(content).toEqual('<img src="/static/soMEImagEURl1"/> <img src="/static/soMEImagEURl" />');
      });
    });
  });
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
