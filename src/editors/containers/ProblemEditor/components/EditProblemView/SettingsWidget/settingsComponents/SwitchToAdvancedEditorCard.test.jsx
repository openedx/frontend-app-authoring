import React from 'react';
import { shallow } from 'enzyme';
import { SwitchToAdvancedEditorCard, mapDispatchToProps } from './SwitchToAdvancedEditorCard';
import { thunkActions } from '../../../../../../data/redux';

describe('SwitchToAdvancedEditorCard snapshot', () => {
  const mockSwitchToAdvancedEditor = jest.fn().mockName('switchToAdvancedEditor');
  test('snapshot: SwitchToAdvancedEditorCard', () => {
    expect(
      shallow(<SwitchToAdvancedEditorCard switchToAdvancedEditor={mockSwitchToAdvancedEditor} problemType="stringresponse" />),
    ).toMatchSnapshot();
  });
  test('snapshot: SwitchToAdvancedEditorCard returns null', () => {
    expect(
      shallow(<SwitchToAdvancedEditorCard switchToAdvancedEditor={mockSwitchToAdvancedEditor} problemType="advanced" />),
    ).toMatchSnapshot();
  });

  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateField', () => {
      expect(mapDispatchToProps.switchToAdvancedEditor).toEqual(thunkActions.problem.switchToAdvancedEditor);
    });
  });
});
