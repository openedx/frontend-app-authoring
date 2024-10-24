import MockAdapter from 'axios-mock-adapter';
import { render, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getConfig, initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { getCourseSectionVerticalApiUrl, getCourseUnitApiUrl } from '../data/api';
import { getApiWaffleFlagsUrl } from '../../data/api';
import { fetchWaffleFlags } from '../../data/thunks';
import { fetchCourseSectionVerticalData, fetchCourseUnitQuery } from '../data/thunk';
import { courseSectionVerticalMock, courseUnitIndexMock } from '../__mocks__';
import Breadcrumbs from './Breadcrumbs';

let axiosMock;
let store;
const courseId = '123';
const mockNavigate = jest.fn();
const breadcrumbsExpected = {
  section: {
    id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@interactive_demonstrations',
    displayName: 'Example Week 1: Getting Started',
  },
  subsection: {
    displayName: 'Lesson 1 - Getting Started',
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <Breadcrumbs courseId={courseId} />
    </IntlProvider>
  </AppProvider>,
);

describe('<Breadcrumbs />', () => {
  beforeEach(async () => {
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
    axiosMock
      .onGet(getCourseUnitApiUrl(courseId))
      .reply(200, courseUnitIndexMock);
    await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, { useNewCourseOutlinePage: true });
    await executeThunk(fetchWaffleFlags(courseId), store.dispatch);
  });

  it('render Breadcrumbs component correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(breadcrumbsExpected.section.displayName)).toBeInTheDocument();
      expect(getByText(breadcrumbsExpected.subsection.displayName)).toBeInTheDocument();
    });
  });

  it('render Breadcrumbs\'s dropdown menus correctly', async () => {
    const { getByText, queryAllByTestId } = renderComponent();

    expect(getByText(breadcrumbsExpected.section.displayName)).toBeInTheDocument();
    expect(getByText(breadcrumbsExpected.subsection.displayName)).toBeInTheDocument();
    expect(queryAllByTestId('breadcrumbs-section-dropdown-item')).toHaveLength(0);
    expect(queryAllByTestId('breadcrumbs-subsection-dropdown-item')).toHaveLength(0);

    const button = getByText(breadcrumbsExpected.section.displayName);
    userEvent.click(button);
    await waitFor(() => {
      expect(queryAllByTestId('breadcrumbs-section-dropdown-item')).toHaveLength(5);
    });

    userEvent.click(getByText(breadcrumbsExpected.subsection.displayName));
    expect(queryAllByTestId('breadcrumbs-subsection-dropdown-item')).toHaveLength(2);
  });

  it('navigates using the new course outline page when the waffle flag is enabled', async () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { ancestor_xblocks: [{ children: [{ display_name, url }] }] } = courseSectionVerticalMock;
    const { getByText, getByRole } = renderComponent();

    await act(async () => {
      const dropdownBtn = getByText(breadcrumbsExpected.section.displayName);
      userEvent.click(dropdownBtn);
    });

    await act(async () => {
      const dropdownItem = getByRole('button', { name: display_name });
      userEvent.click(dropdownItem);
    });

    expect(mockNavigate).toHaveBeenCalledWith(url);
  });

  it('falls back to window.location.href when the waffle flag is disabled', async () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { ancestor_xblocks: [{ children: [{ display_name, url }] }] } = courseSectionVerticalMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, { useNewCourseOutlinePage: false });
    await executeThunk(fetchWaffleFlags(courseId), store.dispatch);

    const { getByText, getByRole } = renderComponent();

    const dropdownBtn = getByText(breadcrumbsExpected.section.displayName);
    userEvent.click(dropdownBtn);

    const dropdownItem = getByRole('button', { name: display_name });
    userEvent.click(dropdownItem);

    // Mock the whole window.location object
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: jest.fn() };

    userEvent.click(dropdownItem);

    expect(window.location.href).toBe(`${getConfig().STUDIO_BASE_URL}${url}`);

    // Restore the original window.location object
    window.location = originalLocation;
  });
});
