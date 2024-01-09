import MockAdapter from 'axios-mock-adapter';
import {
  act, render, waitFor, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { getConfig, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  getCourseSectionVerticalApiUrl,
  getCourseUnitApiUrl,
  getXBlockBaseApiUrl,
} from './data/api';
import {
  fetchCourseSectionVerticalData,
  fetchCourseUnitQuery,
} from './data/thunk';
import initializeStore from '../store';
import {
  courseSectionVerticalMock,
  courseUnitIndexMock,
} from './__mocks__';
import { executeThunk } from '../utils';
import CourseUnit from './CourseUnit';
import headerNavigationsMessages from './header-navigations/messages';
import headerTitleMessages from './header-title/messages';
import { getUnitPreviewPath, getUnitViewLivePath } from './utils';

let axiosMock;
let store;
const courseId = '123';
const sectionId = 'graded_interactions';
const subsectionId = '19a30717eff543078a5d94ae9d6c18a5';
const blockId = '567890';
const unitDisplayName = courseUnitIndexMock.metadata.display_name;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ blockId }),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseUnit courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseUnit />', () => {
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
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render CourseUnit component correctly', async () => {
    const { getByText, getByRole } = render(<RootWrapper />);
    const currentSectionName = courseUnitIndexMock.ancestor_info.ancestors[1].display_name;
    const currentSubSectionName = courseUnitIndexMock.ancestor_info.ancestors[1].display_name;

    await waitFor(() => {
      expect(getByText(unitDisplayName)).toBeInTheDocument();
      expect(getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: headerTitleMessages.altButtonSettings.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: currentSectionName })).toBeInTheDocument();
      expect(getByRole('button', { name: currentSubSectionName })).toBeInTheDocument();
    });
  });

  it('handles CourseUnit header action buttons', async () => {
    const { open } = window;
    window.open = jest.fn();
    const { getByRole } = render(<RootWrapper />);

    await waitFor(() => {
      const viewLiveButton = getByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage });
      userEvent.click(viewLiveButton);
      expect(window.open).toHaveBeenCalled();
      const VIEW_LIVE_LINK = getConfig().LMS_BASE_URL + getUnitViewLivePath(courseId, blockId);
      expect(window.open).toHaveBeenCalledWith(VIEW_LIVE_LINK, '_blank');

      const previewButton = getByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage });
      userEvent.click(previewButton);
      expect(window.open).toHaveBeenCalled();
      // eslint-disable-next-line max-len
      const PREVIEW_LINK = getConfig().PREVIEW_BASE_URL + getUnitPreviewPath(courseId, sectionId, subsectionId, blockId);
      expect(window.open).toHaveBeenCalledWith(PREVIEW_LINK, '_blank');
    });

    window.open = open;
  });

  it('checks courseUnit title changing when edit query is successfully', async () => {
    const {
      findByText, queryByRole, getByRole,
    } = render(<RootWrapper />);
    let editTitleButton = null;
    let titleEditField = null;
    const newDisplayName = `${unitDisplayName} new`;

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId, {
        metadata: {
          display_name: newDisplayName,
        },
      }))
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        metadata: {
          ...courseUnitIndexMock.metadata,
          display_name: newDisplayName,
        },
      });

    await waitFor(() => {
      editTitleButton = getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage });
      titleEditField = queryByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    });
    expect(titleEditField).not.toBeInTheDocument();
    fireEvent.click(editTitleButton);
    titleEditField = getByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    fireEvent.change(titleEditField, { target: { value: newDisplayName } });
    await act(async () => {
      fireEvent.blur(titleEditField);
    });
    expect(titleEditField).toHaveValue(newDisplayName);

    titleEditField = queryByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    expect(titleEditField).not.toBeInTheDocument();
    expect(await findByText(newDisplayName)).toBeInTheDocument();
  });
});
