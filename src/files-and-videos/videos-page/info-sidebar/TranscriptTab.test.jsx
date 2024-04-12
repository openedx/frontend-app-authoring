import {
  render,
  act,
  fireEvent,
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
import { executeThunk } from '../../../utils';
import { RequestStatus } from '../../../data/constants';
import TranscriptTab from './TranscriptTab';
import {
  courseId,
  initialState,
} from '../factories/mockApiResponses';

import { getApiBaseUrl } from '../data/api';
import messages from './messages';
import transcriptRowMessages from './transcript-item/messages';
import VideosPageProvider from '../VideosPageProvider';
import { deleteVideoTranscript } from '../data/thunks';

ReactDOM.createPortal = jest.fn(node => node);

const defaultProps = {
  id: 'mOckID0',
  displayName: 'mOckID0.mp4',
  wrapperType: 'video',
  dateAdded: '',
  thumbnail: '/video',
  fileSize: null,
  edx_video_id: 'mOckID0',
  clientVideoId: 'mOckID0.mp4',
  created: '',
  courseVideoImageUrl: '/video',
  transcripts: [],
  status: 'Imported',
};

let axiosMock;
let store;
jest.mock('file-saver');

const renderComponent = (props) => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <VideosPageProvider courseId={courseId}>
          <TranscriptTab video={props} />
        </VideosPageProvider>
      </AppProvider>
    </IntlProvider>,
  );
};

