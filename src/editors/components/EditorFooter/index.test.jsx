import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../testUtils';
import { selectors, thunkActions } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { saveBlock, navigateCallback } from '../../hooks';
import * as module from './index';

jest.mock('../../data/redux', () => ({
  thunkActions: {
    app: {
      saveBlock: jest.fn().mockName('thunkActions.app.saveBlock'),
      fetchImages: jest.fn().mockName('thunkActions.app.fetchImages'),
    },
  },
  selectors: {
    app: {
      isInitialized: jest.fn(state => ({ isInitialized: state })),
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
      returnUrl: jest.fn(state => ({ returnUrl: state })),
    },
    requests: {
      isFailed: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
  },
}));

jest.mock('.', () => ({
  __esModule: true, // Use it when dealing with esModules
  ...jest.requireActual('./index'),
  handleCancelClicked: jest.fn(args => ({ handleCancelClicked: args })),
  handleSaveClicked: jest.fn(args => ({ handleSaveClicked: args })),
}));

jest.mock('../../hooks', () => ({
  saveBlock: jest.fn(),
  navigateCallback: jest.fn(),
  nullMethod: jest.fn().mockName('nullMethod'),
}));

describe('EditorFooter', () => {
  const props = {
    intl: { formatMessage },
    editorRef: jest.fn().mockName('args.editorRef'),
    isInitialized: true,
    returnUrl: 'hocuspocus.ca',
    saveFailed: false,
    saveBlockContent: jest.fn().mockName('args.saveBlock'),
  };
  describe('behavior', () => {
    const realmodule = jest.requireActual('./index');
    test('handleSaveClicked calls saveBlock', () => {
      const createdCallback = realmodule.handleSaveClicked(props);
      createdCallback();
      expect(saveBlock).toHaveBeenCalled();
    });
    test('handleCancelClicked calls navigateCallback', () => {
      realmodule.handleCancelClicked({ returnUrl: props.returnUrl });
      expect(navigateCallback).toHaveBeenCalledWith(props.returnUrl);
    });
  });
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<module.EditorFooter {...props} />)).toMatchSnapshot();
    });
    test('not intialized, Spinner appears and button is disabled', () => {
      expect(shallow(<module.EditorFooter {...props} isInitialized={false} />)).toMatchSnapshot();
    });
    test('Save Failed, error message raised', () => {
      expect(shallow(<module.EditorFooter {...props} saveFailed />)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('isInitialized from app.returnUrl', () => {
      expect(
        module.mapStateToProps(testState).returnUrl,
      ).toEqual(selectors.app.returnUrl(testState));
    });
    test('isInitialized from app.isInitialized', () => {
      expect(
        module.mapStateToProps(testState).isInitialized,
      ).toEqual(selectors.app.isInitialized(testState));
    });
    test('studioEndpointUrl from app.studioEndpointUrl', () => {
      expect(
        module.mapStateToProps(testState).studioEndpointUrl,
      ).toEqual(selectors.app.studioEndpointUrl(testState));
    });
    test('saveFailed from requests.isFailed', () => {
      expect(
        module.mapStateToProps(testState).saveFailed,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.saveBlock }));
    });
  });
  describe('mapDispatchToProps', () => {
    test('saveBlock from thunkActions.app.saveBlock', () => {
      expect(module.mapDispatchToProps.saveBlockContent).toEqual(thunkActions.app.saveBlock);
    });
  });
});
