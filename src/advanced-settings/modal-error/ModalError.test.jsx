import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ModalError from './ModalError';

describe('ModalError', () => {
  const defaultProps = {
    intl: {
      formatMessage: jest.fn(),
    },
    isError: true,
    handleUndoChanges: jest.fn(),
    showErrorModal: jest.fn(),
    errorList: [
      { key: 'advancedModules', message: 'Incorrectly formatted JSON' },
      { key: 'courseSettings', message: 'Invalid value' },
    ],
    settingsData: {
      advancedModules: {
        displayName: 'Advanced Modules',
      },
      courseSettings: {
        displayName: 'Course Settings',
      },
    },
  };

  it('should match the snapshot', () => {
    const wrapper = mount(
      <IntlProvider locale="en">
        <ModalError {...defaultProps} />
      </IntlProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
