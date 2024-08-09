import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import SettingsOption from './SettingsOption';

describe('SettingsOption', () => {
  describe('default with children', () => {
    const children = (<h1>My test content</h1>);
    test('snapshot: renders correct', () => {
      expect(shallow(<SettingsOption title="Settings Option Title" summary="Settings Option Summary">{children}</SettingsOption>).snapshot).toMatchSnapshot();
    });
  });
  describe('with additional sections', () => {
    const children = (<h1>First Section</h1>);
    const sections = [<h1>Second Section</h1>, <h1>Third Section</h1>];
    test('snapshot: renders correct', () => {
      expect(shallow(
        <SettingsOption title="Settings Option Title" summary="Settings Option Summary" extraSections={sections}>
          {children}
        </SettingsOption>,
      ).snapshot).toMatchSnapshot();
    });
  });
});
