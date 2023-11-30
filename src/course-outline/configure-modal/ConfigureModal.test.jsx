import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import ConfigureModal from './ConfigureModal';
import messages from './messages';

// eslint-disable-next-line no-unused-vars
let axiosMock;
let store;
const mockPathname = '/foo-bar';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const currentSectionMock = {
  displayName: 'Section1',
  childInfo: {
    displayName: 'Subsection',
    children: [
      {
        displayName: 'Subsection 1',
        id: 1,
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 11,
              displayName: 'Subsection_1 Unit 1',
            },
          ],
        },
      },
      {
        displayName: 'Subsection 2',
        id: 2,
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 21,
              displayName: 'Subsection_2 Unit 1',
            },
          ],
        },
      },
      {
        displayName: 'Subsection 3',
        id: 3,
        childInfo: {
          children: [],
        },
      },
    ],
  },
};

const onCloseMock = jest.fn();
const onConfigureSubmitMock = jest.fn();

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<ConfigureModal />', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    useSelector.mockReturnValue(currentSectionMock);
  });

  it('renders ConfigureModal component correctly', () => {
    const { getByText, getByRole } = renderComponent();
    expect(getByText(`${currentSectionMock.displayName} Settings`)).toBeInTheDocument();
    expect(getByText(messages.basicTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.visibilityTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseDate.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseTimeUTC.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('switches to the Visibility tab and renders correctly', () => {
    const { getByRole, getByText } = renderComponent();

    const visibilityTab = getByRole('tab', { name: messages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    expect(getByText(messages.sectionVisibility.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.hideFromLearners.defaultMessage)).toBeInTheDocument();
  });

  it('disables the Save button and enables it if there is a change', () => {
    const { getByRole, getByPlaceholderText, getByTestId } = renderComponent();

    const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });
    expect(saveButton).toBeDisabled();

    const input = getByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(input, { target: { value: '12/15/2023' } });

    const visibilityTab = getByRole('tab', { name: messages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    const checkbox = getByTestId('visibility-checkbox');
    fireEvent.click(checkbox);
    expect(saveButton).not.toBeDisabled();
  });
});
