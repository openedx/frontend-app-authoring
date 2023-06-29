import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { fireEvent, render, act } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import messages from './messages';
import CourseUploadImage from '.';

let store;

const onChangeMock = jest.fn();
const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <AppProvider store={store}>
      <CourseUploadImage {...props} />
    </AppProvider>
  </IntlProvider>
);

const props = {
  label: 'foo-label-field',
  customHelpText: 'custom-help-text',
  assetImagePath: '/asset-v1:edX+M12+2T2023+type@asset+block@image_1.png',
  imageNameField: 'cardImageName',
  assetImageField: 'cardImageAssetPath',
  identifierFieldText: 'some identified field',
  showImageBodyText: true,
  customInputPlaceholder: 'custom-input-placeholder',
  onChange: onChangeMock,
};

describe('<CourseUploadImage />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  it('renders successfully', () => {
    const { getByText, getByPlaceholderText } = render(
      <RootWrapper {...props} />,
    );
    expect(getByText(props.label)).toBeInTheDocument();
    expect(getByText(props.customHelpText)).toBeInTheDocument();
    expect(getByPlaceholderText(props.customInputPlaceholder)).toBeInTheDocument();
  });

  it('should call onChange if input value changed', async () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const input = getByPlaceholderText(props.customInputPlaceholder);
    await act(() => {
      fireEvent.change(input, { target: { value: '/assets' } });
    });
    expect(onChangeMock).toHaveBeenCalledWith(
      '/assets',
      props.assetImageField,
    );
  });

  it('should change body text if input cleared', () => {
    const initialProps = { ...props, assetImagePath: '' };
    const { getByText } = render(<RootWrapper {...initialProps} />);
    expect(
      getByText(messages.uploadImageEmpty.defaultMessage),
    ).toBeInTheDocument();
  });

  it('should hide body text if showImageBodyText disabled', () => {
    const initialProps = { ...props, showImageBodyText: false };
    const { queryAllByText } = render(<RootWrapper {...initialProps} />);
    expect(queryAllByText(messages.uploadImageEmpty.defaultMessage).length).toBe(0);
    expect(queryAllByText(messages.uploadImageBodyFilled.defaultMessage).length).toBe(0);
  });
});
