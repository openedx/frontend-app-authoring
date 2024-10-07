import userEvent from '@testing-library/user-event';
import { getConfig } from '@edx/frontend-platform';
import {
  initializeMocks, waitFor, act, render,
} from '../../testUtils';

import { executeThunk } from '../../utils';
import { getCourseSectionVerticalApiUrl, getCourseUnitApiUrl } from '../data/api';
import { getApiWaffleFlagsUrl } from '../../data/api';
import { fetchWaffleFlags } from '../../data/thunks';
import { fetchCourseSectionVerticalData, fetchCourseUnitQuery } from '../data/thunk';
import { courseSectionVerticalMock, courseUnitIndexMock } from '../__mocks__';
import Breadcrumbs from './Breadcrumbs';

let axiosMock;
let reduxStore;
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
  <Breadcrumbs courseId={courseId} />,
);

describe('<Breadcrumbs />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    reduxStore = mocks.reduxStore;

    axiosMock
      .onGet(getCourseUnitApiUrl(courseId))
      .reply(200, courseUnitIndexMock);
    await executeThunk(fetchCourseUnitQuery(courseId), reduxStore.dispatch);
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(courseId), reduxStore.dispatch);
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, { useNewCourseOutlinePage: true });
    await executeThunk(fetchWaffleFlags(courseId), reduxStore.dispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
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
      const dropdownItem = getByRole('link', { name: display_name });
      userEvent.click(dropdownItem);
      expect(dropdownItem).toHaveAttribute('href', url);
    });
  });

  it('falls back to window.location.href when the waffle flag is disabled', async () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { ancestor_xblocks: [{ children: [{ display_name, url }] }] } = courseSectionVerticalMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, { useNewCourseOutlinePage: false });
    await executeThunk(fetchWaffleFlags(courseId), reduxStore.dispatch);

    const { getByText, getByRole } = renderComponent();

    const dropdownBtn = getByText(breadcrumbsExpected.section.displayName);
    userEvent.click(dropdownBtn);

    const dropdownItem = getByRole('link', { name: display_name });
    expect(dropdownItem.href).toBe(`${getConfig().STUDIO_BASE_URL}${url}`);
  });
});
