import React from 'react';
import { screen, waitFor } from '@testing-library/react';

import { RequestStatus } from 'CourseAuthoring/data/constants';
import { render } from 'CourseAuthoring/pages-and-resources/utils.test';
import LearningAssistantSettings from './Settings';

const onClose = () => { };

describe('Learning Assistant Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', async () => {
    const initialState = {
      models: {
        courseApps: {
          learning_assistant:
          {
            id: 'learning_assistant',
            enabled: true,
            name: 'Learning Assistant',
            description: 'Learning Assistant description',
            allowedOperations: {
              configure: false,
              enable: true,
            },
            documentationLinks: {
              learnMoreOpenaiDataPrivacy: 'www.example.com/learn-more-data-privacy',
              learnMoreOpenai: 'www.example.com/learn-more',
            },
          },
        },
      },
      pagesAndResources: {
        loadingStatus: RequestStatus.SUCCESSFUL,
      },
    };

    render(
      <LearningAssistantSettings
        onClose={onClose}
      />,
      {
        preloadedState: initialState,
      },
    );

    const toggleDescription = 'Reinforce learning concepts by sharing text-based course content '
    + 'with OpenAI (via API) to power an in-course Learning Assistant. Learners can leave feedback about the quality '
    + 'of the AI-powered experience for use by edX to improve the performance of the tool.';

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Configure Learning Assistant' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(toggleDescription)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learn more about how OpenAI handles data')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learn more about OpenAI API data privacy')).toBeInTheDocument());
  });
});
