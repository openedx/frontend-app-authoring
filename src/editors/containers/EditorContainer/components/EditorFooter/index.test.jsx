import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { useSelector } from 'react-redux';
import { formatMessage } from '../../../../../testUtils';
import { EditorFooter } from '.';

jest.mock('../../hooks', () => ({
  nullMethod: jest.fn().mockName('hooks.nullMethod'),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('EditorFooter', () => {
  const props = {
    intl: { formatMessage },
    disableSave: false,
    onCancel: jest.fn().mockName('args.onCancel'),
    onSave: jest.fn().mockName('args.onSave'),
    saveFailed: false,
  };
  describe('render', () => {
    test('snapshot: default args (disableSave: false, saveFailed: false)', () => {
      expect(shallow(<EditorFooter {...props} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: save disabled. Show button spinner', () => {
      expect(shallow(<EditorFooter {...props} disableSave />).snapshot).toMatchSnapshot();
    });
    test('snapshot: save failed.  Show error message', () => {
      expect(shallow(<EditorFooter {...props} saveFailed />).snapshot).toMatchSnapshot();
    });

    test('snapshot: show feedback link', () => {
      useSelector.mockReturnValueOnce('problem');
      expect(shallow(<EditorFooter {...props} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: dont show feedback link', () => {
      useSelector.mockReturnValueOnce('not a Problem');
      expect(shallow(<EditorFooter {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
