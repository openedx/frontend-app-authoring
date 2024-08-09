import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../testUtils';
import { ImageSettingsModalInternal as ImageSettingsModal } from '.';

jest.mock('./AltTextControls', () => 'AltTextControls');
jest.mock('./DimensionControls', () => 'DimensionControls');

jest.mock('./hooks', () => ({
  altTextHooks: () => ({
    error: {
      show: true,
      dismiss: jest.fn(),
    },
    isDecorative: false,
    value: 'alternative Taxes',
  }),
  dimensionHooks: () => ({
    onImgLoad: jest.fn(
      (selection) => ({ 'hooks.dimensions.onImgLoad.callback': { selection } }),
    ).mockName('hooks.dimensions.onImgLoad'),
    value: { width: 12, height: 13 },
  }),
  onSaveClick: (args) => ({ 'hooks.onSaveClick': args }),
}));

describe('ImageSettingsModal', () => {
  const props = {
    isOpen: false,
    selection: {
      altText: 'AlTTExt',
      externalUrl: 'ExtERNALurL',
      url: 'UrL',
    },
    // inject
    intl: { formatMessage },
  };
  beforeEach(() => {
    props.close = jest.fn().mockName('props.close');
    props.saveToEditor = jest.fn().mockName('props.saveToEditor');
    props.returnToSelection = jest.fn().mockName('props.returnToSelector');
  });
  describe('render', () => {
    test('snapshot', () => {
      expect(shallow(<ImageSettingsModal {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
