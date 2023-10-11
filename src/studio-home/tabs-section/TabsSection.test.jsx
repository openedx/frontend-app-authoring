import React from 'react';
import { useSelector } from 'react-redux';
import { initializeMockApp } from '@edx/frontend-platform';
import { waitFor, render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import { studioHomeMock } from '../__mocks__';
import messages from '../messages';
import TabsSection from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

const { studioShortName } = studioHomeMock;

let store;

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TabsSection intl={{ formatMessage: jest.fn() }} tabsData={studioHomeMock} />
    </IntlProvider>
  </AppProvider>
);

describe('<TabsSection />', () => {
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
    useSelector.mockReturnValue(studioHomeMock);
  });
  it('should render all tabs correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.coursesTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.librariesTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.archivedTabTitle.defaultMessage)).toBeInTheDocument();
  });
  it('should render specific course details', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(studioHomeMock.courses[0].displayName)).toBeVisible();
    expect(getByText(
      `${studioHomeMock.courses[0].org} / ${studioHomeMock.courses[0].number} / ${studioHomeMock.courses[0].run}`,
    )).toBeVisible();
  });
  it('should switch to Libraries tab and render specific library details', () => {
    const { getByText } = render(<RootWrapper />);
    const librariesTab = getByText(messages.librariesTabTitle.defaultMessage);
    fireEvent.click(librariesTab);
    expect(getByText(studioHomeMock.libraries[0].displayName)).toBeVisible();
    expect(getByText(`${studioHomeMock.libraries[0].org} / ${studioHomeMock.libraries[0].number}`)).toBeVisible();
  });
  it('should switch to Archived tab and render specific archived course details', () => {
    const { getByText } = render(<RootWrapper />);
    const archivedTab = getByText(messages.archivedTabTitle.defaultMessage);
    fireEvent.click(archivedTab);
    expect(getByText(studioHomeMock.archivedCourses[0].displayName)).toBeVisible();
    expect(getByText(
      `${studioHomeMock.archivedCourses[0].org} / ${studioHomeMock.archivedCourses[0].number} / ${studioHomeMock.archivedCourses[0].run}`,
    )).toBeVisible();
  });
  it('should hide Libraries tab when libraries are disabled', () => {
    studioHomeMock.librariesEnabled = false;
    const { queryByText, getByText } = render(<RootWrapper />);
    expect(getByText(messages.coursesTabTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.librariesTabTitle.defaultMessage)).toBeNull();
    expect(getByText(messages.archivedTabTitle.defaultMessage)).toBeInTheDocument();
  });
  it('should hide Archived tab when archived courses are empty', () => {
    studioHomeMock.librariesEnabled = true;
    studioHomeMock.archivedCourses = [];
    const { queryByText, getByText } = render(<RootWrapper />);
    expect(getByText(messages.coursesTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.librariesTabTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.archivedTabTitle.defaultMessage)).toBeNull();
  });
  it('should render default sections when courses are empty', () => {
    studioHomeMock.courses = [];
    const { getByText, getByRole } = render(<RootWrapper />);
    expect(getByText(`Are you staff on an existing ${studioShortName} course?`)).toBeInTheDocument();
    expect(getByText(messages.defaultSection_1_Description.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.defaultSection_2_Title.defaultMessage })).toBeInTheDocument();
    expect(getByText(messages.defaultSection_2_Description.defaultMessage)).toBeInTheDocument();
  });
  it('should redirect to library authoring mfe', () => {
    studioHomeMock.redirectToLibraryAuthoringMfe = true;
    const { getByText } = render(<RootWrapper />);
    const librariesTab = getByText(messages.librariesTabTitle.defaultMessage);
    fireEvent.click(librariesTab);
    waitFor(() => {
      expect(window.location.href).toBe(studioHomeMock.libraryAuthoringMfeUrl);
    });
  });
});
