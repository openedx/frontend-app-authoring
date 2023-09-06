/* eslint-disable import/named */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  getCourseOutlineIndexApiUrl,
  getCourseSectionDuplicateApiUrl,
  getUpdateCourseSectionApiUrl,
} from './data/api';
import {
  deleteCourseSectionQuery,
  duplicateCourseSectionQuery,
  editCourseSectionQuery,
} from './data/thunk';
import initializeStore from '../store';
import { courseOutlineIndexMock, courseOutlineIndexWithoutSections } from './__mocks__';
import { executeThunk } from '../utils';
import CourseOutline from './CourseOutline';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseOutline courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseOutline />', () => {
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
  });

  it('render CourseOutline component correctly', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);
  });

  it('render CourseOutline component correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should expand and collapse subsections, after click on subheader buttons', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);
    const { queryAllByTestId, getByText } = render(<RootWrapper />);

    await waitFor(() => {
      const collapseBtn = getByText(messages.collapseAllButton.defaultMessage);
      expect(collapseBtn).toBeInTheDocument();
      fireEvent.click(collapseBtn);

      const expendBtn = getByText(messages.expandAllButton.defaultMessage);
      expect(expendBtn).toBeInTheDocument();

      fireEvent.click(expendBtn);

      const cardSubsections = queryAllByTestId('section-card__subsections');
      cardSubsections.forEach(element => expect(element).toBeVisible());

      fireEvent.click(collapseBtn);
      cardSubsections.forEach(element => expect(element).not.toBeVisible());
    });
  });

  it('render CourseOutline component without sections correctly', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexWithoutSections);

    const { getByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByTestId('empty-placeholder')).toBeInTheDocument();
    });
  });

  it('check edit section when edit query is successfully', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);

    const { getByText } = render(<RootWrapper />);
    const newDisplayName = 'New section name';

    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];

    axiosMock
      .onPost(getUpdateCourseSectionApiUrl(section.id, {
        metadata: {
          display_name: newDisplayName,
        },
      }))
      .reply(200);

    await executeThunk(editCourseSectionQuery(section.id, newDisplayName), store.dispatch);

    await waitFor(() => {
      expect(getByText(section.displayName)).toBeInTheDocument();
    });
  });

  it('check delete section when edit query is successfully', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);

    const { queryByText } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[1];

    axiosMock.onDelete(getUpdateCourseSectionApiUrl(section.id)).reply(200);
    await executeThunk(deleteCourseSectionQuery(section.id), store.dispatch);

    await waitFor(() => {
      expect(queryByText(section.displayName)).not.toBeInTheDocument();
    });
  });

  it('check duplicate section when duplicate query is successfully', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);

    const { getAllByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;

    axiosMock
      .onPost(getCourseSectionDuplicateApiUrl())
      .reply(200, {
        duplicate_source_locator: section.id,
        parent_locator: courseBlockId,
      });
    await executeThunk(duplicateCourseSectionQuery(section.id, courseBlockId), store.dispatch);

    await waitFor(() => {
      expect(getAllByTestId('section-card')).toHaveLength(4);
    });
  });
});
