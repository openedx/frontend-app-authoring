import React from 'react';
import { shallow } from 'enzyme';
import SettingsOption from './SettingsOption';

describe('SettingsOption', () => {
  describe('render', () => {
    const testContent = (<h1>My test content</h1>);
    test('snapshot: renders correct', () => {
      expect(shallow(<SettingsOption title="Settings Option Title" summary="Settings Option Summary">{testContent}</SettingsOption>)).toMatchSnapshot();
    });
  });
});
