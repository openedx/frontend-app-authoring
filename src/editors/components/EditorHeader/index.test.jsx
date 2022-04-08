import React from 'react';
import { shallow } from 'enzyme';

import { IconButton } from '@edx/paragon';

import { formatMessage } from '../../../testUtils';
import { selectors } from '../../data/redux';
import * as appHooks from '../../hooks';
import * as module from './index';

jest.mock('.', () => ({
  __esModule: true, // Use it when dealing with esModules
  ...jest.requireActual('./index'),
  handleCloseClicked: jest.fn(args => ({ handleCloseClicked: args })),
}));

jest.mock('../../data/redux', () => ({
  selectors: {
    app: {
      returnUrl: jest.fn().mockName('actions.app.returnUrl'),
    },
  },
}));

jest.mock('../../hooks', () => ({
  navigateCallback: jest.fn(),
}));

jest.mock('./HeaderTitle', () => 'HeaderTitle');

describe('Editor Header index', () => {
  const props = {
    editorRef: 'refOfTHEeditTOR',
    intl: { formatMessage },
    returnUrl: 'TeST-ReTurNurL',
  };
  const { EditorHeader } = module;
  const el = shallow(<EditorHeader {...props} />);

  describe('behavior', () => {
    test('IconButton onClick calls navigateCallback', () => {
      const iconButtonControl = el.find(IconButton);
      iconButtonControl.simulate('click');
      expect(appHooks.navigateCallback).toHaveBeenCalledWith(props.returnUrl);
    });
  });

  describe('snapshot', () => {
    expect(el).toMatchSnapshot();
  });

  describe('mapStateToProps', () => {
    const testState = { T: 'est', S: 'tate' };
    test('returnUrl from app.returnUrl', () => {
      expect(module.mapStateToProps(testState).returnUrl)
        .toEqual(selectors.app.returnUrl(testState));
    });
  });
});
