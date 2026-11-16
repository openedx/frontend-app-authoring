import { initializeMocks } from '@src/testUtils';
import { paginatedListPage } from '@src/generic/data/paginatedList';

import { courseTeamMock } from '../__mocks__';
import { getCourseTeam, getCourseTeamApiUrl, getCourseTeamCallerApiUrl } from './api';

let axiosMock;
const courseId = 'course-v1:org+101+101';

describe('getCourseTeam', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('should fetch the members and the user\'s permissions on the team', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, paginatedListPage(courseTeamMock.members))
      .onGet(getCourseTeamCallerApiUrl(courseId))
      .reply(200, courseTeamMock.me);

    const result = await getCourseTeam(courseId);

    expect(result).toEqual({
      users: courseTeamMock.members,
      allowActions: true,
      showTransferOwnershipHint: true,
    });
    expect(axiosMock.history.get.map(({ url }) => url).sort()).toEqual([
      'http://localhost:18010/api/authoring/v2/courses/course-v1:org+101+101/team_members/',
      'http://localhost:18010/api/authoring/v2/courses/course-v1:org+101+101/team_members/me/',
    ]);
  });

  it.each([
    [true, false],
    [false, true],
    [false, false],
  ])(
    'should read allowActions from can_manage_team (%s) and showTransferOwnershipHint from is_only_instructor (%s)',
    async (canManageTeam, isOnlyInstructor) => {
      axiosMock
        .onGet(getCourseTeamApiUrl(courseId))
        .reply(200, paginatedListPage(courseTeamMock.members))
        .onGet(getCourseTeamCallerApiUrl(courseId))
        .reply(200, {
          ...courseTeamMock.me,
          can_manage_team: canManageTeam,
          is_only_instructor: isOnlyInstructor,
        });

      const result = await getCourseTeam(courseId);

      expect(result.allowActions).toBe(canManageTeam);
      expect(result.showTransferOwnershipHint).toBe(isOnlyInstructor);
    },
  );

  it('should return the members of every page, in order', async () => {
    const [instructor, ...staff] = courseTeamMock.members;
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId), { params: { page: 1, page_size: 100 } })
      .reply(200, paginatedListPage([instructor], { page: 1, numPages: 2 }))
      .onGet(getCourseTeamApiUrl(courseId), { params: { page: 2, page_size: 100 } })
      .reply(200, paginatedListPage(staff, { page: 2, numPages: 2 }))
      .onGet(getCourseTeamCallerApiUrl(courseId))
      .reply(200, courseTeamMock.me);

    const result = await getCourseTeam(courseId);

    expect(result.users).toEqual(courseTeamMock.members);
  });

  it('should fail when the user may not see the team', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(403)
      .onGet(getCourseTeamCallerApiUrl(courseId))
      .reply(403);

    await expect(getCourseTeam(courseId)).rejects.toMatchObject({ response: { status: 403 } });
  });
});
