import React from 'react';
import { shallow } from 'enzyme';
import * as module from '.';

jest.mock('./hooks', () => ({
  selectHooks: jest.fn(() => ({
    selected: 'mOcKsELEcted',
    setSelected: jest.fn().mockName('setSelected'),
  })),
  useArrowNav: jest.fn().mockName('useArrowNav'),
}));

describe('SelectTypeModal', () => {
  const props = {
    onClose: jest.fn(),
  };

  test('snapshot', () => {
    expect(shallow(<module.SelectTypeModal {...props} />)).toMatchSnapshot();
  });
});
