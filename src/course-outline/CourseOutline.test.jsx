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
  getCourseBlockApiUrl,
  getCourseItemApiUrl,
  getXBlockBaseApiUrl,
  getClipboardUrl,
} from './data/api';
import { RequestStatus } from '../data/constants';
import {
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  updateCourseSectionHighlightsQuery,
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
import { COURSE_BLOCK_NAMES, VIDEO_SHARING_OPTIONS } from './constants';
import CourseOutline from './CourseOutline';
import messages from './messages';
import headerMessages from './header-navigations/messages';
import cardHeaderMessages from './card-header/messages';
import enableHighlightsModalMessages from './enable-highlights-modal/messages';
import statusBarMessages from './status-bar/messages';
import configureModalMessages from './configure-modal/messages';
import pasteButtonMessages from './paste-button/messages';
import subsectionMessages from './subsection-card/messages';

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

  it('check video sharing option udpates correctly', async () => {
    const { findByTestId } = render(<RootWrapper />);

    axiosMock
      .onPost(getCourseBlockApiUrl(courseId), {
        metadata: {
          video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
        },
      })
      .reply(200);
    const optionDropdownWrapper = await findByTestId('video-sharing-wrapper');
    const optionDropdown = await within(optionDropdownWrapper).findByRole('button');
    await act(async () => fireEvent.click(optionDropdown));
    const allOffOption = await within(optionDropdownWrapper).findByText(
      statusBarMessages.videoSharingAllOffText.defaultMessage,
    );
    await act(async () => fireEvent.click(allOffOption));

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
      metadata: {
        video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
      },
    }));
  });

  it('check video sharing option shows error on failure', async () => {
    const { findByTestId, queryByRole } = render(<RootWrapper />);

    axiosMock
      .onPost(getCourseBlockApiUrl(courseId), {
        metadata: {
          video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
        },
      })
      .reply(500);
    const optionDropdownWrapper = await findByTestId('video-sharing-wrapper');
    const optionDropdown = await within(optionDropdownWrapper).findByRole('button');
    await act(async () => fireEvent.click(optionDropdown));
    const allOffOption = await within(optionDropdownWrapper).findByText(
      statusBarMessages.videoSharingAllOffText.defaultMessage,
    );
    await act(async () => fireEvent.click(allOffOption));

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
      metadata: {
        video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
      },
    }));

    expect(queryByRole('alert')).toBeInTheDocument();
  });

  it('render error alert after failed reindex correctly', async () => {
    const { findByText, findByTestId } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(500);
    const reindexButton = await findByTestId('course-reindex');
    await act(async () => fireEvent.click(reindexButton));

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
    await act(async () => fireEvent.click(newSectionButton));

    elements = await findAllByTestId('section-card');
    expect(elements.length).toBe(5);
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalled();
  });

  it('adds new subsection correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const [section] = await findAllByTestId('section-card');
    let subsections = await within(section).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(2);
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
    expect(subsections.length).toBe(3);
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalled();
  });

  it('adds new unit correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const units = await within(subsectionElement).findAllByTestId('unit-card');
    expect(units.length).toBe(1);

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: 'some',
      });
    const newUnitButton = await within(subsectionElement).findByTestId('new-unit-button');
    await act(async () => fireEvent.click(newUnitButton));
    expect(axiosMock.history.post.length).toBe(1);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [subsection] = section.childInfo.children;
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
      parent_locator: subsection.id,
      category: COURSE_BLOCK_NAMES.vertical.id,
      display_name: COURSE_BLOCK_NAMES.vertical.name,
    }));
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
      .onPost(getCourseBlockApiUrl(courseId), {
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
    await act(async () => fireEvent.click(saveButton));
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

  it('check edit title works for section, subsection and unit', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const checkEditTitle = async (section, element, item, newName, elementName) => {
      axiosMock.reset();
      axiosMock
        .onPost(getCourseItemApiUrl(item.id, {
          metadata: {
            display_name: newName,
          },
        }))
        .reply(200, { dummy: 'value' });
      // mock section, subsection and unit name and check within the elements.
      // this is done to avoid adding conditions to this mock.
      axiosMock
        .onGet(getXBlockApiUrl(section.id))
        .reply(200, {
          ...section,
          display_name: newName,
          childInfo: {
            children: [
              {
                ...section.childInfo.children[0],
                display_name: newName,
                childInfo: {
                  children: [
                    {
                      ...section.childInfo.children[0].childInfo.children[0],
                      display_name: newName,
                    },
                  ],
                },
              },
            ],
          },
        });

      const editButton = await within(element).findByTestId(`${elementName}-edit-button`);
      fireEvent.click(editButton);
      const editField = await within(element).findByTestId(`${elementName}-edit-field`);
      fireEvent.change(editField, { target: { value: newName } });
      await act(async () => fireEvent.blur(editField));
      expect(
        axiosMock.history.post[axiosMock.history.post.length - 1].data,
        `Failed for ${elementName}!`,
      ).toBe(JSON.stringify({
        metadata: {
          display_name: newName,
        },
      }));
      const results = await within(element).findAllByText(newName);
      expect(results.length, `Failed for ${elementName}!`).toBeGreaterThan(0);
    };

    // check section
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    await checkEditTitle(section, sectionElement, section, 'New section name', 'section');

    // check subsection
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    await checkEditTitle(section, subsectionElement, subsection, 'New subsection name', 'subsection');

    // check unit
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');
    await checkEditTitle(section, unitElement, unit, 'New unit name', 'unit');
  });

  it('check whether section, subsection and unit is deleted when corresponding delete button is clicked', async () => {
    const { findAllByTestId, findByTestId, queryByText } = render(<RootWrapper />);
    // get section, subsection and unit
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    const checkDeleteBtn = async (item, element, elementName) => {
      await waitFor(() => {
        expect(queryByText(item.displayName), `Failed for ${elementName}!`).toBeInTheDocument();
      });

      axiosMock.onDelete(getCourseItemApiUrl(item.id)).reply(200);

      const menu = await within(element).findByTestId(`${elementName}-card-header__menu-button`);
      fireEvent.click(menu);
      const deleteButton = await within(element).findByTestId(`${elementName}-card-header__menu-delete-button`);
      fireEvent.click(deleteButton);
      const confirmButton = await findByTestId('delete-confirm-button');
      await act(async () => fireEvent.click(confirmButton));

      await waitFor(() => {
        expect(queryByText(item.displayName), `Failed for ${elementName}!`).not.toBeInTheDocument();
      });
    };

    // delete unit, subsection and then section in order.
    // check unit
    await checkDeleteBtn(unit, unitElement, 'unit');
    // check subsection
    await checkDeleteBtn(subsection, subsectionElement, 'subsection');
    // check section
    await checkDeleteBtn(section, sectionElement, 'section');
  });

  it('check whether section, subsection and unit is duplicated successfully', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get section, subsection and unit
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    const checkDuplicateBtn = async (item, parentElement, element, elementName, expectedLength) => {
      // baseline
      if (parentElement) {
        expect(
          await within(parentElement).findAllByTestId(`${elementName}-card`),
          `Failed for ${elementName}!`,
        ).toHaveLength(expectedLength - 1);
      } else {
        expect(
          await findAllByTestId(`${elementName}-card`),
          `Failed for ${elementName}!`,
        ).toHaveLength(expectedLength - 1);
      }

      const duplicatedItemId = item.id + elementName;
      axiosMock
        .onPost(getXBlockBaseApiUrl())
        .reply(200, {
          locator: duplicatedItemId,
        });
      if (elementName === 'section') {
        section.id = duplicatedItemId;
      } else if (elementName === 'subsection') {
        section.childInfo.children = [...section.childInfo.children, { ...subsection, id: duplicatedItemId }];
      } else if (elementName === 'unit') {
        subsection.childInfo.children = [...subsection.childInfo.children, { ...unit, id: duplicatedItemId }];
        section.childInfo.children = [subsection, ...section.childInfo.children.slice(1)];
      }
      axiosMock
        .onGet(getXBlockApiUrl(section.id))
        .reply(200, {
          ...section,
        });

      const menu = await within(element).findByTestId(`${elementName}-card-header__menu-button`);
      fireEvent.click(menu);
      const duplicateButton = await within(element).findByTestId(`${elementName}-card-header__menu-duplicate-button`);
      await act(async () => fireEvent.click(duplicateButton));
      if (parentElement) {
        expect(
          await within(parentElement).findAllByTestId(`${elementName}-card`),
          `Failed for ${elementName}!`,
        ).toHaveLength(expectedLength);
      } else {
        expect(
          await findAllByTestId(`${elementName}-card`),
          `Failed for ${elementName}!`,
        ).toHaveLength(expectedLength);
      }
    };

    // duplicate unit, subsection and then section in order.
    // check unit
    await checkDuplicateBtn(unit, subsectionElement, unitElement, 'unit', 2);
    // check subsection
    await checkDuplicateBtn(subsection, sectionElement, subsectionElement, 'subsection', 3);
    // check section
    await checkDuplicateBtn(section, null, sectionElement, 'section', 5);
  });

  it('check section, subsection & unit is published when publish button is clicked', async () => {
    const { findAllByTestId, findByTestId } = render(<RootWrapper />);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    const checkPublishBtn = async (item, element, elementName) => {
      expect(
        await within(element).findByTestId(`${elementName}-card-header__badge-status`),
        `Failed for ${elementName}!`,
      ).toHaveTextContent(cardHeaderMessages.statusBadgeDraft.defaultMessage);

      axiosMock
        .onPost(getCourseItemApiUrl(item.id), {
          publish: 'make_public',
        })
        .reply(200, { dummy: 'value' });

      let mockReturnValue = {
        ...section,
        childInfo: {
          children: [
            {
              ...section.childInfo.children[0],
              published: true,
            },
            ...section.childInfo.children.slice(1),
          ],
        },
      };
      if (elementName === 'unit') {
        mockReturnValue = {
          ...section,
          childInfo: {
            children: [
              {
                ...section.childInfo.children[0],
                childInfo: {
                  children: [
                    {
                      ...section.childInfo.children[0].childInfo.children[0],
                      published: true,
                    },
                    ...section.childInfo.children[0].childInfo.children.slice(1),
                  ],
                },
              },
              ...section.childInfo.children.slice(1),
            ],
          },
        };
      }
      axiosMock
        .onGet(getXBlockApiUrl(section.id))
        .reply(200, mockReturnValue);

      const menu = await within(element).findByTestId(`${elementName}-card-header__menu-button`);
      fireEvent.click(menu);
      const publishButton = await within(element).findByTestId(`${elementName}-card-header__menu-publish-button`);
      await act(async () => fireEvent.click(publishButton));
      const confirmButton = await findByTestId('publish-confirm-button');
      await act(async () => fireEvent.click(confirmButton));

      expect(
        await within(element).findByTestId(`${elementName}-card-header__badge-status`),
        `Failed for ${elementName}!`,
      ).toHaveTextContent(cardHeaderMessages.statusBadgePublishedNotLive.defaultMessage);
    };

    // publish unit, subsection and then section in order.
    // check unit
    await checkPublishBtn(unit, unitElement, 'unit');
    // check subsection
    await checkPublishBtn(subsection, subsectionElement, 'subsection');
    // section doesn't display badges
  });

  it('check configure modal for section', async () => {
    const { findByTestId, findAllByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const newReleaseDateIso = '2025-09-10T22:00:00Z';
    const newReleaseDate = '09/10/2025';
    axiosMock
      .onPost(getCourseItemApiUrl(section.id), {
        publish: 'republish',
        metadata: {
          visible_to_staff_only: true,
          start: newReleaseDateIso,
        },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        start: newReleaseDateIso,
      });

    const [firstSection] = await findAllByTestId('section-card');

    const sectionDropdownButton = await within(firstSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(sectionDropdownButton));
    const configureBtn = await within(firstSection).findByTestId('section-card-header__menu-configure-button');
    await act(async () => fireEvent.click(configureBtn));
    let releaseDateStack = await findByTestId('release-date-stack');
    let releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(releaseDatePicker).toHaveValue('08/10/2023');

    await act(async () => fireEvent.change(releaseDatePicker, { target: { value: newReleaseDate } }));
    expect(releaseDatePicker).toHaveValue(newReleaseDate);
    const saveButton = await findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
      publish: 'republish',
      metadata: {
        visible_to_staff_only: true,
        start: newReleaseDateIso,
      },
    }));

    await act(async () => fireEvent.click(sectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));
    releaseDateStack = await findByTestId('release-date-stack');
    releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(releaseDatePicker).toHaveValue(newReleaseDate);
  });

  it('check configure modal for subsection', async () => {
    const {
      findAllByTestId,
      findByTestId,
    } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const subsection = section.childInfo.children[0];
    const newReleaseDate = '2025-08-10T05:00:00Z';
    const newGraderType = 'Homework';
    const newDue = '2025-09-10T00:00:00Z';
    const isTimeLimited = true;
    const defaultTimeLimitMinutes = 3270;

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), {
        publish: 'republish',
        graderType: newGraderType,
        metadata: {
          visible_to_staff_only: null,
          due: newDue,
          hide_after_due: false,
          show_correctness: 'always',
          is_practice_exam: false,
          is_time_limited: isTimeLimited,
          exam_review_rules: '',
          is_proctored_enabled: false,
          default_time_limit_minutes: defaultTimeLimitMinutes,
          is_onboarding_exam: false,
          start: newReleaseDate,
        },
      })
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.start = newReleaseDate;
    subsection.due = newDue;
    subsection.format = newGraderType;
    subsection.isTimeLimited = isTimeLimited;
    subsection.defaultTimeLimitMinutes = defaultTimeLimitMinutes;
    section.childInfo.children[0] = subsection;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    fireEvent.click(subsectionDropdownButton);
    const configureBtn = await within(firstSubsection).findByTestId('subsection-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    expect(await within(configureModal).findByText(newGraderType)).toBeInTheDocument();
    let releaseDateStack = await within(configureModal).findByTestId('release-date-stack');
    let releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(releaseDatePicker, { target: { value: '08/10/2025' } });
    let dueDateStack = await within(configureModal).findByTestId('due-date-stack');
    let dueDatePicker = await within(dueDateStack).findByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(dueDatePicker, { target: { value: '09/10/2025' } });
    let graderTypeDropdown = await within(configureModal).findByTestId('grader-type-select');
    fireEvent.change(graderTypeDropdown, { target: { value: newGraderType } });

    let advancedTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.advancedTabTitle.defaultMessage });
    fireEvent.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(radioButtons[1]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '54:30' } });
    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    // verify request
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
      publish: 'republish',
      graderType: newGraderType,
      metadata: {
        visible_to_staff_only: null,
        due: newDue,
        hide_after_due: false,
        show_correctness: 'always',
        is_practice_exam: false,
        is_time_limited: isTimeLimited,
        exam_review_rules: '',
        is_proctored_enabled: false,
        default_time_limit_minutes: defaultTimeLimitMinutes,
        is_onboarding_exam: false,
        start: newReleaseDate,
      },
    }));

    // reopen modal and check values
    await act(async () => fireEvent.click(subsectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));

    configureModal = await findByTestId('configure-modal');
    releaseDateStack = await within(configureModal).findByTestId('release-date-stack');
    releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(releaseDatePicker).toHaveValue('08/10/2025');
    dueDateStack = await await within(configureModal).findByTestId('due-date-stack');
    dueDatePicker = await within(dueDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(dueDatePicker).toHaveValue('09/10/2025');
    graderTypeDropdown = await within(configureModal).findByTestId('grader-type-select');
    expect(graderTypeDropdown).toHaveValue(newGraderType);

    advancedTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.advancedTabTitle.defaultMessage });
    fireEvent.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('54:30');
  });

  it('check configure modal for unit', async () => {
    const { findAllByTestId, findByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const [subsection] = section.childInfo.children;
    const [unit] = subsection.childInfo.children;
    // Enrollment Track Groups : Audit
    const newGroupAccess = { 50: [1] };
    const isVisibleToStaffOnly = true;

    axiosMock
      .onPost(getCourseItemApiUrl(unit.id), {
        publish: 'republish',
        metadata: {
          visible_to_staff_only: isVisibleToStaffOnly,
          group_access: newGroupAccess,
        },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    const [firstSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(firstSection).findAllByTestId('subsection-card');
    const subsectionExpandButton = await within(firstSubsection).getByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(subsectionExpandButton);
    const [firstUnit] = await within(firstSubsection).findAllByTestId('unit-card');
    const unitDropdownButton = await within(firstUnit).findByTestId('unit-card-header__menu-button');

    // after configuraiton response
    unit.visibilityState = 'staff_only';
    unit.userPartitionInfo = {
      selectablePartitions: [
        {
          id: 50,
          name: 'Enrollment Track Groups',
          scheme: 'enrollment_track',
          groups: [
            {
              id: 2,
              name: 'Verified Certificate',
              selected: false,
              deleted: false,
            },
            {
              id: 1,
              name: 'Audit',
              selected: true,
              deleted: false,
            },
          ],
        },
      ],
      selectedPartitionIndex: 0,
    };
    subsection.childInfo.children[0] = unit;
    section.childInfo.children[0] = subsection;

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    fireEvent.click(unitDropdownButton);
    const configureBtn = await within(firstUnit).getByTestId('unit-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    let configureModal = await findByTestId('configure-modal');
    expect(await within(configureModal).findByText(
      configureModalMessages.unitVisibility.defaultMessage,
    )).toBeInTheDocument();
    let visibilityCheckbox = await within(configureModal).findByTestId('unit-visibility-checkbox');
    await act(async () => fireEvent.click(visibilityCheckbox));

    let groupeType = await within(configureModal).findByTestId('group-type-select');
    fireEvent.change(groupeType, { target: { value: '0' } });

    let checkboxes = await within(await within(configureModal).findByTestId('group-checkboxes')).findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    // reopen modal and check values
    await act(async () => fireEvent.click(unitDropdownButton));
    await act(async () => fireEvent.click(configureBtn));

    configureModal = await findByTestId('configure-modal');
    visibilityCheckbox = await within(configureModal).findByTestId('unit-visibility-checkbox');
    expect(visibilityCheckbox).toBeChecked();

    groupeType = await within(configureModal).findByTestId('group-type-select');
    expect(groupeType).toHaveValue('0');

    checkboxes = await within(await within(configureModal).findByTestId('group-checkboxes')).findAllByRole('checkbox');

    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
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

  it('check whether section move up and down options work correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get second section element
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const [, secondSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');

    // mock api call
    axiosMock
      .onPut(getCourseBlockApiUrl(courseBlockId))
      .reply(200, { dummy: 'value' });

    // find menu button and click on it to open menu
    const menu = await within(sectionElement).findByTestId('section-card-header__menu-button');
    fireEvent.click(menu);

    // move second section to first position to test move up option
    const moveUpButton = await within(sectionElement).findByTestId('section-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstSectionId = store.getState().courseOutline.sectionsList[0].id;
    expect(secondSection.id).toBe(firstSectionId);

    // move first section back to second position to test move down option
    const moveDownButton = await within(sectionElement).findByTestId('section-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    const newSecondSectionId = store.getState().courseOutline.sectionsList[1].id;
    expect(secondSection.id).toBe(newSecondSectionId);
  });

  it('check whether section move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get first, second and last section element
    const {
      0: firstSection, 1: secondSection, length, [length - 1]: lastSection,
    } = await findAllByTestId('section-card');

    // find menu button and click on it to open menu in first section
    const firstMenu = await within(firstSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(firstMenu));
    // move down option should be enabled in first element
    expect(
      await within(firstSection).findByTestId('section-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    // move up option should not be enabled in first element
    expect(
      await within(firstSection).findByTestId('section-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');

    // find menu button and click on it to open menu in second section
    const secondMenu = await within(secondSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(secondMenu));
    // both move down & up option should be enabled in second element
    expect(
      await within(secondSection).findByTestId('section-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    expect(
      await within(secondSection).findByTestId('section-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');

    // find menu button and click on it to open menu in last section
    const lastMenu = await within(lastSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last element
    expect(
      await within(lastSection).findByTestId('section-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    // move up option should be enabled in last element
    expect(
      await within(lastSection).findByTestId('section-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('check whether subsection move up and down options work correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get second section element
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const [, secondSubsection] = section.childInfo.children;
    const [, subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(store.getState().courseOutline.sectionsList[0].id))
      .reply(200, { dummy: 'value' });

    // find menu button and click on it to open menu
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move second subsection to first position to test move up option
    const moveUpButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstSubsectionId = store.getState().courseOutline.sectionsList[0].childInfo.children[0].id;
    expect(secondSubsection.id).toBe(firstSubsectionId);

    // move first section back to second position to test move down option
    const moveDownButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    const secondSubsectionId = store.getState().courseOutline.sectionsList[0].childInfo.children[1].id;
    expect(secondSubsection.id).toBe(secondSubsectionId);
  });

  it('check whether subsection move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // using second section as second section in mock has 3 subsections
    const [, sectionElement] = await findAllByTestId('section-card');
    // get first, second and last subsection element
    const {
      0: firstSubsection,
      1: secondSubsection,
      length,
      [length - 1]: lastSubsection,
    } = await within(sectionElement).findAllByTestId('subsection-card');

    // find menu button and click on it to open menu in first section
    const firstMenu = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(firstMenu));
    // move down option should be enabled in first element
    expect(
      await within(firstSubsection).findByTestId('subsection-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    // move up option should not be enabled in first element
    expect(
      await within(firstSubsection).findByTestId('subsection-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');

    // find menu button and click on it to open menu in second section
    const secondMenu = await within(secondSubsection).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(secondMenu));
    // both move down & up option should be enabled in second element
    expect(
      await within(secondSubsection).findByTestId('subsection-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    expect(
      await within(secondSubsection).findByTestId('subsection-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');

    // find menu button and click on it to open menu in last section
    const lastMenu = await within(lastSubsection).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last element
    expect(
      await within(lastSubsection).findByTestId('subsection-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    // move up option should be enabled in last element
    expect(
      await within(lastSubsection).findByTestId('subsection-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('check whether unit move up and down options work correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get second section -> second subsection -> second unit element
    const [, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [, subsection] = section.childInfo.children;
    const [, subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    const [, secondUnit] = subsection.childInfo.children;
    const [, unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(store.getState().courseOutline.sectionsList[1].childInfo.children[1].id))
      .reply(200, { dummy: 'value' });

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move second unit to first position to test move up option
    const moveUpButton = await within(unitElement).findByTestId('unit-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstUnitId = store.getState().courseOutline.sectionsList[1].childInfo.children[1].childInfo.children[0].id;
    expect(secondUnit.id).toBe(firstUnitId);

    // move first unit back to second position to test move down option
    const moveDownButton = await within(subsectionElement).findByTestId('unit-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    const secondUnitId = store.getState().courseOutline.sectionsList[1].childInfo.children[1].childInfo.children[1].id;
    expect(secondUnit.id).toBe(secondUnitId);
  });

  it('check whether unit move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // using second section -> second subsection as it has 5 units in mock.
    const [, sectionElement] = await findAllByTestId('section-card');
    const [, subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    // get first, second and last unit element
    const {
      0: firstUnit,
      1: secondUnit,
      length,
      [length - 1]: lastUnit,
    } = await within(subsectionElement).findAllByTestId('unit-card');

    // find menu button and click on it to open menu in first section
    const firstMenu = await within(firstUnit).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(firstMenu));
    // move down option should be enabled in first element
    expect(
      await within(firstUnit).findByTestId('unit-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    // move up option should not be enabled in first element
    expect(
      await within(firstUnit).findByTestId('unit-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');

    // find menu button and click on it to open menu in second section
    const secondMenu = await within(secondUnit).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(secondMenu));
    // both move down & up option should be enabled in second element
    expect(
      await within(secondUnit).findByTestId('unit-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    expect(
      await within(secondUnit).findByTestId('unit-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');

    // find menu button and click on it to open menu in last section
    const lastMenu = await within(lastUnit).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last element
    expect(
      await within(lastUnit).findByTestId('unit-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    // move up option should be enabled in last element
    expect(
      await within(lastUnit).findByTestId('unit-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('check that new section list is saved when dragged', async () => {
    const { findAllByRole } = render(<RootWrapper />);
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const sectionsDraggers = await findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = sectionsDraggers[7];

    axiosMock
      .onPut(getCourseBlockApiUrl(courseBlockId))
      .reply(200, { dummy: 'value' });

    const section1 = store.getState().courseOutline.sectionsList[0].id;

    fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });
    await waitFor(async () => {
      fireEvent.keyDown(draggableButton, { code: 'Space' });

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
    });

    const section2 = store.getState().courseOutline.sectionsList[1].id;
    expect(section1).toBe(section2);
  });

  it('check section list is restored to original order when API call fails', async () => {
    const { findAllByRole } = render(<RootWrapper />);
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const sectionsDraggers = await findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = sectionsDraggers[6];

    axiosMock
      .onPut(getCourseBlockApiUrl(courseBlockId))
      .reply(500);

    const section1 = store.getState().courseOutline.sectionsList[0].id;

    fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });
    await waitFor(async () => {
      fireEvent.keyDown(draggableButton, { code: 'Space' });

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.FAILED);
    });

    const section1New = store.getState().courseOutline.sectionsList[0].id;
    expect(section1).toBe(section1New);
  });

  it('check that new subsection list is saved when dragged', async () => {
    const { findAllByTestId } = render(<RootWrapper />);

    const [sectionElement] = await findAllByTestId('section-card');
    const [section] = store.getState().courseOutline.sectionsList;
    const subsectionsDraggers = within(sectionElement).getAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = subsectionsDraggers[1];

    axiosMock
      .onPut(getCourseItemApiUrl(section.id))
      .reply(200, { dummy: 'value' });

    const subsection1 = section.childInfo.children[0].id;

    fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });
    await waitFor(async () => {
      fireEvent.keyDown(draggableButton, { code: 'Space' });

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
    });

    const subsection2 = store.getState().courseOutline.sectionsList[0].childInfo.children[1].id;
    expect(subsection1).toBe(subsection2);
  });

  it('check that new subsection list is restored to original order when API call fails', async () => {
    const { findAllByTestId } = render(<RootWrapper />);

    const [sectionElement] = await findAllByTestId('section-card');
    const [section] = store.getState().courseOutline.sectionsList;
    const subsectionsDraggers = within(sectionElement).getAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = subsectionsDraggers[1];

    axiosMock
      .onPut(getCourseItemApiUrl(section.id))
      .reply(500);

    const subsection1 = section.childInfo.children[0].id;

    fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });
    await waitFor(async () => {
      fireEvent.keyDown(draggableButton, { code: 'Space' });

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.FAILED);
    });

    const subsection1New = store.getState().courseOutline.sectionsList[0].childInfo.children[0].id;
    expect(subsection1).toBe(subsection1New);
  });

  it('check that new unit list is saved when dragged', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const subsectionElement = (await findAllByTestId('subsection-card'))[3];
    const [subsection] = store.getState().courseOutline.sectionsList[1].childInfo.children;
    const expandBtn = within(subsectionElement).getByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const unitDraggers = await within(subsectionElement).findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = unitDraggers[1];

    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(200, { dummy: 'value' });

    const unit1 = subsection.childInfo.children[0].id;

    fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });
    await waitFor(async () => {
      fireEvent.keyDown(draggableButton, { code: 'Space' });

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
    });

    const unit2 = store.getState().courseOutline.sectionsList[1].childInfo.children[0].childInfo.children[1].id;
    expect(unit1).toBe(unit2);
  });

  it('check that new unit list is restored to original order when API call fails', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const subsectionElement = (await findAllByTestId('subsection-card'))[3];
    const [subsection] = store.getState().courseOutline.sectionsList[1].childInfo.children;
    const expandBtn = within(subsectionElement).getByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const unitDraggers = await within(subsectionElement).findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = unitDraggers[1];

    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(500);

    const unit1 = subsection.childInfo.children[0].id;

    fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });
    await waitFor(async () => {
      fireEvent.keyDown(draggableButton, { code: 'Space' });

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.FAILED);
    });

    const unit1New = store.getState().courseOutline.sectionsList[1].childInfo.children[0].childInfo.children[0].id;
    expect(unit1).toBe(unit1New);
  });

  it('check that drag handle is not visible for non-draggable sections', async () => {
    cleanup();
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        ...courseOutlineIndexMock,
        courseStructure: {
          ...courseOutlineIndexMock.courseStructure,
          childInfo: {
            ...courseOutlineIndexMock.courseStructure.childInfo,
            children: [
              {
                ...courseOutlineIndexMock.courseStructure.childInfo.children[0],
                actions: {
                  draggable: false,
                  childAddable: true,
                  deletable: true,
                  duplicable: true,
                },
              },
              ...courseOutlineIndexMock.courseStructure.childInfo.children.slice(1),
            ],
          },
        },
      });
    const { findAllByTestId } = render(<RootWrapper />);
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const [sectionElement] = await findAllByTestId('conditional-sortable-element--no-drag-handle');

    await waitFor(() => {
      expect(within(sectionElement).queryByText(section.displayName)).toBeInTheDocument();
    });
  });

  it('check whether unit copy & paste option works correctly', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get first section -> first subsection -> first unit element
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    let [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    const expectedClipboardContent = {
      content: {
        blockType: 'vertical',
        blockTypeDisplay: 'Unit',
        created: '2024-01-29T07:58:36.844249Z',
        displayName: unit.displayName,
        id: 15,
        olxUrl: 'http://localhost:18010/api/content-staging/v1/staged-content/15/olx',
        purpose: 'clipboard',
        status: 'ready',
        userId: 3,
      },
      sourceUsageKey: unit.id,
      sourceContexttitle: courseOutlineIndexMock.courseStructure.displayName,
      sourceEditUrl: unit.studioUrl,
    };
    // mock api call
    axiosMock
      .onPost(getClipboardUrl(), {
        usage_key: unit.id,
      }).reply(200, expectedClipboardContent);
    // check that initialUserClipboard state is empty
    const { initialUserClipboard } = store.getState().courseOutline;
    expect(initialUserClipboard).toBeUndefined();

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit back to second position to test move down option
    const copyButton = await within(unitElement).findByText(cardHeaderMessages.menuCopy.defaultMessage);
    await act(async () => fireEvent.click(copyButton));

    // check that initialUserClipboard state is updated
    expect(store.getState().courseOutline.initialUserClipboard).toEqual(expectedClipboardContent);

    [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    // find clipboard content label
    const clipboardLabel = await within(subsectionElement).findByText(
      pasteButtonMessages.clipboardContentLabel.defaultMessage,
    );
    await act(async () => fireEvent.mouseOver(clipboardLabel));

    // find clipboard content popup link
    expect(
      subsectionElement.querySelector('#vertical-paste-button-overlay'),
    ).toHaveAttribute('href', unit.studioUrl);

    // check paste button functionality
    // mock api call
    axiosMock
      .onPost(getXBlockBaseApiUrl(), {
        parent_locator: subsection.id,
        staged_content: 'clipboard',
      }).reply(200, { dummy: 'value' });
    const pasteBtn = await within(subsectionElement).findByText(subsectionMessages.pasteButton.defaultMessage);
    await act(async () => fireEvent.click(pasteBtn));

    [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const lastUnitElement = (await within(subsectionElement).findAllByTestId('unit-card')).slice(-1)[0];
    expect(lastUnitElement).toHaveTextContent(unit.displayName);
  });
});
