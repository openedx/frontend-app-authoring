import React from 'react';
import {
  render, waitFor, cleanup, fireEvent, within,
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
  getXBlockApiUrl,
  getEnableHighlightsEmailsApiUrl,
  getCourseItemApiUrl,
  getXBlockBaseApiUrl,
} from './data/api';
import {
  addNewSectionQuery,
  addNewSubsectionQuery,
  deleteCourseSectionQuery,
  deleteCourseSubsectionQuery,
  duplicateSectionQuery,
  duplicateSubsectionQuery,
  editCourseItemQuery,
  enableCourseHighlightsEmailsQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  fetchCourseReindexQuery,
  fetchCourseSectionQuery,
  publishCourseItemQuery,
  updateCourseSectionHighlightsQuery,
  setSectionOrderListQuery,
} from './data/thunk';
import initializeStore from '../store';
import {
  courseOutlineIndexMock,
  courseOutlineIndexWithoutSections,
  courseBestPracticesMock,
  courseLaunchMock,
  courseSectionMock,
  courseSubsectionMock,
} from './__mocks__';
import { executeThunk } from '../utils';
import CourseOutline from './CourseOutline';
import messages from './messages';
import headerMessages from './header-navigations/messages';
import cardHeaderMessages from './card-header/messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('../help-urls/hooks', () => ({
  useHelpUrls: () => ({
    contentHighlights: 'some',
    visibility: 'some',
    grading: 'some',
    outline: 'some',
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

  it('adds new section correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    let element = await findAllByTestId('section-card');
    window.HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      bottom: 4000,
    }));
    expect(element.length).toBe(4);

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSectionMock.id,
      });
    axiosMock
      .onGet(getXBlockApiUrl(courseSectionMock.id))
      .reply(200, courseSectionMock);
    await executeThunk(addNewSectionQuery(courseId), store.dispatch);

    element = await findAllByTestId('section-card');
    expect(element.length).toBe(5);
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalled();
  });

  it('adds new subsection correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const sectionId = courseOutlineIndexMock.courseStructure.childInfo.children[0].id;
    const [section] = await findAllByTestId('section-card');
    let subsections = await within(section).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(1);
    window.HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      bottom: 4000,
    }));

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSubsectionMock.id,
      });
    axiosMock
      .onGet(getXBlockApiUrl(courseSubsectionMock.id))
      .reply(200, courseSubsectionMock);
    await executeThunk(addNewSubsectionQuery(sectionId), store.dispatch);

    subsections = await within(section).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(2);
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalled();
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

  it('check highlights are enabled after enable highlights query is successful', async () => {
    const { findByTestId } = render(<RootWrapper />);

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
    expect(await findByTestId('highlights-enabled-span')).toBeInTheDocument();
  });

  it('should expand and collapse subsections, after click on subheader buttons', async () => {
    const { queryAllByTestId, findByText } = render(<RootWrapper />);

    const collapseBtn = await findByText(headerMessages.collapseAllButton.defaultMessage);
    expect(collapseBtn).toBeInTheDocument();
    fireEvent.click(collapseBtn);

    const expandBtn = await findByText(headerMessages.expandAllButton.defaultMessage);
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);

    await waitFor(() => {
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
      .onPost(getCourseItemApiUrl(section.id, {
        metadata: {
          display_name: newDisplayName,
        },
      }))
      .reply(200);

    await executeThunk(editCourseItemQuery(section.id, section.id, newDisplayName), store.dispatch);

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200);
    await executeThunk(fetchCourseSectionQuery(section.id), store.dispatch);

    await waitFor(() => {
      expect(getByText(section.displayName)).toBeInTheDocument();
    });
  });

  it('check whether section is deleted when delete query is successfully', async () => {
    const { queryByText } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[1];
    await waitFor(() => {
      expect(queryByText(section.displayName)).toBeInTheDocument();
    });

    axiosMock.onDelete(getCourseItemApiUrl(section.id)).reply(200);
    await executeThunk(deleteCourseSectionQuery(section.id), store.dispatch);

    await waitFor(() => {
      expect(queryByText(section.displayName)).not.toBeInTheDocument();
    });
  });

  it('check whether subsection is deleted when delete query is successfully', async () => {
    const { queryByText } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[1];
    const [subsection] = section.childInfo.children;
    await waitFor(() => {
      expect(queryByText(subsection.displayName)).toBeInTheDocument();
    });

    axiosMock.onDelete(getCourseItemApiUrl(subsection.id)).reply(200);
    await executeThunk(deleteCourseSubsectionQuery(subsection.id, section.id), store.dispatch);

    await waitFor(() => {
      expect(queryByText(subsection.displayName)).not.toBeInTheDocument();
    });
  });

  it('check whether section is duplicated successfully', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const sectionId = section.id;
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    expect(await findAllByTestId('section-card')).toHaveLength(4);

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSectionMock.id,
      });
    section.id = courseSectionMock.id;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
      });
    await executeThunk(duplicateSectionQuery(sectionId, courseBlockId), store.dispatch);

    expect(await findAllByTestId('section-card')).toHaveLength(5);
  });

  it('check whether subsection is duplicated successfully', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    let [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const subsectionId = subsection.id;
    let subsections = await within(sectionElement).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(1);

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSubsectionMock.id,
      });
    subsection.id = courseSubsectionMock.id;
    section.childInfo.children = [...section.childInfo.children, subsection];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
      });

    await executeThunk(duplicateSubsectionQuery(subsectionId, section.id), store.dispatch);

    [sectionElement] = await findAllByTestId('section-card');
    subsections = await within(sectionElement).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(2);
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
      .onPost(getCourseItemApiUrl(section.id), {
        publish: 'make_public',
      })
      .reply(200);

    await executeThunk(publishCourseItemQuery(section.id, section.id), store.dispatch);

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        published: true,
        releasedToStudents: false,
      });

    await executeThunk(fetchCourseSectionQuery(section.id), store.dispatch);

    const firstSection = getAllByTestId('section-card')[0];
    expect(firstSection.querySelector('.item-card-header__badge-status')).toHaveTextContent('Published not live');
  });

  it('check configure section when configure query is successful', async () => {
    cleanup();
    const { getAllByTestId, getByText, getByPlaceholderText } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const newReleaseDate = '2025-08-10T10:00:00Z';
    axiosMock
      .onPost(getCourseItemApiUrl(section.id), {
        id: section.id,
        data: null,
        metadata: {
          display_name: section.displayName,
          start: newReleaseDate,
          visible_to_staff_only: true,
        },
      })
      .reply(200);

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    await executeThunk(fetchCourseSectionQuery(section.id), store.dispatch);

    const firstSection = getAllByTestId('section-card')[0];

    const sectionDropdownButton = firstSection.querySelector('#section-card-header__menu');
    expect(sectionDropdownButton).toBeInTheDocument();
    fireEvent.click(sectionDropdownButton);

    const configureBtn = getByText(cardHeaderMessages.menuConfigure.defaultMessage);
    fireEvent.click(configureBtn);

    const datePicker = getByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(datePicker, { target: { value: '08/10/2025' } });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        start: newReleaseDate,
      });

    fireEvent.click(getByText('Save'));
    fireEvent.click(sectionDropdownButton);
    fireEvent.click(configureBtn);

    expect(datePicker).toHaveValue('08/10/2025');
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
      .onPost(getCourseItemApiUrl(section.id), {
        publish: 'republish',
        metadata: {
          highlights,
        },
      })
      .reply(200);

    await executeThunk(updateCourseSectionHighlightsQuery(section.id, highlights), store.dispatch);

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        highlights,
      });

    await executeThunk(fetchCourseSectionQuery(section.id), store.dispatch);

    expect(getByRole('button', { name: '5 Section highlights' })).toBeInTheDocument();
  });

  it('check section list is ordered successfully', async () => {
    const { getAllByTestId } = render(<RootWrapper />);
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    let { children } = courseOutlineIndexMock.courseStructure.childInfo;
    children = children.splice(2, 0, children.splice(0, 1)[0]);

    axiosMock
      .onPut(getEnableHighlightsEmailsApiUrl(courseBlockId), children)
      .reply(200);

    await executeThunk(setSectionOrderListQuery(courseBlockId, children, () => {}), store.dispatch);

    await waitFor(() => {
      expect(getAllByTestId('section-card')).toHaveLength(4);
      const newSections = getAllByTestId('section-card');
      for (let i; i < children.length; i++) {
        expect(children[i].id === newSections[i].id);
      }
    });
  });

  it('check section list is restored to original order when API call fails', async () => {
    const { getAllByTestId } = render(<RootWrapper />);
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const { children } = courseOutlineIndexMock.courseStructure.childInfo;
    const newChildren = children.splice(2, 0, children.splice(0, 1)[0]);

    axiosMock
      .onPut(getEnableHighlightsEmailsApiUrl(courseBlockId), undefined)
      .reply(500);

    await executeThunk(setSectionOrderListQuery(courseBlockId, undefined, () => children), store.dispatch);

    await waitFor(() => {
      expect(getAllByTestId('section-card')).toHaveLength(4);
      const newSections = getAllByTestId('section-card');
      for (let i; i < children.length; i++) {
        expect(children[i].id === newSections[i].id);
        expect(newChildren[i].id !== newSections[i].id);
      }
    });
  });
});
