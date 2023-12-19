import React from 'react';
import {
  act, render, waitFor, cleanup, fireEvent, within,
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
  configureCourseSectionQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  updateCourseSectionHighlightsQuery,
  setSectionOrderListQuery,
  configureCourseSubsectionQuery,
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
import enableHighlightsModalMessages from './enable-highlights-modal/messages';

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
    const { findByText, findByTestId } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(200);
    const reindexButton = await findByTestId('course-reindex');
    fireEvent.click(reindexButton);

    expect(await findByText(messages.alertSuccessDescription.defaultMessage)).toBeInTheDocument();
  });

  it('render error alert after failed reindex correctly', async () => {
    const { findByText, findByTestId } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(500);
    const reindexButton = await findByTestId('course-reindex');
    await act(async () => {
      fireEvent.click(reindexButton);
    });

    expect(await findByText(messages.alertErrorTitle.defaultMessage)).toBeInTheDocument();
  });

  it('adds new section correctly', async () => {
    const { findAllByTestId, findByTestId } = render(<RootWrapper />);
    let elements = await findAllByTestId('section-card');
    window.HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      bottom: 4000,
    }));
    expect(elements.length).toBe(4);

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSectionMock.id,
      });
    axiosMock
      .onGet(getXBlockApiUrl(courseSectionMock.id))
      .reply(200, courseSectionMock);
    const newSectionButton = await findByTestId('new-section-button');
    await act(async () => {
      fireEvent.click(newSectionButton);
    });

    elements = await findAllByTestId('section-card');
    expect(elements.length).toBe(5);
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalled();
  });

  it('adds new subsection correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
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
    const newSubsectionButton = await within(section).findByTestId('new-subsection-button');
    await act(async () => {
      fireEvent.click(newSubsectionButton);
    });

    subsections = await within(section).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(2);
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalled();
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
    const { findByTestId, findByText } = render(<RootWrapper />);

    axiosMock.reset();
    axiosMock
      .onPost(getEnableHighlightsEmailsApiUrl(courseId), {
        publish: 'republish',
        metadata: {
          highlights_enabled_for_messaging: true,
        },
      })
      .reply(200);
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        ...courseOutlineIndexMock,
        courseStructure: {
          ...courseOutlineIndexMock.courseStructure,
          highlightsEnabledForMessaging: true,
        },
      });

    const enableButton = await findByTestId('highlights-enable-button');
    fireEvent.click(enableButton);
    const saveButton = await findByText(enableHighlightsModalMessages.submitButton.defaultMessage);
    await act(async () => {
      fireEvent.click(saveButton);
    });
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
    const { findAllByTestId, findByText } = render(<RootWrapper />);
    const newDisplayName = 'New section name';

    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;

    axiosMock
      .onPost(getCourseItemApiUrl(section.id, {
        metadata: {
          display_name: newDisplayName,
        },
      }))
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        display_name: newDisplayName,
      });

    const [sectionElement] = await findAllByTestId('section-card');
    const editButton = await within(sectionElement).findByTestId('section-edit-button');
    fireEvent.click(editButton);
    const editField = await within(sectionElement).findByTestId('section-edit-field');
    fireEvent.change(editField, { target: { value: newDisplayName } });
    await act(async () => {
      fireEvent.blur(editField);
    });

    expect(await findByText(newDisplayName)).toBeInTheDocument();
  });

  it('check whether section is deleted when delete button is clicked', async () => {
    const { findAllByTestId, findByTestId, queryByText } = render(<RootWrapper />);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    await waitFor(() => {
      expect(queryByText(section.displayName)).toBeInTheDocument();
    });

    axiosMock.onDelete(getCourseItemApiUrl(section.id)).reply(200);

    const [sectionElement] = await findAllByTestId('section-card');
    const menu = await within(sectionElement).findByTestId('section-card-header__menu-button');
    fireEvent.click(menu);
    const deleteButton = await within(sectionElement).findByTestId('section-card-header__menu-delete-button');
    fireEvent.click(deleteButton);
    const confirmButton = await findByTestId('delete-confirm-button');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(queryByText(section.displayName)).not.toBeInTheDocument();
    });
  });

  it('check whether subsection is deleted when delete button is clicked', async () => {
    const { findAllByTestId, findByTestId, queryByText } = render(<RootWrapper />);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [subsection] = section.childInfo.children;
    await waitFor(() => {
      expect(queryByText(subsection.displayName)).toBeInTheDocument();
    });

    axiosMock.onDelete(getCourseItemApiUrl(subsection.id)).reply(200);

    const [sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menu);
    const deleteButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-delete-button');
    fireEvent.click(deleteButton);
    const confirmButton = await findByTestId('delete-confirm-button');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(queryByText(subsection.displayName)).not.toBeInTheDocument();
    });
  });

  it('check whether section is duplicated successfully', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
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

    const [sectionElement] = await findAllByTestId('section-card');
    const menu = await within(sectionElement).findByTestId('section-card-header__menu-button');
    fireEvent.click(menu);
    const duplicateButton = await within(sectionElement).findByTestId('section-card-header__menu-duplicate-button');
    await act(async () => {
      fireEvent.click(duplicateButton);
    });
    expect(await findAllByTestId('section-card')).toHaveLength(5);
  });

  it('check whether subsection is duplicated successfully', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    let [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
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

    const menu = await within(subsections[0]).findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menu);
    const duplicateButton = await within(subsections[0]).findByTestId('subsection-card-header__menu-duplicate-button');
    await act(async () => {
      fireEvent.click(duplicateButton);
    });

    [sectionElement] = await findAllByTestId('section-card');
    subsections = await within(sectionElement).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(2);
  });

  it('check section is published when publish button is clicked', async () => {
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const { findAllByTestId, findByTestId } = render(<RootWrapper />);

    axiosMock
      .onPost(getCourseItemApiUrl(section.id), {
        publish: 'make_public',
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        published: true,
        releasedToStudents: false,
      });

    const [sectionElement] = await findAllByTestId('section-card');
    const menu = await within(sectionElement).findByTestId('section-card-header__menu-button');
    fireEvent.click(menu);
    const publishButton = await within(sectionElement).findByTestId('section-card-header__menu-publish-button');
    await act(async () => fireEvent.click(publishButton));
    const confirmButton = await findByTestId('publish-confirm-button');
    await act(async () => fireEvent.click(confirmButton));

    expect(
      sectionElement.querySelector('.item-card-header__badge-status'),
    ).toHaveTextContent(cardHeaderMessages.statusBadgePublishedNotLive.defaultMessage);
  });

  it('check configure section when configure query is successful', async () => {
    const { findAllByTestId, findByPlaceholderText } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const newReleaseDate = '2025-08-10T10:00:00Z';
    axiosMock
      .onPost(getCourseItemApiUrl(section.id), {
        publish: 'republish',
        metadata: {
          visible_to_staff_only: true,
          start: newReleaseDate,
        },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    const [firstSection] = await findAllByTestId('section-card');

    const sectionDropdownButton = await within(firstSection).findByTestId('section-card-header__menu-button');
    fireEvent.click(sectionDropdownButton);

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        start: newReleaseDate,
      });

    await executeThunk(configureCourseSectionQuery(section.id, true, newReleaseDate), store.dispatch);
    fireEvent.click(sectionDropdownButton);
    const configureBtn = await within(firstSection).findByTestId('section-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    const datePicker = await findByPlaceholderText('MM/DD/YYYY');
    expect(datePicker).toHaveValue('08/10/2025');
  });

  it('check configure subsection when configure subsection query is successful', async () => {
    const { findAllByTestId, findByText, findAllByPlaceholderText } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const subsection = section.childInfo.children[0];
    const newReleaseDate = '2025-08-10T10:00:00Z';

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), {
        publish: 'republish',
        graderType: 'notgraded',
        metadata: {
          visible_to_staff_only: true,
          due: null,
          hide_after_due: false,
          show_correctness: false,
          is_practice_exam: false,
          is_time_limited: false,
          exam_review_rules: '',
          is_proctored_enabled: false,
          default_time_limit_minutes: null,
          is_onboarding_exam: false,
          start: newReleaseDate,
        },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = firstSubsection.querySelector('#subsection-card-header__menu');
    expect(subsectionDropdownButton).toBeInTheDocument();

    subsection.start = newReleaseDate;
    section.childInfo.children[0] = subsection;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    await executeThunk(configureCourseSubsectionQuery(
      subsection.id,
      section.id,
      true,
      newReleaseDate,
      'notgraded',
      null,
      false,
      null,
      false,
      false,
    ), store.dispatch);
    fireEvent.click(subsectionDropdownButton);
    const configureBtn = await findByText(cardHeaderMessages.menuConfigure.defaultMessage);
    fireEvent.click(configureBtn);

    const datePicker = await findAllByPlaceholderText('MM/DD/YYYY');
    expect(datePicker[0]).toHaveValue('08/10/2025');
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
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        highlights,
      });

    await executeThunk(updateCourseSectionHighlightsQuery(section.id, highlights), store.dispatch);

    await waitFor(() => {
      expect(getByRole('button', { name: '5 Section highlights' })).toBeInTheDocument();
    });
  });

  it('check section list is ordered successfully', async () => {
    const { getAllByTestId } = render(<RootWrapper />);
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    let { children } = courseOutlineIndexMock.courseStructure.childInfo;
    children = children.splice(2, 0, children.splice(0, 1)[0]);

    axiosMock
      .onPut(getEnableHighlightsEmailsApiUrl(courseBlockId), { children })
      .reply(200, { dummy: 'value' });

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
      .onPut(getEnableHighlightsEmailsApiUrl(courseBlockId), { children })
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
