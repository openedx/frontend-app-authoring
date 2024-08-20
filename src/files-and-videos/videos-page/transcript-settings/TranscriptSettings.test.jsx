import {
  render,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  initializeMockApp,
} from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import initializeStore from '../../../store';
import { RequestStatus } from '../../../data/constants';
import TranscriptSettings from './TranscriptSettings';
import {
  courseId,
  initialState,
} from '../factories/mockApiResponses';
import { getApiBaseUrl } from '../data/api';
import messages from './messages';
import VideosProvider from '../VideosPageProvider';

const defaultProps = {
  isTranscriptSettingsOpen: true,
  closeTranscriptSettings: jest.fn(),
  courseId,
};

let axiosMock;
let store;

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <VideosProvider courseId={courseId}>
          <TranscriptSettings {...defaultProps} />
        </VideosProvider>
      </AppProvider>
    </IntlProvider>,
  );
};

describe('TranscriptSettings', () => {
  describe('default behaviors', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore(initialState);
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    });

    it('should have Transcript settings title', async () => {
      renderComponent();
      const header = screen.getByText(messages.transcriptSettingsTitle.defaultMessage);

      expect(header).toBeVisible();
    });

    it('should change view to order form', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      userEvent.click(orderButton);
      const selectableButtons = screen.getAllByLabelText('none radio')[0];

      expect(selectableButtons).toBeVisible();
    });

    it('should return to order transcript collapsible', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      userEvent.click(orderButton);
      const selectableButtons = screen.getAllByLabelText('none radio')[0];

      expect(selectableButtons).toBeVisible();

      const backButton = screen.getByLabelText('back button to main transcript settings view');
      userEvent.click(backButton);
      await waitFor(() => {
        expect(screen.queryByLabelText('back button to main transcript settings view')).toBeNull();
      });
    });

    it('discard changes should call closeTranscriptSettings', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      userEvent.click(orderButton);
      const discardButton = screen.getByText(messages.discardSettingsLabel.defaultMessage);
      userEvent.click(discardButton);

      expect(defaultProps.closeTranscriptSettings).toHaveBeenCalled();
    });
  });

  describe('loading saved preference', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore({
        ...initialState,
        videos: {
          ...initialState.videos,
          pageSettings: {
            ...initialState.videos.pageSettings,
            activeTranscriptPreferences: {
              provider: 'Cielo24',
              cielo24Fidelity: '',
              cielo24Turnaround: '',
              preferredLanguages: [],
              threePlayTurnaround: '',
              videoSourceLanguage: '',
            },
          },
        },
      });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());

      renderComponent(defaultProps);
    });

    it('should load page with Cielo24 selected', async () => {
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      userEvent.click(orderButton);
      const cielo24Button = screen.getByText(messages.cieloLabel.defaultMessage);

      expect(within(cielo24Button).getByLabelText('Cielo24 radio')).toHaveProperty('checked', true);
    });
  });

  describe('delete transcript preferences', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore({
        ...initialState,
        videos: {
          ...initialState.videos,
          pageSettings: {
            ...initialState.videos.pageSettings,
            activeTranscriptPreferences: {
              provider: 'Cielo24',
              cielo24Fidelity: '',
              cielo24Turnaround: '',
              preferredLanguages: [],
              threePlayTurnaround: '',
              videoSourceLanguage: '',
            },
          },
        },
      });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());

      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      userEvent.click(orderButton);
      const noneButton = screen.getAllByLabelText('none radio')[0];

      userEvent.click(noneButton);
    });

    it('api should succeed', async () => {
      const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

      axiosMock.onDelete(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(204);
      fireEvent.click(updateButton);
      await waitFor(() => {
        const { transcriptStatus } = store.getState().videos;
        expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
      });
    });

    it('should show error alert', async () => {
      const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

      axiosMock.onDelete(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(404);
      fireEvent.click(updateButton);
      await waitFor(() => {
        const { transcriptStatus } = store.getState().videos;
        expect(transcriptStatus).toEqual(RequestStatus.FAILED);
      });

      expect(screen.getByText('Failed to update order transcripts settings.')).toBeVisible();
    });
  });

  describe('with no credentials set', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore(initialState);
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());

      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      userEvent.click(orderButton);
    });

    it('should ask for Cielo24 or 3Play Media credentials', async () => {
      const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
      userEvent.click(cielo24Button);
      const cieloCredentialMessage = screen.getByTestId('cieloCredentialMessage');

      expect(cieloCredentialMessage).toBeVisible();

      const threePlayMediaButton = screen.getAllByLabelText('3PlayMedia radio')[0];
      userEvent.click(threePlayMediaButton);
      const threePlayMediaCredentialMessage = screen.getByTestId('threePlayMediaCredentialMessage');

      expect(threePlayMediaCredentialMessage).toBeVisible();
    });

    describe('api succeeds', () => {
      it('should update cielo24 credentials ', async () => {
        const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
        userEvent.click(cielo24Button);

        const firstInput = screen.getByLabelText(messages.cieloApiKeyLabel.defaultMessage);
        const secondInput = screen.getByLabelText(messages.cieloUsernameLabel.defaultMessage);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

        await waitFor(() => {
          userEvent.type(firstInput, 'apiKey');
          userEvent.type(secondInput, 'username');

          expect(updateButton).not.toHaveAttribute('disabled');
        });

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_credentials/${courseId}`).reply(200);
        fireEvent.click(updateButton);
        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;
          expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
        });

        expect(screen.queryByTestId('cieloCredentialMessage')).toBeNull();

        expect(screen.getByText(messages.cieloFidelityLabel.defaultMessage)).toBeVisible();
      });

      it('should update 3Play Media credentials', async () => {
        const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
        userEvent.click(threePlayButton);

        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const firstInput = screen.getByLabelText(messages.threePlayMediaApiKeyLabel.defaultMessage);
        const secondInput = screen.getByLabelText(messages.threePlayMediaApiSecretLabel.defaultMessage);

        await waitFor(() => {
          userEvent.type(firstInput, 'apiKey');
          userEvent.type(secondInput, 'secretKey');

          expect(updateButton).not.toHaveAttribute('disabled');
        });

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_credentials/${courseId}`).reply(200);
        fireEvent.click(updateButton);

        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;
          expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
        });

        expect(screen.queryByTestId('threePlayCredentialMessage')).toBeNull();

        expect(screen.getByText(messages.threePlayMediaTurnaroundLabel.defaultMessage)).toBeVisible();
      });
    });

    describe('api fails', () => {
      it('should show error alert on Cielo24 credentials update', async () => {
        const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
        userEvent.click(cielo24Button);

        const firstInput = screen.getByLabelText(messages.cieloApiKeyLabel.defaultMessage);
        const secondInput = screen.getByLabelText(messages.cieloUsernameLabel.defaultMessage);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

        await waitFor(() => {
          userEvent.type(firstInput, 'apiKey');
          userEvent.type(secondInput, 'username');

          expect(updateButton).not.toHaveAttribute('disabled');
        });

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(503);
        fireEvent.click(updateButton);

        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;
          expect(transcriptStatus).toEqual(RequestStatus.FAILED);
        });

        expect(screen.getByText('Failed to update Cielo24 credentials.')).toBeVisible();
      });

      it('should show error alert on 3PlayMedia credentials update', async () => {
        const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
        userEvent.click(threePlayButton);

        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const firstInput = screen.getByLabelText(messages.threePlayMediaApiKeyLabel.defaultMessage);
        const secondInput = screen.getByLabelText(messages.threePlayMediaApiSecretLabel.defaultMessage);

        await waitFor(() => {
          userEvent.type(firstInput, 'apiKey');
          userEvent.type(secondInput, 'secretKey');

          expect(updateButton).not.toHaveAttribute('disabled');
        });

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(404);
        fireEvent.click(updateButton);

        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;
          expect(transcriptStatus).toEqual(RequestStatus.FAILED);
        });

        expect(screen.getByText('Failed to update 3PlayMedia credentials.')).toBeVisible();
      });
    });
  });

  describe('with credentials set', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore({
        ...initialState,
        videos: {
          ...initialState.videos,
          pageSettings: {
            ...initialState.videos.pageSettings,
            transcriptCredentials: {
              cielo24: true,
              '3PlayMedia': true,
            },
          },
        },
      });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      userEvent.click(orderButton);
    });

    it('should not show credentials request for Cielo24 and 3Play Media', async () => {
      const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
      userEvent.click(cielo24Button);
      const cieloCredentialMessage = screen.queryByTestId('cieloCredentialMessage');

      expect(cieloCredentialMessage).toBeNull();

      const threePlayMediaButton = screen.getAllByLabelText('3PlayMedia radio')[0];
      userEvent.click(threePlayMediaButton);
      const threePlayMediaCredentialMessage = screen.queryByTestId('threePlayMediaCredentialMessage');

      expect(threePlayMediaCredentialMessage).toBeNull();
    });

    describe('api succeeds', () => {
      it('should update cielo24 preferences', async () => {
        const apiResponse = {
          videoSourceLanguage: 'en',
          cielo24Turnaround: 'PRIORITY',
          cielo24FidelityTypee: 'PREMIUM',
          preferredLanguages: ['en'],
          provider: 'cielo24',
          global: false,
        };

        const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
        userEvent.click(cielo24Button);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const turnaround = screen.getByText(messages.cieloTurnaroundPlaceholder.defaultMessage);
        const fidelity = screen.getByText(messages.cieloFidelityPlaceholder.defaultMessage);

        await waitFor(() => {
          userEvent.click(turnaround);
          userEvent.click(screen.getByText('Priority (24 hours)'));

          userEvent.click(fidelity);
          userEvent.click(screen.getByText('Premium (95% accuracy)'));

          const source = screen.getAllByText(messages.cieloSourceLanguagePlaceholder.defaultMessage)[0];
          userEvent.click(source);
          userEvent.click(screen.getByText('English'));

          const language = screen.getByText(messages.cieloTranscriptLanguagePlaceholder.defaultMessage);
          userEvent.click(language);
          userEvent.click(screen.getAllByText('English')[2]);
        });

        expect(updateButton).not.toHaveAttribute('disabled');

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(200, apiResponse);
        fireEvent.click(updateButton);

        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;

          expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
        });

        expect(screen.getByText(messages.cieloFidelityLabel.defaultMessage)).toBeVisible();
      });

      it('should update 3Play Media preferences with english as source language', async () => {
        const apiResponse = {
          videoSourceLanguage: 'en',
          threePlayTurnaround: 'two_hour',
          preferredLanguages: ['ar', 'fr'],
          provider: '3PlayMedia',
          global: false,
        };
        const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
        userEvent.click(threePlayButton);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const turnaround = screen.getByText(messages.threePlayMediaTurnaroundPlaceholder.defaultMessage);
        const source = screen.getByText(messages.threePlayMediaSourceLanguagePlaceholder.defaultMessage);

        await waitFor(() => {
          userEvent.click(turnaround);
          userEvent.click(screen.getByText('2 hours'));

          userEvent.click(source);
          userEvent.click(screen.getByText('English'));

          const language = screen.getByText(messages.threePlayMediaTranscriptLanguagePlaceholder.defaultMessage);
          userEvent.click(language);
          userEvent.click(screen.getByText('Arabic'));
          userEvent.click(screen.getByText('French'));
          userEvent.click(screen.getAllByText('Arabic')[0]);

          expect(updateButton).not.toHaveAttribute('disabled');
        });

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(200, apiResponse);
        fireEvent.click(updateButton);
        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;

          expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
        });
      });

      it('should update 3Play Media preferences with spanish as source language', async () => {
        const apiResponse = {
          videoSourceLanguage: 'en',
          threePlayTurnaround: 'two_hour',
          preferredLanguages: ['ar', 'fr'],
          provider: '3PlayMedia',
          global: false,
        };
        const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
        userEvent.click(threePlayButton);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const turnaround = screen.getByText(messages.threePlayMediaTurnaroundPlaceholder.defaultMessage);
        const source = screen.getByText(messages.threePlayMediaSourceLanguagePlaceholder.defaultMessage);

        await waitFor(() => {
          userEvent.click(turnaround);
          userEvent.click(screen.getByText('2 hours'));

          userEvent.click(source);
          userEvent.click(screen.getByText('Spanish'));

          const language = screen.getByText(messages.threePlayMediaTranscriptLanguagePlaceholder.defaultMessage);
          userEvent.click(language);
          userEvent.click(screen.getAllByText('English')[1]);
        });
        expect(updateButton).not.toHaveAttribute('disabled');

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(200, apiResponse);
        fireEvent.click(updateButton);
        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;

          expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
        });
      });
    });

    describe('api fails', () => {
      it('should show error alert on Cielo24 preferences update', async () => {
        const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
        userEvent.click(cielo24Button);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const turnaround = screen.getByText(messages.cieloTurnaroundPlaceholder.defaultMessage);
        const fidelity = screen.getByText(messages.cieloFidelityPlaceholder.defaultMessage);

        await waitFor(() => {
          userEvent.click(turnaround);
          userEvent.click(screen.getByText('Priority (24 hours)'));

          userEvent.click(fidelity);
          userEvent.click(screen.getByText('Premium (95% accuracy)'));

          const source = screen.getAllByText(messages.cieloSourceLanguagePlaceholder.defaultMessage)[0];
          userEvent.click(source);
          userEvent.click(screen.getByText('English'));

          const language = screen.getByText(messages.cieloTranscriptLanguagePlaceholder.defaultMessage);
          userEvent.click(language);
          userEvent.click(screen.getAllByText('English')[2]);
        });

        expect(updateButton).not.toHaveAttribute('disabled');

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(503);
        fireEvent.click(updateButton);
        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;

          expect(transcriptStatus).toEqual(RequestStatus.FAILED);
        });

        expect(screen.getByText('Failed to update Cielo24 transcripts settings.')).toBeVisible();
      });

      it('should show error alert with default message on 3PlayMedia preferences update', async () => {
        const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
        userEvent.click(threePlayButton);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const turnaround = screen.getByText(messages.threePlayMediaTurnaroundPlaceholder.defaultMessage);
        const source = screen.getByText(messages.threePlayMediaSourceLanguagePlaceholder.defaultMessage);

        await waitFor(() => {
          userEvent.click(turnaround);
          userEvent.click(screen.getByText('2 hours'));

          userEvent.click(source);
          userEvent.click(screen.getByText('Spanish'));

          const language = screen.getByText(messages.threePlayMediaTranscriptLanguagePlaceholder.defaultMessage);
          userEvent.click(language);
          userEvent.click(screen.getAllByText('English')[1]);
        });
        expect(updateButton).not.toHaveAttribute('disabled');

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(404);
        fireEvent.click(updateButton);
        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;

          expect(transcriptStatus).toEqual(RequestStatus.FAILED);
        });

        expect(screen.getByText('Failed to update 3PlayMedia transcripts settings.')).toBeVisible();
      });

      it('should show error alert with default message on 3PlayMedia preferences update', async () => {
        const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
        userEvent.click(threePlayButton);
        const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);
        const turnaround = screen.getByText(messages.threePlayMediaTurnaroundPlaceholder.defaultMessage);
        const source = screen.getByText(messages.threePlayMediaSourceLanguagePlaceholder.defaultMessage);

        await waitFor(() => {
          userEvent.click(turnaround);
          userEvent.click(screen.getByText('2 hours'));

          userEvent.click(source);
          userEvent.click(screen.getByText('Spanish'));

          const language = screen.getByText(messages.threePlayMediaTranscriptLanguagePlaceholder.defaultMessage);
          userEvent.click(language);
          userEvent.click(screen.getAllByText('English')[1]);
        });
        expect(updateButton).not.toHaveAttribute('disabled');

        axiosMock.onPost(`${getApiBaseUrl()}/transcript_preferences/${courseId}`).reply(404, { error: 'Invalid turnaround.' });
        fireEvent.click(updateButton);
        await waitFor(() => {
          const { transcriptStatus } = store.getState().videos;

          expect(transcriptStatus).toEqual(RequestStatus.FAILED);
        });

        expect(screen.getByText('Invalid turnaround.')).toBeVisible();
      });
    });
  });

  describe('Translations component success', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore({
        ...initialState,
        videos: {
          ...initialState.videos,
          pageSettings: {
            ...initialState.videos.pageSettings,
            isAiTranslationsEnabled: true,
          },
        },
      });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());

      renderComponent(defaultProps);
    });

    it('displays AI translations component if enabled', () => {
      const component = screen.getByTestId('translations-component');
      expect(component).toBeInTheDocument();
    });
  });
});
