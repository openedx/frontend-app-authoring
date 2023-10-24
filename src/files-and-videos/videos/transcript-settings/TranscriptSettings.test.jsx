import {
  render,
  act,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactDOM from 'react-dom';
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
import { getApiBaseUrl } from '../../data/api';
import messages from './messages';
import VideosProvider from '../VideosProvider';

ReactDOM.createPortal = jest.fn(node => node);

const defaultProps = {
  isTranscriptSettngsOpen: true,
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
      await act(async () => {
        userEvent.click(orderButton);
      });
      const selectableButtons = screen.getAllByLabelText('none radio')[0];

      expect(selectableButtons).toBeVisible();
    });

    it('discard changes should call closeTranscriptSettings', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const discardButton = screen.getByText(messages.discardSettingsLabel.defaultMessage);
      await act(async () => {
        userEvent.click(discardButton);
      });

      expect(defaultProps.closeTranscriptSettings).toHaveBeenCalled();
    });
  });

  describe('has no credentials set', () => {
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

    it('should request credentials for Cielo24 and 3Play Media', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
      await act(async () => {
        userEvent.click(cielo24Button);
      });
      const cieloCredentialMessage = screen.getByTestId('cieloCredentialMessage');

      expect(cieloCredentialMessage).toBeVisible();

      const threePlayMediaButton = screen.getAllByLabelText('3PlayMedia radio')[0];
      await act(async () => {
        userEvent.click(threePlayMediaButton);
      });
      const threePlayMediaCredentialMessage = screen.getByTestId('threePlayMediaCredentialMessage');

      expect(threePlayMediaCredentialMessage).toBeVisible();
    });

    it('should handle cielo24 credential update', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
      await act(async () => {
        userEvent.click(cielo24Button);
      });
      const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

      expect(updateButton).toHaveAttribute('disabled');

      const firstInput = screen.getByLabelText(messages.cieloApiKeyLabel.defaultMessage);
      const secondInput = screen.getByLabelText(messages.cieloUsernameLabel.defaultMessage);
      await waitFor(() => {
        userEvent.type(firstInput, 'apiKey');
        userEvent.type(secondInput, 'username');

        expect(updateButton).not.toHaveAttribute('disabled');
      });

      axiosMock.onPost(`${getApiBaseUrl()}/transcript_credentials/${courseId}`).reply(200);
      await waitFor(() => {
        userEvent.click(updateButton);
      });
      const { transcriptStatus } = store.getState().videos;

      expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);

      expect(screen.queryByTestId('cieloCredentialMessage')).toBeNull();

      expect(screen.getByText(messages.cieloFidelityLabel.defaultMessage)).toBeVisible();
    });

    it('should handle 3Play Media credential update', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
      await act(async () => {
        userEvent.click(threePlayButton);
      });
      const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

      expect(updateButton).toHaveAttribute('disabled');

      const firstInput = screen.getByLabelText(messages.threePlayMediaApiKeyLabel.defaultMessage);
      const secondInput = screen.getByLabelText(messages.threePlayMediaApiSecretLabel.defaultMessage);
      await waitFor(() => {
        userEvent.type(firstInput, 'apiKey');
        userEvent.type(secondInput, 'secretKey');

        expect(updateButton).not.toHaveAttribute('disabled');
      });

      axiosMock.onPost(`${getApiBaseUrl()}/transcript_credentials/${courseId}`).reply(200);
      await waitFor(() => {
        userEvent.click(updateButton);
      });
      const { transcriptStatus } = store.getState().videos;

      expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);

      expect(screen.queryByTestId('threePlayCredentialMessage')).toBeNull();

      expect(screen.getByText(messages.threePlayMediaTurnaroundLabel.defaultMessage)).toBeVisible();
    });
  });

  describe('has credentials set', () => {
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
    });

    it('should not show credentials request for Cielo24 and 3Play Media', async () => {
      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
      await act(async () => {
        userEvent.click(cielo24Button);
      });
      const cieloCredentialMessage = screen.queryByTestId('cieloCredentialMessage');

      expect(cieloCredentialMessage).toBeNull();

      const threePlayMediaButton = screen.getAllByLabelText('3PlayMedia radio')[0];
      await act(async () => {
        userEvent.click(threePlayMediaButton);
      });
      const threePlayMediaCredentialMessage = screen.queryByTestId('threePlayMediaCredentialMessage');

      expect(threePlayMediaCredentialMessage).toBeNull();
    });

    it('should handle cielo24 preferences update', async () => {
      const apiResponse = {
        videoSourceLanguage: 'en',
        cielo24Turnaround: 'PRIORITY',
        cielo24FidelityTypee: 'PREMIUM',
        preferredLanguages: ['en'],
        provider: 'cielo24',
        global: false,
      };

      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const cielo24Button = screen.getAllByLabelText('Cielo24 radio')[0];
      await act(async () => {
        userEvent.click(cielo24Button);
      });
      const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

      expect(updateButton).toHaveAttribute('disabled');

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
      await waitFor(() => {
        userEvent.click(updateButton);
      });
      const { transcriptStatus } = store.getState().videos;

      expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);

      expect(screen.getByText(messages.cieloFidelityLabel.defaultMessage)).toBeVisible();
    });

    it('should handle 3Play Media credential update with english as source language', async () => {
      const apiResponse = {
        videoSourceLanguage: 'en',
        threePlayTurnaround: 'two_hour',
        preferredLanguages: ['ar', 'fr'],
        provider: '3PlayMedia',
        global: false,
      };

      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
      await act(async () => {
        userEvent.click(threePlayButton);
      });
      const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

      expect(updateButton).toHaveAttribute('disabled');

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
      await waitFor(() => {
        userEvent.click(updateButton);
      });
      const { transcriptStatus } = store.getState().videos;

      expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
    });

    it('should handle 3Play Media credential update with english as source language', async () => {
      const apiResponse = {
        videoSourceLanguage: 'en',
        threePlayTurnaround: 'two_hour',
        preferredLanguages: ['ar', 'fr'],
        provider: '3PlayMedia',
        global: false,
      };

      renderComponent(defaultProps);
      const orderButton = screen.getByText(messages.orderTranscriptsTitle.defaultMessage);
      await act(async () => {
        userEvent.click(orderButton);
      });
      const threePlayButton = screen.getAllByLabelText('3PlayMedia radio')[0];
      await act(async () => {
        userEvent.click(threePlayButton);
      });
      const updateButton = screen.getByText(messages.updateSettingsLabel.defaultMessage);

      expect(updateButton).toHaveAttribute('disabled');

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
      await waitFor(() => {
        userEvent.click(updateButton);
      });
      const { transcriptStatus } = store.getState().videos;

      expect(transcriptStatus).toEqual(RequestStatus.SUCCESSFUL);
    });
  });
});
