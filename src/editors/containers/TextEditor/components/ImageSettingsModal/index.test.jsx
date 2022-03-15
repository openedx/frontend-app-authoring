import React from 'react';
import { shallow } from 'enzyme';
import ImageSettingsModal from '.';

jest.mock('./AltTextControls', () => 'AltTextControls');
jest.mock('./DimensionControls', () => 'DimensionControls');

jest.mock('./hooks', () => ({
  dimensions: () => ({
    value: { width: 12, height: 13 },
    onImgLoad: jest.fn(
      (selection) => ({ 'hooks.dimensions.onImgLoad.callback': { selection } }),
    ).mockName('hooks.dimensions.onImgLoad'),
  }),
  altText: () => ({
    value: 'alternative Taxes',
    isDecorative: false,
  }),
  onSaveClick: (args) => ({ 'hooks.onSaveClick': args }),
  isSaveDisabled: (args) => ({ 'hooks.isSaveDisabled': args }),
}));

describe('ImageSettingsModal', () => {
  const props = {
    isOpen: false,
    selection: { selected: 'image data' },
  };
  beforeEach(() => {
    props.close = jest.fn().mockName('props.close');
    props.saveToEditor = jest.fn().mockName('props.saveToEditor');
    props.returnToSelection = jest.fn().mockName('props.returnToSelector');
  });
  describe('render', () => {
    test('snapshot', () => {
      expect(shallow(<ImageSettingsModal {...props} />)).toMatchSnapshot();
    });
  });
});
