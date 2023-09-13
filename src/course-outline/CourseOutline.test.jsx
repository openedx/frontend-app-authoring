import React from 'react';
import {
  render, waitFor, fireEvent, cleanup,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  getCourseBestPracticesApiUrl,
  getCourseLaunchApiUrl,
  getCourseOutlineIndexApiUrl,
  getCourseReindexApiUrl,
  getCourseSectionApiUrl,
  getCourseSectionDuplicateApiUrl,
  getEnableHighlightsEmailsApiUrl,
  getUpdateCourseSectionApiUrl,
} from './data/api';
import {
  deleteCourseSectionQuery,
  duplicateCourseSectionQuery,
  editCourseSectionQuery,
  enableCourseHighlightsEmailsQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  fetchCourseReindexQuery,
  fetchCourseSectionQuery,
  publishCourseSectionQuery,
  updateCourseSectionHighlightsQuery,
} from './data/thunk';
import initializeStore from '../store';
import {
  courseOutlineIndexMock,
  courseOutlineIndexWithoutSections,
  courseBestPracticesMock,
  courseLaunchMock,
} from './__mocks__';
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
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);
    await executeThunk(fetchCourseOutlineIndexQuery(courseId), store.dispatch);
  });

  it('render CourseOutline component correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    });
  });

  it('check reindex and render success alert is correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(200);
    await executeThunk(fetchCourseReindexQuery(courseId, courseOutlineIndexMock.reindexLink), store.dispatch);

    expect(getByText(messages.alertSuccessDescription.defaultMessage)).toBeInTheDocument();
  });

  it('render error alert after failed reindex correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl('some link'))
      .reply(500);
    await executeThunk(fetchCourseReindexQuery(courseId, 'some link'), store.dispatch);

    expect(getByText(messages.alertErrorTitle.defaultMessage)).toBeInTheDocument();
  });

  it('render checklist value correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseBestPracticesApiUrl({
        courseId, excludeGraded: true, all: true,
      }))
      .reply(200, courseBestPracticesMock);

    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId, gradedOnly: true, validateOras: true, all: true,
      }))
      .reply(200, courseLaunchMock);

    await executeThunk(fetchCourseLaunchQuery({
      courseId, gradedOnly: true, validateOras: true, all: true,
    }), store.dispatch);
    await executeThunk(fetchCourseBestPracticesQuery({
      courseId, excludeGraded: true, all: true,
    }), store.dispatch);

    expect(getByText('4/9 completed')).toBeInTheDocument();
  });

  it('check enable highlights when enable highlights query is successfully', async () => {
    cleanup();
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        ...courseOutlineIndexMock,
        highlightsEnabledForMessaging: false,
      });

    axiosMock
      .onPost(getEnableHighlightsEmailsApiUrl(courseId), {
        publish: 'republish',
        metadata: {
          highlights_enabled_for_messaging: true,
        },
      })
      .reply(200);

    await executeThunk(enableCourseHighlightsEmailsQuery(courseId), store.dispatch);
    expect(getByText('Enabled')).toBeInTheDocument();
  });

  it('should expand and collapse subsections, after click on subheader buttons', async () => {
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
    cleanup();
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexWithoutSections);

    const { getByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByTestId('empty-placeholder')).toBeInTheDocument();
    });
  });

  it('check edit section when edit query is successfully', async () => {
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

    axiosMock
      .onGet(getCourseSectionApiUrl(section.id))
      .reply(200);
    await executeThunk(fetchCourseSectionQuery(section.id), store.dispatch);

    await waitFor(() => {
      expect(getByText(section.displayName)).toBeInTheDocument();
    });
  });

  it('check delete section when edit query is successfully', async () => {
    const { queryByText } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[1];

    axiosMock.onDelete(getUpdateCourseSectionApiUrl(section.id)).reply(200);
    await executeThunk(deleteCourseSectionQuery(section.id), store.dispatch);

    await waitFor(() => {
      expect(queryByText(section.displayName)).not.toBeInTheDocument();
    });
  });

  it('check duplicate section when duplicate query is successfully', async () => {
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

  it('check publish section when publish query is successfully', async () => {
    cleanup();
    const { getAllByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];

    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        courseOutlineIndexMock,
        courseStructure: {
          childInfo: {
            children: [
              {
                ...section,
                published: false,
              },
            ],
          },
        },
      });

    axiosMock
      .onPost(getUpdateCourseSectionApiUrl(section.id), {
        publish: 'make_public',
      })
      .reply(200);

    await executeThunk(publishCourseSectionQuery(section.id), store.dispatch);

    axiosMock
      .onGet(getCourseSectionApiUrl(section.id))
      .reply(200, {
        ...section,
        published: true,
        releasedToStudents: false,
      });

    await executeThunk(fetchCourseSectionQuery(section.id), store.dispatch);

    const firstSection = getAllByTestId('section-card')[0];
    expect(firstSection.querySelector('.section-card-header__badge-status')).toHaveTextContent('Published not live');
  });

  it('check update highlights when update highlights query is successfully', async () => {
    const { getByRole } = render(<RootWrapper />);

    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const highlights = [
      'New Highlight 1',
      'New Highlight 2',
      'New Highlight 3',
      'New Highlight 4',
      'New Highlight 5',
    ];

    axiosMock
      .onPost(getUpdateCourseSectionApiUrl(section.id), {
        publish: 'republish',
        metadata: {
          highlights,
        },
      })
      .reply(200);

    await executeThunk(updateCourseSectionHighlightsQuery(section.id, highlights), store.dispatch);

    axiosMock
      .onGet(getCourseSectionApiUrl(section.id))
      .reply(200, {
        ...section,
        highlights,
      });

    await executeThunk(fetchCourseSectionQuery(section.id), store.dispatch);

    expect(getByRole('button', { name: '5 Section highlights' })).toBeInTheDocument();
  });
});
