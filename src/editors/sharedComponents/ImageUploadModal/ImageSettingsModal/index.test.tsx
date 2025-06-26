import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import ImageSettingsModal from '.';

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
    isOpen: true,
    selection: {
      altText: 'AlTTExt',
      externalUrl: 'ExtERNALurL',
      url: 'UrL',
    },
    close: jest.fn().mockName('props.close'),
    returnToSelection: jest.fn().mockName('props.returnToSelector'),
    saveToEditor: jest.fn().mockName('props.saveToEditor'),
  };
  beforeEach(() => {
    initializeMocks();
  });
  test('renders component', () => {
    render(<ImageSettingsModal {...props} />);
    expect(screen.getByText('Image Settings')).toBeInTheDocument();
  });
});
