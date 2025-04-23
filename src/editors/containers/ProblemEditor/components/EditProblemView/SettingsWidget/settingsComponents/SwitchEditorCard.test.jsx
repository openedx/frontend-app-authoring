import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { SwitchEditorCardInternal as SwitchEditorCard, mapDispatchToProps } from './SwitchEditorCard';
import { thunkActions } from '../../../../../../data/redux';

describe('SwitchEditorCard snapshot', () => {
  const mockSwitchEditor = jest.fn().mockName('switchEditor');
  test('snapshot: SwitchEditorCard', () => {
    expect(
      shallow(<SwitchEditorCard switchEditor={mockSwitchEditor} problemType="stringresponse" />).snapshot,
    ).toMatchSnapshot();
  });
  test('snapshot: SwitchEditorCard returns null for advanced problems', () => {
    expect(
      shallow(<SwitchEditorCard switchEditor={mockSwitchEditor} problemType="advanced" />).snapshot,
    ).toMatchSnapshot();
  });
  test('snapshot: SwitchEditorCard returns null when editor is Markdown', () => {
    expect(
      shallow(<SwitchEditorCard switchEditor={mockSwitchEditor} problemType="stringresponse" editorType="markdown" isMarkdownEditorEnabled />).snapshot,
    ).toMatchSnapshot();
  });

  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateField', () => {
      expect(mapDispatchToProps.switchEditor).toEqual(thunkActions.problem.switchEditor);
    });
  });
});
