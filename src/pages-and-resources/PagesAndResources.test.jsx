import { screen, waitFor } from '@testing-library/react';

import { PagesAndResources } from '.';
import { render } from './utils.test';

const courseId = 'course-v1:edX+TestX+Test_Course';

describe('PagesAndResources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('doesn\'t show content permissions section if relevant apps are not enabled', () => {
    const initialState = {
      models: {
        courseApps: {},
      },
      pagesAndResources: {
        courseAppIds: [],
      },
    };

    render(
      <PagesAndResources courseId={courseId} />,
      { preloadedState: initialState },
    );

    expect(screen.queryByRole('heading', { name: 'Content permissions' })).not.toBeInTheDocument();
  });
  it('show content permissions section if Learning Assistant app is enabled', async () => {
    const initialState = {
      models: {
        courseApps: {
          learning_assistant: {
            id: 'learning_assistant',
            enabled: true,
            name: 'Learning Assistant',
            description: 'Learning Assistant description',
            allowedOperations: {
              configure: false,
              enable: true,
            },
            documentationLinks: {},
          },
        },
      },
      pagesAndResources: {
        courseAppIds: ['learning_assistant'],
      },
    };

    render(
      <PagesAndResources courseId={courseId} />,
      { preloadedState: initialState },
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learning Assistant')).toBeInTheDocument());
  });

  it('show content permissions section if Xpert learning summaries app is enabled', async () => {
    const initialState = {
      models: {
        courseApps: {
          xpert_unit_summary: {
            id: 'xpert_unit_summary',
            enabled: false,
            name: 'Xpert unit summaries',
            description: 'Use generative AI to summarize course content and reinforce learning.',
            allowedOperations: {
              enable: true,
              configure: true,
            },
            documentationLinks: {
              learnMoreConfiguration: 'https://openai.com/',
            },
          },
        },
      },
      pagesAndResources: {
        courseAppIds: ['xpert_unit_summary'],
      },
    };

    render(
      <PagesAndResources courseId={courseId} />,
      { preloadedState: initialState },
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Xpert unit summaries')).toBeInTheDocument());
  });
});
