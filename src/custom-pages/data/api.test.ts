import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMocks } from '@src/testUtils';
import { paginatedListPage } from '@src/generic/data/paginatedList';

import {
  getCustomPages,
  getCustomPagesApiUrl,
  getCustomPageOrderApiUrl,
  updateCustomPageOrder,
} from './api';

let axiosMock;
const courseId = 'course-v1:edX+DemoX+Demo_Course';

const customPageMock = (urlSlug: string, name: string) => ({
  type: 'static_tab',
  title: null,
  is_hideable: false,
  is_hidden: false,
  is_movable: true,
  course_staff_only: false,
  name,
  tab_id: `static_tab_${urlSlug}`,
  settings: { url_slug: urlSlug },
  id: `block-v1:edX+DemoX+Demo_Course+type@static_tab+block@${urlSlug}`,
});

describe('getCustomPages', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });

  it('should fetch the custom pages of the course, converting the server\'s snake_case keys', async () => {
    axiosMock
      .onGet(getCustomPagesApiUrl())
      .reply(200, paginatedListPage([customPageMock('1', 'Syllabus')]));

    const result = await getCustomPages(courseId);

    expect(result).toEqual([{
      type: 'static_tab',
      title: null,
      isHideable: false,
      isHidden: false,
      isMovable: true,
      courseStaffOnly: false,
      name: 'Syllabus',
      tabId: 'static_tab_1',
      settings: { urlSlug: '1' },
      id: 'block-v1:edX+DemoX+Demo_Course+type@static_tab+block@1',
    }]);
    expect(axiosMock.history.get[0].url).toEqual('http://localhost:18010/api/authoring/v1/custom_pages/');
    expect(axiosMock.history.get[0].params).toEqual({ course_key: courseId, page: 1, page_size: 100 });
  });

  it('should percent-encode the course key in the query string', async () => {
    axiosMock.onGet(getCustomPagesApiUrl()).reply(200, paginatedListPage([]));

    await getCustomPages(courseId);

    expect(getAuthenticatedHttpClient().getUri(axiosMock.history.get[0])).toContain(
      'course_key=course-v1:edX%2BDemoX%2BDemo_Course',
    );
  });

  it('should return the custom pages of every page, in order', async () => {
    axiosMock
      .onGet(getCustomPagesApiUrl(), { params: { course_key: courseId, page: 1, page_size: 100 } })
      .reply(200, paginatedListPage([customPageMock('1', 'First')], { page: 1, numPages: 2 }))
      .onGet(getCustomPagesApiUrl(), { params: { course_key: courseId, page: 2, page_size: 100 } })
      .reply(200, paginatedListPage([customPageMock('2', 'Second')], { page: 2, numPages: 2 }));

    const result = await getCustomPages(courseId);

    expect(result.map(page => page.name)).toEqual(['First', 'Second']);
    expect(axiosMock.history.get.length).toBe(2);
  });
});

describe('updateCustomPageOrder', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });

  it('should put the page ids, in order, to the custom page order of the course', async () => {
    axiosMock.onPut(getCustomPageOrderApiUrl(courseId)).reply(204);

    await updateCustomPageOrder(courseId, ['block-2', 'block-1']);

    expect(axiosMock.history.put[0].url).toEqual(
      'http://localhost:18010/api/authoring/v1/courses/course-v1:edX+DemoX+Demo_Course/custom_page_order/',
    );
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({ custom_pages: ['block-2', 'block-1'] });
  });
});
