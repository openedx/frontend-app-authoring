import React from 'react';
import renderer from 'react-test-renderer';
import ModalErrorListItem from './ModalErrorListItem';

describe('ModalErrorListItem', () => {
  const settingsData = {
    advancedModules: {
      displayName: 'Advanced Modules',
    },
    courseSettings: {
      displayName: 'Course Settings',
    },
  };

  const settingName = {
    key: 'advancedModules',
    message: 'Incorrectly formatted JSON',
  };

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <ModalErrorListItem
          settingName={settingName}
          settingsData={settingsData}
        />,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
