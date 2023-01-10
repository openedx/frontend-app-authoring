import React from 'react';
import { shallow } from 'enzyme';
import { SwitchToAdvancedEditorCard } from './SwitchToAdvancedEditorCard';

describe('SwitchToAdvancedEditorCard snapshot', () => {
  const mockSwitchToAdvancedEditor = jest.fn().mockName('switchToAdvancedEditor');
  test('snapshot: SwitchToAdvancedEditorCard', () => {
    expect(
      shallow(<SwitchToAdvancedEditorCard switchToAdvancedEditor={mockSwitchToAdvancedEditor} />),
    ).toMatchSnapshot();
  });
});
