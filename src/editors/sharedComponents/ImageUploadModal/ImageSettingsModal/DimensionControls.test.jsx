import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../testUtils';
import { DimensionControls } from './DimensionControls';

jest.mock('./hooks', () => ({
  onInputChange: (handler) => ({ 'hooks.onInputChange': handler }),
}));

describe('DimensionControls', () => {
  const props = {
    lockDims: { width: 12, height: 15 },
    locked: { 'props.locked': 'lockedValue' },
    isLocked: true,
    value: { width: 20, height: 40 },
    // inject
    intl: { formatMessage },
  };
  beforeEach(() => {
    props.setWidth = jest.fn().mockName('props.setWidth');
    props.setHeight = jest.fn().mockName('props.setHeight');
    props.lock = jest.fn().mockName('props.lock');
    props.unlock = jest.fn().mockName('props.unlock');
    props.updateDimensions = jest.fn().mockName('props.updateDimensions');
  });
  describe('render', () => {
    test('snapshot', () => {
      expect(shallow(<DimensionControls {...props} />)).toMatchSnapshot();
    });
    test('null value: empty snapshot', () => {
      const el = shallow(<DimensionControls {...props} value={null} />);
      expect(el).toMatchSnapshot();
      expect(el.isEmptyRender()).toEqual(true);
    });
    test('unlocked dimensions', () => {
      const el = shallow(<DimensionControls {...props} isLocked={false} />);
      expect(el).toMatchSnapshot();
    });
  });
});
