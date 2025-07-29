import userEvent from '@testing-library/user-event';
import { getConfig } from '@edx/frontend-platform';
import {
  initializeMocks, waitFor, render,
} from '../../testUtils';

import { executeThunk } from '../../utils';
import { getCourseSectionVerticalApiUrl } from '../data/api';
import { getApiWaffleFlagsUrl } from '../../data/api';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { courseSectionVerticalMock } from '../__mocks__';
import Breadcrumbs from './Breadcrumbs';

let axiosMock;
let reduxStore;
const courseId = '123';
const parentUnitId = '456';
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
  <Breadcrumbs courseId={courseId} parentUnitId={parentUnitId} />,
);

describe('<Breadcrumbs />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    reduxStore = mocks.reduxStore;

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(courseId), reduxStore.dispatch);
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(courseId), reduxStore.dispatch);
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, { useNewCourseOutlinePage: true });
  });

  it('render Breadcrumbs component correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(breadcrumbsExpected.section.displayName)).toBeInTheDocument();
      expect(getByText(breadcrumbsExpected.subsection.displayName)).toBeInTheDocument();
    });
  });

  it('render Breadcrumbs with many ancestors items correctly', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
        ancestor_xblocks: [
          {
            children: [
              {
                ...courseSectionVerticalMock.ancestor_xblocks[0],
                display_name: 'Some module unit 1',
              },
              {
                ...courseSectionVerticalMock.ancestor_xblocks[1],
                display_name: 'Some module unit 2',
              },
            ],
            title: 'Some module',
            is_last: false,
          },
          ...courseSectionVerticalMock.ancestor_xblocks,
        ],
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), reduxStore.dispatch);
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Some module')).toBeInTheDocument();
      expect(getByText(breadcrumbsExpected.section.displayName)).toBeInTheDocument();
      expect(getByText(breadcrumbsExpected.subsection.displayName)).toBeInTheDocument();
    });
  });

  it('render Breadcrumbs\'s dropdown menus correctly', async () => {
    const user = userEvent.setup();
    const { getByText, queryAllByTestId } = renderComponent();

    expect(getByText(breadcrumbsExpected.section.displayName)).toBeInTheDocument();
    expect(getByText(breadcrumbsExpected.subsection.displayName)).toBeInTheDocument();
    expect(queryAllByTestId('breadcrumbs-section-dropdown-item')).toHaveLength(0);
    expect(queryAllByTestId('breadcrumbs-subsection-dropdown-item')).toHaveLength(0);

    const button = getByText(breadcrumbsExpected.section.displayName);
    await user.click(button);
    await waitFor(() => {
      expect(queryAllByTestId('breadcrumbs-dropdown-item-level-0')).toHaveLength(5);
    });

    await user.click(getByText(breadcrumbsExpected.subsection.displayName));
    await waitFor(() => {
      expect(queryAllByTestId('breadcrumbs-dropdown-item-level-1')).toHaveLength(2);
    });
  });

  it('navigates using the new course outline page when the waffle flag is enabled', async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { ancestor_xblocks: [{ children: [{ display_name, url }] }] } = courseSectionVerticalMock;
    const { getByText, getByRole } = renderComponent();

    const dropdownBtn = getByText(breadcrumbsExpected.section.displayName);
    await user.click(dropdownBtn);

    const dropdownItem = getByRole('link', { name: display_name });
    await user.click(dropdownItem);
    expect(dropdownItem).toHaveAttribute('href', url);
  });

  it('falls back to window.location.href when the waffle flag is disabled', async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { ancestor_xblocks: [{ children: [{ display_name, url }] }] } = courseSectionVerticalMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, { useNewCourseOutlinePage: false });

    const { getByText, getByRole } = renderComponent();

    const dropdownBtn = getByText(breadcrumbsExpected.section.displayName);
    await user.click(dropdownBtn);

    const dropdownItem = getByRole('link', { name: display_name });
    // We need waitFor here because the waffle flag defaults to true but asynchronously loads false from our axiosMock
    await waitFor(() => {
      expect(dropdownItem).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${url}`);
    });
  });
});
