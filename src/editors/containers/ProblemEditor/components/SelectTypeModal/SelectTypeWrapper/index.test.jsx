import React from 'react';
import { shallow } from 'enzyme';
import { IconButton } from '@edx/paragon';
import * as module from '.';
import { handleCancelClicked } from '../../../../EditorContainer/hooks';

jest.mock('../../../../EditorContainer/hooks', () => ({
  handleCancelClicked: jest.fn().mockName('handleCancelClicked'),
}));

describe('SelectTypeWrapper', () => {
  const props = {
    children: (<h1>test child</h1>),
    onClose: jest.fn(),
    selected: 'iMAsElecTedValUE',
  };

  test('snapshot', () => {
    expect(shallow(<module.SelectTypeWrapper {...props} />)).toMatchSnapshot();
  });

  describe('behavior', () => {
    let el;
    beforeEach(() => {
      el = shallow(<module.SelectTypeWrapper {...props} />);
    });
    test('close behavior is linked to modal onClose', () => {
      const expected = handleCancelClicked({ onClose: props.onClose });
      expect(el.find(IconButton).props().onClick)
        .toEqual(expected);
    });
  });
});
