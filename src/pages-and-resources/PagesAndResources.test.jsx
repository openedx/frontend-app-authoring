import { camelCaseObject } from '@edx/frontend-platform';
import { screen, waitFor } from '@testing-library/react';

import { PagesAndResources } from '.';
import * as pagesAndResourcesApi from './data/api';
import { render } from './utils.test';
import * as xpertUnitSummaryApi from './xpert-unit-summary/data/api';

const courseId = 'course-v1:edX+TestX+Test_Course';

jest.mock('../generic/hooks', () => ({
  useUserPermissions: jest.fn(() => ({
    checkPermission: jest.fn(() => true),
  })),
}));

describe('PagesAndResources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('doesn\'t show content permissions section if relevant apps are not enabled', () => {
    jest.spyOn(pagesAndResourcesApi, 'getCourseApps').mockResolvedValue(camelCaseObject([]));

    const apiResponse = { response: { enabled: true } };
    jest.spyOn(xpertUnitSummaryApi, 'getXpertSettings').mockResolvedValue(apiResponse);
    jest.spyOn(xpertUnitSummaryApi, 'getXpertPluginConfigurable').mockResolvedValue(apiResponse);

    render(
      <PagesAndResources
        courseId={courseId}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'Content permissions' })).not.toBeInTheDocument();
  });
  it('show content permissions section if Learning Assistant app is enabled', async () => {
    const apiResponse = [
      {
        id: 'learning_assistant',
        enabled: true,
        name: 'Learning Assistant',
        description: 'Learning Assistant description',
        allowed_operations: {
          configure: false,
          enable: true,
        },
        documentation_links: {},
      },
    ];

    jest.spyOn(pagesAndResourcesApi, 'getCourseApps').mockResolvedValue(camelCaseObject(apiResponse));

    render(
      <PagesAndResources
        courseId={courseId}
      />,
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learning Assistant')).toBeInTheDocument());
  });
  it('show content permissions section if Xpert learning summaries app is enabled', async () => {
    const apiResponse = { response: { enabled: true } };

    jest.spyOn(xpertUnitSummaryApi, 'getXpertSettings').mockResolvedValue(apiResponse);
    jest.spyOn(xpertUnitSummaryApi, 'getXpertPluginConfigurable').mockResolvedValue(apiResponse);

    render(
      <PagesAndResources
        courseId={courseId}
      />,
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Xpert unit summaries')).toBeInTheDocument());
  });
});
