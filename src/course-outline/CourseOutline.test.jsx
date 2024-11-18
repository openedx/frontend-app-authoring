import {
  act, render, waitFor, fireEvent, within, screen,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { getConfig, initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import { closestCorners } from '@dnd-kit/core';

import { useLocation } from 'react-router-dom';
import {
  getCourseBestPracticesApiUrl,
  getCourseLaunchApiUrl,
  getCourseOutlineIndexApiUrl,
  getCourseReindexApiUrl,
  getXBlockApiUrl,
  getCourseBlockApiUrl,
  getCourseItemApiUrl,
  getXBlockBaseApiUrl,
  exportTags,
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
import { clipboardUnit } from '../__mocks__';
import { executeThunk } from '../utils';
import { COURSE_BLOCK_NAMES, VIDEO_SHARING_OPTIONS } from './constants';
import CourseOutline from './CourseOutline';

import configureModalMessages from '../generic/configure-modal/messages';
import pasteButtonMessages from '../generic/clipboard/paste-component/messages';
import messages from './messages';
import { getClipboardUrl } from '../generic/data/api';
import headerMessages from './header-navigations/messages';
import cardHeaderMessages from './card-header/messages';
import enableHighlightsModalMessages from './enable-highlights-modal/messages';
import statusBarMessages from './status-bar/messages';
import subsectionMessages from './subsection-card/messages';
import pageAlertMessages from './page-alerts/messages';
import {
  moveSubsectionOver,
  moveUnitOver,
  moveSubsection,
  moveUnit,
} from '../generic/drag-helper/utils';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

global.BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('../help-urls/hooks', () => ({
  useHelpUrls: () => ({
    contentHighlights: 'some',
    visibility: 'some',
    grading: 'some',
    outline: 'some',
  }),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

jest.mock('./data/api', () => ({
  ...jest.requireActual('./data/api'),
  getTagsCount: () => jest.fn().mockResolvedValue({}),
}));

const queryClient = new QueryClient();

jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  // Since jsdom (used by jest) does not support getBoundingClientRect function
  // which is required for drag-n-drop calculations, we mock closestCorners fn
  // from dnd-kit to return collided elements as per the test. This allows us to
  // test all drag-n-drop handlers.
  closestCorners: jest.fn(),
}));

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RootWrapper = () => (
  <AppProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <CourseOutline courseId={courseId} />
      </IntlProvider>
    </QueryClientProvider>
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

    useLocation.mockReturnValue({
      pathname: mockPathname,
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);
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
    await executeThunk(fetchCourseOutlineIndexQuery(courseId), store.dispatch);
  });

  it('render CourseOutline component correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    });
  });

  it('handles course outline fetch api errors', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(500, 'some internal error');

    const { findByText, queryByRole } = render(<RootWrapper />);
    expect(await findByText('"some internal error"')).toBeInTheDocument();
    // check errors in store
    expect(store.getState().courseOutline.errors).toEqual({
      courseLaunchApi: null,
      outlineIndexApi: {
        data: '"some internal error"',
        dismissible: false,
        status: 500,
        type: 'serverError',
      },
      reindexApi: null,
      sectionLoadingApi: null,
    });

    expect(queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
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
    const { findByLabelText } = render(<RootWrapper />);

    axiosMock
      .onPost(getCourseBlockApiUrl(courseId), {
        metadata: {
          video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
        },
      })
      .reply(200);
    const optionDropdown = await findByLabelText(statusBarMessages.videoSharingTitle.defaultMessage);
    await act(
      async () => fireEvent.change(optionDropdown, { target: { value: VIDEO_SHARING_OPTIONS.allOff } }),
    );

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
      metadata: {
        video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
      },
    }));
  });

  it('check video sharing option shows error on failure', async () => {
    render(<RootWrapper />);

    axiosMock
      .onPost(getCourseBlockApiUrl(courseId), {
        metadata: {
          video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
        },
      })
      .reply(500);
    const optionDropdown = await screen.findByLabelText(statusBarMessages.videoSharingTitle.defaultMessage);
    await act(
      async () => fireEvent.change(optionDropdown, { target: { value: VIDEO_SHARING_OPTIONS.allOff } }),
    );

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({
      metadata: {
        video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
      },
    }));

    const alertElements = screen.queryAllByRole('alert');
    expect(alertElements.find(
      (el) => el.classList.contains('alert-content'),
    )).toHaveTextContent(
      pageAlertMessages.alertFailedGeneric.defaultMessage,
    );
  });

  it('render error alert after failed reindex correctly', async () => {
    const { findByText, findByTestId } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(500);
    const reindexButton = await findByTestId('course-reindex');
    await act(async () => fireEvent.click(reindexButton));

    expect(await findByText('Request failed with status code 500')).toBeInTheDocument();
  });

  it('check that new section list is saved when dragged', async () => {
    const { findAllByRole } = render(<RootWrapper />);
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const sectionsDraggers = await findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = sectionsDraggers[6];

    axiosMock
      .onPut(getCourseBlockApiUrl(courseBlockId))
      .reply(200, { dummy: 'value' });

    const section1 = store.getState().courseOutline.sectionsList[0].id;
    closestCorners.mockReturnValue([{ id: section1 }]);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await waitFor(async () => {
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
    closestCorners.mockReturnValue([{ id: section1 }]);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await waitFor(async () => {
      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.FAILED);
    });

    const section1New = store.getState().courseOutline.sectionsList[0].id;
    expect(section1).toBe(section1New);
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

    await executeThunk(fetchCourseLaunchQuery({
      courseId, gradedOnly: true, validateOras: true, all: true,
    }), store.dispatch);
    await executeThunk(fetchCourseBestPracticesQuery({
      courseId, excludeGraded: true, all: true,
    }), store.dispatch);

    expect(getByText('4/9 completed')).toBeInTheDocument();
  });

  it('render alerts if checklist api fails', async () => {
    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId, gradedOnly: true, validateOras: true, all: true,
      }))
      .reply(500);
    const { findByText, findByRole } = render(<RootWrapper />);

    await executeThunk(fetchCourseLaunchQuery({
      courseId, gradedOnly: true, validateOras: true, all: true,
    }), store.dispatch);

    expect(await findByText('Request failed with status code 500')).toBeInTheDocument();
    // check errors in store
    expect(store.getState().courseOutline.errors).toEqual({
      courseLaunchApi: {
        data: 'Request failed with status code 500',
        type: 'unknown',
        dismissible: true,
      },
      outlineIndexApi: null,
      reindexApi: null,
      sectionLoadingApi: null,
    });

    const dismissBtn = await findByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissBtn);
    expect(store.getState().courseOutline.errors).toEqual({
      courseLaunchApi: null,
      outlineIndexApi: null,
      reindexApi: null,
      sectionLoadingApi: null,
    });
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
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexWithoutSections);

    const { getByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByTestId('empty-placeholder')).toBeInTheDocument();
    });
  });

  it('render configuration alerts and check dismiss query', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        ...courseOutlineIndexMock,
        notificationDismissUrl: '/some/url',
      });

    render(<RootWrapper />);
    const alert = await screen.findByText(pageAlertMessages.configurationErrorTitle.defaultMessage);
    expect(alert).toBeInTheDocument();
    const dismissBtn = await screen.findByRole('button', { name: 'Dismiss' });
    axiosMock
      .onDelete('/some/url')
      .reply(204);
    fireEvent.click(dismissBtn);

    expect(axiosMock.history.delete.length).toBe(1);
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
    render(<RootWrapper />);
    // get section, subsection and unit
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await screen.findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    const checkDeleteBtn = async (item, element, elementName) => {
      await waitFor(() => {
        expect(screen.queryByText(item.displayName), `Failed for ${elementName}!`).toBeInTheDocument();
      });

      axiosMock.onDelete(getCourseItemApiUrl(item.id)).reply(200);

      const menu = await within(element).findByTestId(`${elementName}-card-header__menu-button`);
      fireEvent.click(menu);
      const deleteButton = await within(element).findByTestId(`${elementName}-card-header__menu-delete-button`);
      fireEvent.click(deleteButton);
      const confirmButton = await screen.findByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText(item.displayName), `Failed for ${elementName}!`).not.toBeInTheDocument();
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
        (await within(element).getAllByRole('status'))[0],
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
              visibilityState: 'live',
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
                      visibilityState: 'live',
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
        (await within(element).getAllByRole('status'))[0],
        `Failed for ${elementName}!`,
      ).toHaveTextContent(cardHeaderMessages.statusBadgeLive.defaultMessage);
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
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]);
    const [subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'Homework',
      isPrereq: false,
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '2025-09-10T05:00:00Z',
        hide_after_due: true,
        show_correctness: 'always',
        is_practice_exam: false,
        is_time_limited: true,
        is_proctored_enabled: false,
        exam_review_rules: '',
        default_time_limit_minutes: 3270,
        is_onboarding_exam: false,
        start: '2025-08-10T00:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.start = expectedRequestData.metadata.start;
    subsection.due = expectedRequestData.metadata.due;
    subsection.format = expectedRequestData.graderType;
    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.hideAfterDue = expectedRequestData.metadata.hideAfterDue;
    section.childInfo.children[0] = subsection;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    fireEvent.click(subsectionDropdownButton);
    const configureBtn = await within(firstSubsection).findByTestId('subsection-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    expect(await within(configureModal).findByText(expectedRequestData.graderType)).toBeInTheDocument();
    let releaseDateStack = await within(configureModal).findByTestId('release-date-stack');
    let releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(releaseDatePicker, { target: { value: '08/10/2025' } });
    let releaseDateTimePicker = await within(releaseDateStack).findByPlaceholderText('HH:MM');
    fireEvent.change(releaseDateTimePicker, { target: { value: '00:00' } });
    let dueDateStack = await within(configureModal).findByTestId('due-date-stack');
    let dueDatePicker = await within(dueDateStack).findByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(dueDatePicker, { target: { value: '09/10/2025' } });
    let dueDateTimePicker = await within(dueDateStack).findByPlaceholderText('HH:MM');
    fireEvent.change(dueDateTimePicker, { target: { value: '05:00' } });
    let graderTypeDropdown = await within(configureModal).findByTestId('grader-type-select');
    fireEvent.change(graderTypeDropdown, { target: { value: expectedRequestData.graderType } });

    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(visibilityRadioButtons[1]);

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
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await act(async () => fireEvent.click(subsectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));

    configureModal = await findByTestId('configure-modal');
    releaseDateStack = await within(configureModal).findByTestId('release-date-stack');
    releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(releaseDatePicker).toHaveValue('08/10/2025');
    releaseDateTimePicker = await within(releaseDateStack).findByPlaceholderText('HH:MM');
    expect(releaseDateTimePicker).toHaveValue('00:00');
    dueDateStack = await await within(configureModal).findByTestId('due-date-stack');
    dueDatePicker = await within(dueDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(dueDatePicker).toHaveValue('09/10/2025');
    dueDateTimePicker = await within(dueDateStack).findByPlaceholderText('HH:MM');
    expect(dueDateTimePicker).toHaveValue('05:00');
    graderTypeDropdown = await within(configureModal).findByTestId('grader-type-select');
    expect(graderTypeDropdown).toHaveValue(expectedRequestData.graderType);

    advancedTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.advancedTabTitle.defaultMessage });
    fireEvent.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('54:30');
  });

  it('check prereq and proctoring settings in configure modal for subsection', async () => {
    const {
      findAllByTestId,
      findByTestId,
    } = render(<RootWrapper />);
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]);
    const [subsection, secondSubsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      isPrereq: true,
      prereqUsageKey: secondSubsection.id,
      prereqMinScore: 80,
      prereqMinCompletion: 90,
      metadata: {
        visible_to_staff_only: true,
        due: '',
        hide_after_due: false,
        show_correctness: 'always',
        is_practice_exam: false,
        is_time_limited: true,
        is_proctored_enabled: true,
        exam_review_rules: 'some rules for proctored exams',
        default_time_limit_minutes: 30,
        is_onboarding_exam: false,
        start: '1970-01-01T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    subsection.isPrereq = expectedRequestData.isPrereq;
    subsection.prereq = expectedRequestData.prereqUsageKey;
    subsection.prereqMinScore = expectedRequestData.prereqMinScore;
    subsection.prereqMinCompletion = expectedRequestData.prereqMinCompletion;
    section.childInfo.children[0] = subsection;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    fireEvent.click(subsectionDropdownButton);
    const configureBtn = await within(firstSubsection).findByTestId('subsection-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );

    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(visibilityRadioButtons[2]);

    fireEvent.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(radioButtons[2]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '00:30' } });
    // select a prerequisite
    const prereqSelect = await within(configureModal).findByRole('combobox');
    fireEvent.change(prereqSelect, { target: { value: expectedRequestData.prereqUsageKey } });

    // update minimum score and completion percentage
    let prereqMinScoreInput = await within(configureModal).findByLabelText(
      configureModalMessages.minScoreLabel.defaultMessage,
    );
    fireEvent.change(prereqMinScoreInput, { target: { value: expectedRequestData.prereqMinScore } });
    let prereqMinCompletionInput = await within(configureModal).findByLabelText(
      configureModalMessages.minCompletionLabel.defaultMessage,
    );
    fireEvent.change(prereqMinCompletionInput, { target: { value: expectedRequestData.prereqMinCompletion } });

    // enable this subsection to be used as prerequisite by other subsections
    let prereqCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.prereqCheckboxLabel.defaultMessage,
    );
    fireEvent.click(prereqCheckbox);

    // fill some rules for proctored exams
    let examsRulesInput = await within(configureModal).findByLabelText(
      configureModalMessages.reviewRulesLabel.defaultMessage,
    );
    fireEvent.change(examsRulesInput, { target: { value: expectedRequestData.metadata.exam_review_rules } });

    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    // verify request
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await act(async () => fireEvent.click(subsectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.advancedTabTitle.defaultMessage,
    });
    fireEvent.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('00:30');
    prereqCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.prereqCheckboxLabel.defaultMessage,
    );
    expect(prereqCheckbox).toBeChecked();
    const prereqSelectOption = await within(configureModal).findByRole('option', { selected: true });
    expect(prereqSelectOption).toHaveAttribute('value', expectedRequestData.prereqUsageKey);
    examsRulesInput = await within(configureModal).findByLabelText(
      configureModalMessages.reviewRulesLabel.defaultMessage,
    );
    expect(examsRulesInput).toHaveTextContent(expectedRequestData.metadata.exam_review_rules);

    prereqMinScoreInput = await within(configureModal).findByLabelText(
      configureModalMessages.minScoreLabel.defaultMessage,
    );
    expect(prereqMinScoreInput).toHaveAttribute('value', `${expectedRequestData.prereqMinScore}`);
    prereqMinCompletionInput = await within(configureModal).findByLabelText(
      configureModalMessages.minCompletionLabel.defaultMessage,
    );
    expect(prereqMinCompletionInput).toHaveAttribute('value', `${expectedRequestData.prereqMinCompletion}`);
  });

  it('check practice proctoring settings in configure modal', async () => {
    const {
      findAllByTestId,
      findByTestId,
    } = render(<RootWrapper />);
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]);
    const [subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      isPrereq: false,
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '',
        hide_after_due: false,
        show_correctness: 'never',
        is_practice_exam: true,
        is_time_limited: true,
        is_proctored_enabled: true,
        exam_review_rules: '',
        default_time_limit_minutes: 30,
        is_onboarding_exam: false,
        start: '1970-01-01T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    section.childInfo.children[0] = subsection;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    fireEvent.click(subsectionDropdownButton);
    const configureBtn = await within(firstSubsection).findByTestId('subsection-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );
    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(visibilityRadioButtons[4]);

    // advancedTab
    fireEvent.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(radioButtons[3]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '00:30' } });

    // rules box should not be visible
    expect(within(configureModal).queryByLabelText(
      configureModalMessages.reviewRulesLabel.defaultMessage,
    )).not.toBeInTheDocument();

    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    // verify request
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await act(async () => fireEvent.click(subsectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.advancedTabTitle.defaultMessage });
    fireEvent.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', false);
    expect(radioButtons[3]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('00:30');
  });

  it('check onboarding proctoring settings in configure modal', async () => {
    const {
      findAllByTestId,
      findByTestId,
    } = render(<RootWrapper />);
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]);
    const [, subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      isPrereq: true,
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '',
        hide_after_due: false,
        show_correctness: 'past_due',
        is_practice_exam: false,
        is_time_limited: true,
        is_proctored_enabled: true,
        exam_review_rules: '',
        default_time_limit_minutes: 30,
        is_onboarding_exam: true,
        start: '2013-02-05T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [, secondSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(secondSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    section.childInfo.children[1] = subsection;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    fireEvent.click(subsectionDropdownButton);
    const configureBtn = await within(secondSubsection).findByTestId('subsection-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(visibilityRadioButtons[5]);

    // advancedTab
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );
    fireEvent.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(radioButtons[3]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '00:30' } });

    // rules box should not be visible
    expect(within(configureModal).queryByLabelText(
      configureModalMessages.reviewRulesLabel.defaultMessage,
    )).not.toBeInTheDocument();

    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    // verify request
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await act(async () => fireEvent.click(subsectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.advancedTabTitle.defaultMessage });
    fireEvent.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', false);
    expect(radioButtons[3]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('00:30');
  });

  it('check no special exam setting in configure modal', async () => {
    const {
      findAllByTestId,
      findByTestId,
    } = render(<RootWrapper />);
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[1]);
    const [subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '',
        hide_after_due: false,
        show_correctness: 'always',
        is_practice_exam: false,
        is_time_limited: false,
        is_proctored_enabled: false,
        exam_review_rules: '',
        default_time_limit_minutes: 0,
        is_onboarding_exam: false,
        start: '1970-01-01T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [, currentSection] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    section.childInfo.children[0] = subsection;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    fireEvent.click(subsectionDropdownButton);
    const configureBtn = await within(subsectionElement).findByTestId('subsection-card-header__menu-configure-button');
    fireEvent.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');

    // advancedTab
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );
    fireEvent.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    // time box should not be visible
    expect(within(configureModal).queryByLabelText(
      configureModalMessages.timeAllotted.defaultMessage,
    )).not.toBeInTheDocument();

    // rules box should not be visible
    expect(within(configureModal).queryByLabelText(
      configureModalMessages.reviewRulesLabel.defaultMessage,
    )).not.toBeInTheDocument();

    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    // verify request
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await act(async () => fireEvent.click(subsectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', { name: configureModalMessages.advancedTabTitle.defaultMessage });
    fireEvent.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', true);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', false);
    expect(radioButtons[3]).toHaveProperty('checked', false);
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
          discussion_enabled: false,
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
    unit.discussion_enabled = false;
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
      selectedGroupsLabel: '',
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
    let discussionCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.discussionEnabledCheckbox.defaultMessage,
    );
    expect(discussionCheckbox).toBeChecked();
    await act(async () => fireEvent.click(discussionCheckbox));

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
    discussionCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.discussionEnabledCheckbox.defaultMessage,
    );
    expect(discussionCheckbox).not.toBeChecked();

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
    const expectedSection = moveSubsection([
      ...courseOutlineIndexMock.courseStructure.childInfo.children,
    ], 0, 0, 1)[0][0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    // find menu button and click on it to open menu
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move second subsection to first position to test move up option
    const moveUpButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstSubsectionId = store.getState().courseOutline.sectionsList[0].childInfo.children[0].id;
    expect(secondSubsection.id).toBe(firstSubsectionId);

    // move first section back to second position to test move down option
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);
    const moveDownButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    const secondSubsectionId = store.getState().courseOutline.sectionsList[0].childInfo.children[1].id;
    expect(secondSubsection.id).toBe(secondSubsectionId);
  });

  it('check whether subsection move up to prev section if it is on top of its parent section', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const [firstSection, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(firstSection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveSubsectionOver([
      ...courseOutlineIndexMock.courseStructure.childInfo.children,
    ], 1, 0, 0, firstSection.childInfo.children.length + 1)[0];
    axiosMock
      .onGet(getXBlockApiUrl(firstSection.id))
      .reply(200, expectedSections[0]);
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first subsection in second section to last position of prev section
    const moveUpButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstSectionSubsections = store.getState().courseOutline.sectionsList[0].childInfo.children;
    expect(firstSectionSubsections.length).toBe(firstSection.childInfo.children.length + 1);
    const lastSubsectionFirstSection = firstSectionSubsections[firstSectionSubsections.length - 1].id;
    expect(subsection.id).toBe(lastSubsectionFirstSection);
    const subsectionsSecondSection = store.getState().courseOutline.sectionsList[1].childInfo.children;
    expect(subsectionsSecondSection.length).toBe(section.childInfo.children.length - 1);
  });

  it('check whether subsection move down to next section if it is in bottom position of its parent section', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    const [section, secondSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const lastSubsectionIdx = section.childInfo.children.length - 1;
    const subsection = section.childInfo.children[lastSubsectionIdx];
    const subsectionElement = (await within(sectionElement).findAllByTestId('subsection-card'))[lastSubsectionIdx];

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(secondSection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveSubsectionOver([
      ...courseOutlineIndexMock.courseStructure.childInfo.children,
    ], 0, lastSubsectionIdx, 1, 0)[0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[0]);
    axiosMock
      .onGet(getXBlockApiUrl(secondSection.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first subsection in second section to last position of prev section
    const moveDownBtn = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownBtn));
    const firstSectionSubsections = store.getState().courseOutline.sectionsList[0].childInfo.children;
    expect(firstSectionSubsections.length).toBe(section.childInfo.children.length - 1);
    const subsectionsSecondSection = store.getState().courseOutline.sectionsList[1].childInfo.children;
    expect(subsectionsSecondSection.length).toBe(secondSection.childInfo.children.length + 1);
    const firstSubSecondSection = subsectionsSecondSection[0].id;
    expect(subsection.id).toBe(firstSubSecondSection);
  });

  it('check whether subsection move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // using first section
    const sectionElements = await findAllByTestId('section-card');
    const firstSectionElement = sectionElements[0];
    // get first, second and last subsection element
    const [
      firstSubsection,
      secondSubsection,
    ] = await within(firstSectionElement).findAllByTestId('subsection-card');

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

    const lastSectionElement = sectionElements[sectionElements.length - 1];
    // get first, second and last subsection element
    const [lastSubsection] = await within(lastSectionElement).findAllByTestId('subsection-card');
    // find menu button and click on it to open menu in last section
    const lastMenu = await within(lastSubsection).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last subsection of last section element
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
    const expectedSection = moveUnit([...courseOutlineIndexMock.courseStructure.childInfo.children], 1, 1, 0, 1)[0][1];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move second unit to first position to test move up option
    const moveUpButton = await within(unitElement).findByTestId('unit-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstUnitId = store.getState().courseOutline.sectionsList[1].childInfo.children[1].childInfo.children[0].id;
    expect(secondUnit.id).toBe(firstUnitId);

    // move first unit back to second position to test move down option
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);
    const moveDownButton = await within(subsectionElement).findByTestId('unit-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    const secondUnitId = store.getState().courseOutline.sectionsList[1].childInfo.children[1].childInfo.children[1].id;
    expect(secondUnit.id).toBe(secondUnitId);
  });

  it('check whether unit moves up to previous subsection if it is in top position in parent subsection', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get second section -> second subsection -> first unit element
    const [, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [firstSubsection, subsection] = section.childInfo.children;
    const [, subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(firstSubsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver([
      ...courseOutlineIndexMock.courseStructure.childInfo.children,
    ], 1, 1, 0, 1, 0, firstSubsection.childInfo.children.length)[0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveUpButton = await within(unitElement).findByTestId('unit-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstSubUnits = store.getState().courseOutline.sectionsList[1].childInfo.children[0].childInfo.children;
    expect(firstSubUnits[firstSubUnits.length - 1].id).toBe(unit.id);
    const secondSubUnits = store.getState().courseOutline.sectionsList[1].childInfo.children[1].childInfo.children;
    expect(secondSubUnits.length).toBe(subsection.childInfo.children.length - 1);
  });

  it('check whether unit moves up to previous subsection of prev section if it is in top position in parent subsection & section', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get second section -> second subsection -> first unit element
    const [firstSection, secondSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [subsection] = secondSection.childInfo.children;
    const firstSectionLastSubsection = firstSection.childInfo.children[firstSection.childInfo.children.length - 1];
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(firstSectionLastSubsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver(
      [...courseOutlineIndexMock.courseStructure.childInfo.children],
      1,
      0,
      0,
      0,
      firstSection.childInfo.children.length - 1,
      firstSectionLastSubsection.childInfo.children.length,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(firstSection.id))
      .reply(200, expectedSections[0]);
    axiosMock
      .onGet(getXBlockApiUrl(secondSection.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveUpButton = await within(unitElement).findByTestId('unit-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    const firstSectionSubStore = store.getState().courseOutline.sectionsList[0].childInfo.children;
    const firstSectionLastSubUnits = firstSectionSubStore[firstSectionSubStore.length - 1].childInfo.children;
    expect(firstSectionLastSubUnits[firstSectionLastSubUnits.length - 1].id).toBe(unit.id);
    const secondSubUnits = store.getState().courseOutline.sectionsList[1].childInfo.children[0].childInfo.children;
    expect(secondSubUnits.length).toBe(subsection.childInfo.children.length - 1);
  });

  it('check whether unit moves down to next subsection if it is in last position in parent subsection', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get second section -> second subsection -> first unit element
    const [, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [firstSubsection, subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    const lastUnitIdx = firstSubsection.childInfo.children.length - 1;
    const unit = firstSubsection.childInfo.children[lastUnitIdx];
    const unitElement = (await within(subsectionElement).findAllByTestId('unit-card'))[lastUnitIdx];

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver([
      ...courseOutlineIndexMock.courseStructure.childInfo.children,
    ], 1, 0, lastUnitIdx, 1, 1, 0)[0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveDownButton = await within(unitElement).findByTestId('unit-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    const firstSubUnits = store.getState().courseOutline.sectionsList[1].childInfo.children[0].childInfo.children;
    expect(firstSubUnits.length).toBe(firstSubsection.childInfo.children.length - 1);
    const secondSubUnits = store.getState().courseOutline.sectionsList[1].childInfo.children[1].childInfo.children;
    expect(secondSubUnits[0].id).toBe(unit.id);
  });

  it('check whether unit moves down to next subsection of next section if it is in last position in parent subsection & section', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get second section -> second subsection -> first unit element
    const [, secondSection, thirdSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const lastSubIndex = secondSection.childInfo.children.length - 1;
    const secondSectionLastSubsection = secondSection.childInfo.children[lastSubIndex];
    const thirdSectionFirstSubsection = thirdSection.childInfo.children[0];
    const subsectionElement = (await within(sectionElement).findAllByTestId('subsection-card'))[lastSubIndex];
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    const lastUnitIdx = secondSectionLastSubsection.childInfo.children.length - 1;
    const unit = secondSectionLastSubsection.childInfo.children[lastUnitIdx];
    const unitElement = (await within(subsectionElement).findAllByTestId('unit-card'))[lastUnitIdx];

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(thirdSectionFirstSubsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver(
      [...courseOutlineIndexMock.courseStructure.childInfo.children],
      1,
      lastSubIndex,
      lastUnitIdx,
      2,
      0,
      0,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(secondSection.id))
      .reply(200, expectedSections[1]);
    axiosMock
      .onGet(getXBlockApiUrl(thirdSection.id))
      .reply(200, expectedSections[2]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveDownButton = await within(unitElement).findByTestId('unit-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    const secondSectionSubStore = store.getState().courseOutline.sectionsList[1].childInfo.children;
    const secondSectionLastSubUnits = secondSectionSubStore[secondSectionSubStore.length - 1].childInfo.children;
    expect(secondSectionLastSubUnits.length).toBe(secondSectionLastSubsection.childInfo.children.length - 1);
    const thirdSubUnits = store.getState().courseOutline.sectionsList[2].childInfo.children[0].childInfo.children;
    expect(thirdSubUnits[0].id).toBe(unit.id);
  });

  it('check whether unit move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // using first section -> first subsection -> first unit
    const sections = await findAllByTestId('section-card');
    const [sectionElement] = sections;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    // get first and only unit in the subsection
    const [firstUnit] = await within(subsectionElement).findAllByTestId('unit-card');

    // find menu button and click on it to open menu in first section
    const firstMenu = await within(firstUnit).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(firstMenu));
    // move down option should be enabled in first element as it can move down to next subsection
    expect(
      await within(firstUnit).findByTestId('unit-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    // move up option should not be enabled in first element as we have no subsections or sections above
    expect(
      await within(firstUnit).findByTestId('unit-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');

    // using last section -> last subsection -> last unit
    const lastSection = sections[sections.length - 1];
    // it has only one subsection
    const [lastSubsectionElement] = await within(lastSection).findAllByTestId('subsection-card');
    const lastExpandBtn = await within(lastSubsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(lastExpandBtn));
    // get last and the only unit in the subsection
    const [lastUnit] = await within(lastSubsectionElement).findAllByTestId('unit-card');

    // find menu button and click on it to open menu in first section
    const lastMenu = await within(lastUnit).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last element as we have no subsections or sections below
    expect(
      await within(lastUnit).findByTestId('unit-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    // move down option should be enabled in last element as it can move up to prev section's last subsection
    expect(
      await within(lastUnit).findByTestId('unit-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('check that new subsection list is saved when dragged', async () => {
    const { findAllByTestId } = render(<RootWrapper />);

    const [sectionElement] = await findAllByTestId('section-card');
    const [section] = store.getState().courseOutline.sectionsList;
    const subsectionsDraggers = within(sectionElement).getAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = subsectionsDraggers[1];
    const subsection1 = section.childInfo.children[0].id;
    closestCorners.mockReturnValue([{ id: subsection1 }]);
    axiosMock
      .onPut(getCourseItemApiUrl(section.id))
      .reply(200, { dummy: 'value' });
    const expectedSection = moveSubsection([
      ...courseOutlineIndexMock.courseStructure.childInfo.children,
    ], 0, 1, 0)[0][0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await waitFor(async () => {
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
    const subsection1 = section.childInfo.children[0].id;
    closestCorners.mockReturnValue([{ id: subsection1 }]);

    axiosMock
      .onPut(getCourseItemApiUrl(section.id))
      .reply(500);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await waitFor(async () => {
      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.FAILED);
    });

    const subsection1New = store.getState().courseOutline.sectionsList[0].childInfo.children[0].id;
    expect(subsection1).toBe(subsection1New);
  });

  it('check that new unit list is saved when dragged', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get third section
    const [, , sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const section = store.getState().courseOutline.sectionsList[2];
    const [subsection] = section.childInfo.children;
    const expandBtn = within(subsectionElement).getByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const unitDraggers = await within(subsectionElement).findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = unitDraggers[1];
    const sections = courseOutlineIndexMock.courseStructure.childInfo.children;

    const unit1 = subsection.childInfo.children[0].id;
    closestCorners.mockReturnValue([{ id: unit1 }]);

    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSection = moveUnit([...sections], 2, 0, 1, 0)[0][2];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await waitFor(async () => {
      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
    });

    const unit2 = store.getState().courseOutline.sectionsList[2].childInfo.children[0].childInfo.children[1].id;
    expect(unit1).toBe(unit2);
  });

  it('check that new unit list is restored to original order when API call fails', async () => {
    const { findAllByTestId } = render(<RootWrapper />);
    // get third section
    const [, , sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const section = store.getState().courseOutline.sectionsList[2];
    const [subsection] = section.childInfo.children;
    const expandBtn = within(subsectionElement).getByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const unitDraggers = await within(subsectionElement).findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = unitDraggers[1];
    const sections = courseOutlineIndexMock.courseStructure.childInfo.children;

    const unit1 = subsection.childInfo.children[0].id;
    closestCorners.mockReturnValue([{ id: unit1 }]);

    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(500);
    const expectedSection = moveUnit([...sections], 2, 0, 1, 0)[0][2];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await waitFor(async () => {
      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.FAILED);
    });

    const unit1New = store.getState().courseOutline.sectionsList[2].childInfo.children[0].childInfo.children[0].id;
    expect(unit1).toBe(unit1New);
  });

  it('check whether unit copy & paste option works correctly', async () => {
    render(<RootWrapper />);
    // get first section -> first subsection -> first unit element
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await screen.findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, courseSectionMock);
    let [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    await act(async () => fireEvent.click(expandBtn));
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPost(getClipboardUrl(), {
        usage_key: unit.id,
      }).reply(200, clipboardUnit);
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
    expect(store.getState().generic.clipboardData).toEqual(clipboardUnit);

    [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    // find clipboard content label
    const clipboardLabel = await within(subsectionElement).findByText(
      pasteButtonMessages.pasteButtonWhatsInClipboardText.defaultMessage,
    );
    await act(async () => fireEvent.mouseOver(clipboardLabel));

    // find clipboard content popover link
    const popoverContent = screen.queryByTestId('popover-content');
    expect(popoverContent.tagName).toBe('A');
    expect(popoverContent).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${unit.studioUrl}`);

    // check paste button functionality
    // mock api call
    axiosMock
      .onPost(getXBlockBaseApiUrl(), {
        parent_locator: subsection.id,
        staged_content: 'clipboard',
      }).reply(200, {
        staticFileNotices: {
          newFiles: ['some.css'],
          conflictingFiles: ['con.css'],
          errorFiles: ['error.css'],
        },
      });
    const pasteBtn = await within(subsectionElement).findByText(subsectionMessages.pasteButton.defaultMessage);
    await act(async () => fireEvent.click(pasteBtn));

    [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const lastUnitElement = (await within(subsectionElement).findAllByTestId('unit-card')).slice(-1)[0];
    expect(lastUnitElement).toHaveTextContent(unit.displayName);

    // check pasteFileNotices in store
    expect(store.getState().courseOutline.pasteFileNotices).toEqual({
      newFiles: ['some.css'],
      conflictingFiles: ['con.css'],
      errorFiles: ['error.css'],
    });

    let alerts = await screen.findAllByRole('alert');
    // Exclude processing notification toast
    alerts = alerts.filter((el) => !el.classList.contains('toast-container'));
    // 3 alerts should be present
    expect(alerts.length).toEqual(3);

    // check alerts for errorFiles
    let dismissBtn = await within(alerts[0]).findByText('Dismiss');
    fireEvent.click(dismissBtn);

    // check alerts for conflictingFiles
    dismissBtn = await within(alerts[1]).findByText('Dismiss');
    fireEvent.click(dismissBtn);

    // check alerts for newFiles
    dismissBtn = await within(alerts[2]).findByText('Dismiss');
    fireEvent.click(dismissBtn);

    // check pasteFileNotices in store
    expect(store.getState().courseOutline.pasteFileNotices).toEqual({});
  });

  it('should show toats on export tags', async () => {
    const expectedResponse = 'this is a test';
    axiosMock
      .onGet(exportTags(courseId))
      .reply(200, expectedResponse);
    useLocation.mockReturnValue({
      pathname: '/foo-bar',
      hash: '#export-tags',
    });
    window.URL.createObjectURL = jest.fn().mockReturnValue('http://example.com/archivo');
    window.URL.revokeObjectURL = jest.fn();
    render(<RootWrapper />);
    expect(await screen.findByText('Please wait. Creating export file for course tags...')).toBeInTheDocument();

    const expectedRequest = axiosMock.history.get.filter(request => request.url === exportTags(courseId));
    expect(expectedRequest.length).toBe(1);

    expect(await screen.findByText('Course tags exported successfully')).toBeInTheDocument();
  });

  it('should show toast on export tags error', async () => {
    axiosMock
      .onGet(exportTags(courseId))
      .reply(404);
    useLocation.mockReturnValue({
      pathname: '/foo-bar',
      hash: '#export-tags',
    });

    render(<RootWrapper />);
    expect(await screen.findByText('Please wait. Creating export file for course tags...')).toBeInTheDocument();
    expect(await screen.findByText('An error has occurred creating the file')).toBeInTheDocument();
  });

  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(403);

    const { getByRole } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByRole('alert')).toBeInTheDocument();
      const { outlineIndexLoadingStatus } = store.getState().courseOutline.loadingStatus;
      expect(outlineIndexLoadingStatus).toEqual(RequestStatus.DENIED);
    });
  });
});
