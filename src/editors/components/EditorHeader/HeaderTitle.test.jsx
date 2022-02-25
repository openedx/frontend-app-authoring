import React from 'react';
import { shallow } from 'enzyme';

import * as module from './HeaderTitle';
import { actions, selectors } from '../../data/redux';
import { localTitleHooks } from './hooks';

jest.mock('../../data/redux', () => ({
  actions: {
    app: {
      setBlockTitle: jest.fn().mockName('actions.app.setBlockTitle'),
    },
  },
  selectors: {
    app: {
      typeHeader: jest.fn(state => ({ typeHeader: state })),
      isInitialized: jest.fn(state => ({ studioEndpointUrl: state })),
    },
  },
}));

jest.mock('./hooks', () => ({
  localTitleHooks: jest.fn(),
}));

describe('HeaderTitle', () => {
  const props = {
    editorRef: jest.fn().mockName('args.editorRef'),
    isInitialized: false,
    setBlockTitle: jest.fn().mockName('args.setBlockTitle'),
    typeHeader: 'html',
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
        typeHeader: props.typeHeader,
      });
    });
  });

  describe('snapshots', () => {
    test('not initialized', () => {
      expect(shallow(<module.HeaderTitle {...props} />)).toMatchSnapshot();
    });
    test('initialized', () => {
      localTitleHooks.mockReturnValue(hookProps);
      expect(shallow(<module.HeaderTitle {...props} isInitialized />)).toMatchSnapshot();
    });
    test('editing', () => {
      localTitleHooks.mockReturnValue({ ...hookProps, isEditing: true });
      expect(shallow(<module.HeaderTitle {...props} isInitialized />)).toMatchSnapshot();
    });
  });

  describe('mapStateToProps', () => {
    const testState = { T: 'esting', S: 'tate' };
    test('typeHeader from app.typeHeader', () => {
      expect(module.mapStateToProps(testState).typeHeader)
        .toEqual(selectors.app.typeHeader(testState));
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
