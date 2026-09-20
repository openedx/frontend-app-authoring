import {
  render,
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import editorMessages from '../transcript-editor/messages';
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
let queryClient;
jest.mock('file-saver');

const renderComponent = (props) => {
  render(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <AppProvider store={store}>
          <VideosPageProvider courseId={courseId}>
            <TranscriptTab video={props} />
          </VideosPageProvider>
        </AppProvider>
      </IntlProvider>
    </QueryClientProvider>,
  );
};

const openAddForm = async () => {
  const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
  await act(async () => {
    fireEvent.click(addButton);
  });
};

const selectLanguage = async (languageText, dropdownEl = null) => {
  const dropdown = dropdownEl || screen.getByTestId('language-select-dropdown');
  await act(async () => {
    fireEvent.click(dropdown);
  });
  const allMatches = screen.getAllByText(languageText);
  const option = allMatches.find(el => el.closest('.pgn__menu')) || allMatches[allMatches.length - 1];
  await act(async () => {
    fireEvent.click(option);
  });
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
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    axiosMock.onGet(/course_waffle_flags/).reply(200, {});
  });

  describe('with no transcripts preloaded', () => {
    it('should have add transcript button', async () => {
      renderComponent(defaultProps);
      const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
      const transcriptRow = screen.queryByTestId('transcript-', { exact: false });
      expect(addButton).toBeInTheDocument();
      expect(transcriptRow).toBeNull();
    });

    it('should open and cancel new transcript form', async () => {
      renderComponent(defaultProps);
      await openAddForm();

      expect(screen.getByText(messages.newTranscriptTitle.defaultMessage)).toBeVisible();

      const cancelButton = screen.getByText(messages.cancelButtonLabel.defaultMessage);
      await act(async () => {
        fireEvent.click(cancelButton);
      });

      expect(screen.queryByText(messages.newTranscriptTitle.defaultMessage)).toBeNull();
    });

    describe('uploadVideoTranscript as add function', () => {
      const srtContent = '1\n00:00:00,000 --> 00:00:01,000\nTest\n';
      const file = new File([srtContent], 'download.srt', { type: 'text/srt' });

      it('should upload new transcript', async () => {
        const user = userEvent.setup();
        renderComponent(defaultProps);
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(204);

        await openAddForm();
        await selectLanguage('Arabic');

        await act(async () => {
          fireEvent.click(screen.getByText(messages.uploadFileLabel.defaultMessage));
        });
        const fileInputs = document.querySelectorAll('input[type="file"]');
        await act(async () => {
          await user.upload(fileInputs[fileInputs.length - 1], file);
        });

        const submitButton = screen.getByText(messages.addTranscriptButtonLabel.defaultMessage);
        await act(async () => {
          fireEvent.click(submitButton);
        });

        const addStatus = store.getState().videos.transcriptStatus;
        expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should show default error message on upload failure', async () => {
        const user = userEvent.setup();
        renderComponent(defaultProps);
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(404);

        await openAddForm();
        await selectLanguage('Arabic');

        await act(async () => {
          fireEvent.click(screen.getByText(messages.uploadFileLabel.defaultMessage));
        });
        const fileInputs = document.querySelectorAll('input[type="file"]');
        await act(async () => {
          await user.upload(fileInputs[fileInputs.length - 1], file);
        });

        const submitButton = screen.getByText(messages.addTranscriptButtonLabel.defaultMessage);
        await act(async () => {
          fireEvent.click(submitButton);
        });

        const addStatus = store.getState().videos.transcriptStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);
      });
    });
  });

  describe('with one transcript preloaded', () => {
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
        const confirmButton = screen.getAllByText(transcriptRowMessages.confirmDeleteLabel.defaultMessage)
          .find(el => el.closest('.btn-danger') || el.classList.contains('btn-danger'));
        axiosMock.onDelete(`${getApiBaseUrl()}/transcript_delete/${courseId}/mOckID0/ar`).reply(204);
        await act(async () => {
          fireEvent.click(confirmButton);
          await executeThunk(
            deleteVideoTranscript({
              language: 'ar',
              videoId: updatedProps.id,
              transcripts: updatedProps.transcripts,
              apiUrl: `/transcript_delete/${courseId}`,
            }),
            store.dispatch,
          );
        });
        const deleteStatus = store.getState().videos.transcriptStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);
        expect(screen.queryByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeNull();
      });

      it('should show error message on delete failure', async () => {
        const confirmButton = screen.getAllByText(transcriptRowMessages.confirmDeleteLabel.defaultMessage)
          .find(el => el.closest('.btn-danger') || el.classList.contains('btn-danger'));
        axiosMock.onDelete(`${getApiBaseUrl()}/transcript_delete/${courseId}/mOckID0/ar`).reply(404);
        await act(async () => {
          fireEvent.click(confirmButton);
          await executeThunk(
            deleteVideoTranscript({
              language: 'ar',
              videoId: updatedProps.id,
              transcripts: updatedProps.transcripts,
              apiUrl: `/transcript_delete/${courseId}`,
            }),
            store.dispatch,
          );
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

      it('should show error message on download failure', async () => {
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
      const srtContent = '1\n00:00:00,000 --> 00:00:01,000\nTest\n';
      const file = new File([srtContent], 'download.srt', { type: 'text/srt' });

      beforeEach(async () => {
        const updatedProps = { ...defaultProps, transcripts: ['fr', 'ar'] };
        renderComponent(updatedProps);

        const dropdownButtons = screen.getAllByTestId('language-select-dropdown');
        await selectLanguage('English', dropdownButtons[0]);

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
        const user = userEvent.setup();
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(204);

        await act(async () => {
          const fileInputs = document.querySelectorAll('input[type="file"]');
          await user.upload(fileInputs[0], file);
        });

        const addStatus = store.getState().videos.transcriptStatus;
        expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);

        const updatedTranscripts = store.getState().models.videos[defaultProps.id].transcripts;
        expect(updatedTranscripts).toEqual(['fr', 'en']);
      });

      it('should show error message on replace failure', async () => {
        const user = userEvent.setup();
        axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(404);

        await act(async () => {
          const fileInputs = document.querySelectorAll('input[type="file"]');
          await user.upload(fileInputs[0], file);
        });

        const addStatus = store.getState().videos.transcriptStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);
        expect(screen.getAllByText('Failed to replace ar with en.')[0]).toBeVisible();
      });
    });
  });
  describe('add transcript form interactions', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nHello\n';
    const chooseFile = async (file) => {
      await act(async () => {
        fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: file ? [file] : [] } });
      });
    };

    it('shows the selected SRT and lets the user remove it before submitting', async () => {
      renderComponent(defaultProps);
      await openAddForm();
      await chooseFile(new File([srt], 'valid.srt', { type: 'text/srt' }));
      expect(await screen.findByText('valid.srt')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: messages.removeSelectedFileLabel.defaultMessage }));
      await waitFor(() => expect(screen.queryByText('valid.srt')).not.toBeInTheDocument());
    });

    it('rejects an invalid SRT file on add', async () => {
      renderComponent(defaultProps);
      await openAddForm();
      await chooseFile(new File(['not an srt'], 'bad.srt', { type: 'text/srt' }));
      expect(await screen.findByText(messages.invalidSrtFormat.defaultMessage)).toBeInTheDocument();
      expect(screen.queryByText('bad.srt')).not.toBeInTheDocument();
    });

    it('ignores an empty file selection', async () => {
      renderComponent(defaultProps);
      await openAddForm();
      await chooseFile(null);
      expect(screen.queryByText(messages.invalidSrtFormat.defaultMessage)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: messages.addTranscriptButtonLabel.defaultMessage })).toBeDisabled();
    });

    it('filters the language list from the search box and reports no results', async () => {
      renderComponent(defaultProps);
      await openAddForm();
      await act(async () => {
        fireEvent.click(screen.getByTestId('language-select-dropdown'));
      });
      const search = screen.getByPlaceholderText(transcriptRowMessages.searchLanguagesPlaceholder.defaultMessage);
      fireEvent.change(search, { target: { value: 'zzzz' } });
      expect(screen.getByText(transcriptRowMessages.noLanguageResults.defaultMessage)).toBeInTheDocument();
      fireEvent.change(search, { target: { value: 'Eng' } });
      const options = screen.getAllByText('English');
      await act(async () => {
        fireEvent.click(options[options.length - 1]);
      });
      expect(screen.getByTestId('language-select-dropdown')).toHaveTextContent('English');
    });

    it('submits a new transcript, then shows a dismissible success toast', async () => {
      axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(204);
      renderComponent(defaultProps);
      await openAddForm();
      await chooseFile(new File([srt], 'valid.srt', { type: 'text/srt' }));
      await screen.findByText('valid.srt');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: messages.addTranscriptButtonLabel.defaultMessage }));
      });
      expect(await screen.findByText(messages.newTranscriptAddedLabel.defaultMessage)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      await waitFor(() =>
        expect(screen.queryByText(messages.newTranscriptAddedLabel.defaultMessage)).not.toBeInTheDocument()
      );
    });
  });

  describe('transcript row interactions', () => {
    const rowProps = { ...defaultProps, transcripts: ['ar'] };
    // The row's hidden file input is rendered as a sibling of the row element, first in document order.
    const rowFileInput = () => document.querySelectorAll('input[type="file"]')[0];

    it('rejects an invalid SRT file on replace', async () => {
      renderComponent(rowProps);
      await act(async () => {
        fireEvent.change(rowFileInput(), { target: { files: [new File(['nope'], 'bad.srt', { type: 'text/srt' })] } });
      });
      expect(await screen.findByText(messages.invalidSrtFormat.defaultMessage)).toBeInTheDocument();
    });

    it('ignores an empty replace selection', async () => {
      renderComponent(rowProps);
      await act(async () => {
        fireEvent.change(rowFileInput(), { target: { files: [] } });
      });
      expect(screen.queryByText(messages.invalidSrtFormat.defaultMessage)).not.toBeInTheDocument();
    });

    it('opens the transcript editor from the row menu and closes it again', async () => {
      axiosMock.onGet(/edx_video_id/).reply(200, '');
      renderComponent(rowProps);
      const row = screen.getByTestId('transcript-ar');
      fireEvent.click(within(row).getByRole('button', { name: 'Actions dropdown' }));
      await act(async () => {
        fireEvent.click(await screen.findByText(transcriptRowMessages.editTranscript.defaultMessage));
      });
      expect(await screen.findByRole('button', { name: editorMessages.insertCueLabel.defaultMessage }))
        .toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: editorMessages.cancelButtonLabel.defaultMessage }));
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: editorMessages.insertCueLabel.defaultMessage })).not
          .toBeInTheDocument()
      );
    });
  });
});
