import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../testUtils';
import { actions, selectors } from '../../data/redux';
import { localTitleHooks } from './hooks';
import * as module from './HeaderTitle';

jest.mock('../../data/redux', () => ({
  actions: {
    app: {
      setBlockTitle: jest.fn().mockName('actions.app.setBlockTitle'),
    },
  },
  selectors: {
    app: {
      returnTitle: jest.fn(state => ({ returnTitle: state })),
      isInitialized: jest.fn(state => ({ studioEndpointUrl: state })),
    },
  },
}));

jest.mock('./hooks', () => ({
  localTitleHooks: jest.fn(),
}));

describe('HeaderTitle', () => {
  const props = {
    intl: { formatMessage },
    editorRef: jest.fn().mockName('args.editorRef'),
    isInitialized: false,
    setBlockTitle: jest.fn().mockName('args.setBlockTitle'),
    returnTitle: 'html',
  };
  const localTitleHooksProps = {
    inputRef: jest.fn().mockName('localTitleHooks.inputRef'),
    isEditing: false,
    handleChange: jest.fn().mockName('localTitleHooks.handleChange'),
    handleKeyDown: jest.fn().mockName('localTitleHooks.handleKeyDown'),
    localTitle: 'TeST LocALtitLE',
    startEditing: jest.fn().mockName('localTitleHooks.startEditing'),
    updateTitle: jest.fn().mockName('localTitleHooks.updateTitle'),
  };

  describe('behavior', () => {
    it(' calls localTitleHooks with initialization args', () => {
      localTitleHooks.mockReturnValue(localTitleHooksProps);
      shallow(<module.HeaderTitle {...props} isInitialized />);
      expect(localTitleHooks).toHaveBeenCalledWith({
        editorRef: props.editorRef,
        setBlockTitle: props.setBlockTitle,
        returnTitle: props.returnTitle,
      });
    });
  });

  describe('snapshots', () => {
    test('not initialized', () => {
      expect(shallow(<module.HeaderTitle {...props} />)).toMatchSnapshot();
    });
    test('initialized', () => {
      localTitleHooks.mockReturnValue(localTitleHooksProps);
      expect(shallow(<module.HeaderTitle {...props} isInitialized />)).toMatchSnapshot();
    });
    test('editing', () => {
      localTitleHooks.mockReturnValue({ ...localTitleHooksProps, isEditing: true });
      expect(shallow(<module.HeaderTitle {...props} isInitialized />)).toMatchSnapshot();
    });
  });

  describe('mapStateToProps', () => {
    const testState = { T: 'esting', S: 'tate' };
    test('returnTitle from app.returnTitle', () => {
      expect(module.mapStateToProps(testState).returnTitle)
        .toEqual(selectors.app.returnTitle(testState));
    });
    test('isInitialized from app.isInitialized', () => {
      expect(module.mapStateToProps(testState).isInitialized)
        .toEqual(selectors.app.isInitialized(testState));
    });
  });

  describe('mapDispatchToProps', () => {
    test('setBlockTitle from actions.app.setBlockTitle', () => {
      expect(module.mapDispatchToProps.setBlockTitle).toEqual(actions.app.setBlockTitle);
    });
  });
});