describe('TranscriptTab', () => {
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

  describe('with no transcripts preloaded', () => {
    it('should have add transcript button', async () => {
      renderComponent(defaultProps);
      const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
      const transcriptRow = screen.queryByTestId('transcript', { exact: false });
      expect(addButton).toBeInTheDocument();
      expect(transcriptRow).toBeNull();
    });

    it('should delete empty transcript row', async () => {
      renderComponent(defaultProps);
      const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
      await act(async () => { fireEvent.click(addButton); });

      const deleteButton = screen.getByLabelText('delete empty transcript');
      await act(async () => { fireEvent.click(deleteButton); });

      expect(screen.getByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeVisible();

      const confirmButton = screen.getByText(transcriptRowMessages.confirmDeleteLabel.defaultMessage);
      await act(async () => { fireEvent.click(confirmButton); });

      expect(screen.queryByTestId('transcript-')).toBeNull();
    });

    describe('uploadVideoTranscript as add function', () => {
      let addButton;
      const file = new File(['(⌐□_□)'], 'download.srt', { type: 'text/srt' });
      beforeEach(async () => {
        renderComponent(defaultProps);
        addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);

        await act(async () => { fireEvent.click(addButton); });
      });

      it('should upload new transcript', async () => {
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(204);
        await act(async () => {
          const addFileInput = screen.getByLabelText('file-input');
          expect(addFileInput).toBeInTheDocument();

          userEvent.upload(addFileInput, file);
        });
        const addStatus = store.getState().videos.transcriptStatus;

        expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should show default error message', async () => {
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(404);
        await act(async () => {
          const addFileInput = screen.getByLabelText('file-input');
          userEvent.upload(addFileInput, file);
        });
        const addStatus = store.getState().videos.transcriptStatus;

        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getAllByText('Failed to add .')[0]).toBeVisible();
      });

      it('should show api provided error message', async () => {
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(404, { error: 'api error' });
        await act(async () => {
          const addFileInput = screen.getByLabelText('file-input');
          userEvent.upload(addFileInput, file);
        });
        const addStatus = store.getState().videos.transcriptStatus;

        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getAllByText('api error')[0]).toBeVisible();
      });
    });
  });

  describe('with one transcripts preloaded', () => {
    const updatedProps = { ...defaultProps, transcripts: ['ar'] };
    beforeEach(() => {
      renderComponent(updatedProps);
    });

    it('should contain transcript row', () => {
      const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
      const transcriptRow = screen.getByTestId('transcript-ar');
      expect(addButton).toBeInTheDocument();
      expect(transcriptRow).toBeInTheDocument();
    });

    describe('deleteVideoTranscript', () => {
      beforeEach(async () => {
        const menuButton = screen.getByTestId('ar-transcript-menu');
        await waitFor(() => {
          fireEvent.click(menuButton);
        });

        const deleteButton = screen.getByText(transcriptRowMessages.deleteTranscript.defaultMessage).closest('button');
        fireEvent.click(deleteButton);
      });

      it('should open delete confirmation modal and cancel delete', async () => {
        const cancelButton = screen.getByText(transcriptRowMessages.cancelDeleteLabel.defaultMessage);
        await waitFor(() => {
          fireEvent.click(cancelButton);
        });

        expect(screen.queryByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeNull();
      });

      it('should open delete confirmation modal and handle delete', async () => {
        const confirmButton = screen.getByText(transcriptRowMessages.confirmDeleteLabel.defaultMessage);
        axiosMock.onDelete(`${getApiBaseUrl()}/transcript_delete/${courseId}/mOckID0/ar`).reply(204);
        await act(async () => {
          fireEvent.click(confirmButton);
          executeThunk(deleteVideoTranscript({
            language: 'ar',
            videoId: updatedProps.id,
            transcripts: updatedProps.transcripts,
            apiUrl: `/transcript_delete/${courseId}`,
          }), store.dispatch);
        });
        const deleteStatus = store.getState().videos.transcriptStatus;

        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);

        expect(screen.queryByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeNull();
      });

      it('should show error message', async () => {
        const confirmButton = screen.getByText(transcriptRowMessages.confirmDeleteLabel.defaultMessage);
        axiosMock.onDelete(`${getApiBaseUrl()}/transcript_delete/${courseId}/mOckID0/ar`).reply(404);
        await act(async () => {
          fireEvent.click(confirmButton);
          executeThunk(deleteVideoTranscript({
            language: 'ar',
            videoId: updatedProps.id,
            transcripts: updatedProps.transcripts,
            apiUrl: `/transcript_delete/${courseId}`,
          }), store.dispatch);
        });
        const deleteStatus = store.getState().videos.transcriptStatus;

        expect(deleteStatus).toEqual(RequestStatus.FAILED);

        expect(screen.queryByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeNull();

        expect(screen.getAllByText('Failed to delete ar transcript.')[0]).toBeVisible();
      });
    });

    describe('downloadVideoTranscript', () => {
      let downloadButton;
      beforeEach(async () => {
        const menuButton = screen.getByTestId('ar-transcript-menu');
        await waitFor(() => {
          fireEvent.click(menuButton);
        });
        downloadButton = screen.getByText(
          transcriptRowMessages.downloadTranscript.defaultMessage,
        ).closest('button');
      });

      it('should download transcript', async () => {
        axiosMock.onGet(
          `${getApiBaseUrl()}/transcript_download/?edx_video_id=${updatedProps.id}&language_code=ar`,
        ).reply(200, 'string of transcript');
        await act(async () => {
          fireEvent.click(downloadButton);
        });
        const downloadStatus = store.getState().videos.transcriptStatus;

        expect(downloadStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should show error message', async () => {
        const filename = 'mOckID0.mp4-ar.srt';
        axiosMock.onGet(
          `${getApiBaseUrl()}/transcript_download/?edx_video_id=${updatedProps.id}&language_code=ar`,
        ).reply(404);
        await act(async () => {
          fireEvent.click(downloadButton);
        });
        const downloadStatus = store.getState().videos.transcriptStatus;

        expect(downloadStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getAllByText(`Failed to download ${filename}.`)[0]).toBeVisible();
      });
    });
  });

  describe('with multiple transcripts preloaded', () => {
    describe('uploadVideoTranscript as replace function', () => {
      const file = new File(['(⌐□_□)'], 'download.srt', { type: 'text/srt' });
      beforeEach(async () => {
        const updatedProps = { ...defaultProps, transcripts: ['fr', 'ar'] };
        renderComponent(updatedProps);
        const dropdownButton = screen.getAllByTestId('language-select-dropdown')[0];
        await waitFor(() => {
          fireEvent.click(dropdownButton);
        });

        const englishOption = screen.getByText('English');
        await act(async () => {
          fireEvent.click(englishOption);
        });

        const menuButton = screen.getByTestId('ar-transcript-menu');
        await waitFor(() => {
          fireEvent.click(menuButton);
        });
        const replaceButton = screen.getByText(
          transcriptRowMessages.replaceTranscript.defaultMessage,
        ).closest('button');
        fireEvent.click(replaceButton);
      });

      it('should replace transcript', async () => {
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(204);

        await act(async () => {
          const addFileInput = screen.getAllByLabelText('file-input')[0];
          userEvent.upload(addFileInput, file);
        });
        const addStatus = store.getState().videos.transcriptStatus;

        expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);

        const updatedTranscripts = store.getState().models.videos[defaultProps.id].transcripts;

        expect(updatedTranscripts).toEqual(['fr', 'en']);
      });

      it('should show error message', async () => {
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(404);

        await act(async () => {
          const addFileInput = screen.getAllByLabelText('file-input')[0];
          userEvent.upload(addFileInput, file);
        });

        const addStatus = store.getState().videos.transcriptStatus;

        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getAllByText('Failed to replace ar with en.')[0]).toBeVisible();
      });
    });
  });
});
