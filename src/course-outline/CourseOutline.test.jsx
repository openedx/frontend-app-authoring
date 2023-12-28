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
  getCourseBlockApiUrl,
  getCourseItemApiUrl,
  getXBlockBaseApiUrl,
  getChapterBlockApiUrl,
} from './data/api';
import { RequestStatus } from '../data/constants';
import {
  configureCourseSectionQuery,
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
import { COURSE_BLOCK_NAMES } from './constants';
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

      let mockReturnValue = { ...section, published: true };
      if (elementName === 'subsection') {
        mockReturnValue = {
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
      } else if (elementName === 'unit') {
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
    // check section
    await checkPublishBtn(section, sectionElement, 'section');
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

  it('check that new section list is saved when dragged', async () => {
    const { getAllByRole } = render(<RootWrapper />);

    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    await waitFor(async () => {
      const sectionsDraggers = await getAllByRole('button', { name: 'Drag to reorder' });

      axiosMock
        .onPut(getCourseBlockApiUrl(courseBlockId))
        .reply(200, { dummy: 'value' });

      const section1 = store.getState().courseOutline.sectionsList[0].id;
      const draggableButton = sectionsDraggers[7];
      await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));
      await act(async () => fireEvent.keyDown(draggableButton, { key: 'ArrowUp' }));
      await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);

      const section2 = store.getState().courseOutline.sectionsList[1].id;
      expect(section1).toBe(section2);
    });
  });

  it('check section list is restored to original order when API call fails', async () => {
    const { getAllByRole } = render(<RootWrapper />);

    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    await waitFor(async () => {
      const sectionsDraggers = await getAllByRole('button', { name: 'Drag to reorder' });

      axiosMock
        .onPut(getCourseBlockApiUrl(courseBlockId))
        .reply(500);

      const section1 = store.getState().courseOutline.sectionsList[0].id;
      const draggableButton = sectionsDraggers[6];
      await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));
      await act(async () => fireEvent.keyDown(draggableButton, { key: 'ArrowUp' }));
      await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));

      const saveStatus = store.getState().courseOutline.savingStatus;
      expect(saveStatus).toEqual(RequestStatus.FAILED);

      const section1New = store.getState().courseOutline.sectionsList[0].id;
      expect(section1).toBe(section1New);
    });
  });

  it('check that new subsection list is saved when dragged', async () => {
    const { findAllByTestId } = render(<RootWrapper />);

    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const [section] = await findAllByTestId('section-card');
    const subsectionsDraggers = within(section).getAllByRole('button', { name: 'Drag to reorder' });

    axiosMock
      .onPut(getChapterBlockApiUrl(courseBlockId, store.getState().courseOutline.sectionsList[0].id))
      .reply(200, { dummy: 'value' });

    const subsection1 = store.getState().courseOutline.sectionsList[0].childInfo.children[0].id;

    // Move the second subsection up
    const draggableButton = subsectionsDraggers[1];
    await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));
    await act(async () => fireEvent.keyDown(draggableButton, { key: 'ArrowUp' }));
    await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));

    const saveStatus = store.getState().courseOutline.savingStatus;
    expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);

    const subsection2 = store.getState().courseOutline.sectionsList[0].childInfo.children[1].id;
    expect(subsection1).toBe(subsection2);
  });

  it('check that new subsection list is restored to original order when API call fails', async () => {
    const { findAllByTestId } = render(<RootWrapper />);

    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const [section] = await findAllByTestId('section-card');
    const subsectionsDraggers = within(section).getAllByRole('button', { name: 'Drag to reorder' });

    axiosMock
      .onPut(getChapterBlockApiUrl(courseBlockId, store.getState().courseOutline.sectionsList[0].id))
      .reply(500);

    const subsection1 = store.getState().courseOutline.sectionsList[0].childInfo.children[0].id;

    // Move the second subsection up
    const draggableButton = subsectionsDraggers[1];
    await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));
    await act(async () => fireEvent.keyDown(draggableButton, { key: 'ArrowUp' }));
    await act(async () => fireEvent.keyDown(draggableButton, { code: 'Space' }));

    const saveStatus = store.getState().courseOutline.savingStatus;
    expect(saveStatus).toEqual(RequestStatus.FAILED);

    const subsection1New = store.getState().courseOutline.sectionsList[0].childInfo.children[0].id;
    expect(subsection1).toBe(subsection1New);
  });
});
