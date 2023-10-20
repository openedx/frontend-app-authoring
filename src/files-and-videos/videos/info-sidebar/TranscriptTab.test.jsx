import {
  render,
  act,
  fireEvent,
  screen,
  waitFor,
  within,
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
  // generateUpdateVisiblityApiResponse,
  courseId,
  initialState,
  // generateXblockData,
} from '../factories/mockApiResponses';

import { getApiBaseUrl } from '../data/api';
import messages from './messages';
import { default as transcriptRowMessages } from './transcript-item/messages';
import VideosProvider from '../VideosProvider';
import { deleteVideoTranscript, downloadVideoTranscript } from '../data/thunks';
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
        <VideosProvider courseId={courseId}>
          <TranscriptTab video={props} />
        </VideosProvider>
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

  it('should have add transcript button', async () => {
    renderComponent(defaultProps);
    const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
    const transcriptRow = screen.queryByTestId('transcript', { exact: false });
    expect(addButton).toBeInTheDocument();
    expect(transcriptRow).toBeNull();
  });

  it('should upload new transcript', async () => {
    renderComponent(defaultProps);
    const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
    axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(204);
    const file = new File(['(⌐□_□)'], 'download.srt', { type: 'text/srt' });
    fireEvent.click(addButton);

    await act(async () => {
      const addFileInput = screen.getByLabelText('file-input');
      expect(addFileInput).toBeInTheDocument();

      userEvent.upload(addFileInput, file);
    });
    const addStatus = store.getState().videos.transcriptStatus;
    expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
  });

  it('should contain transcript row', () => {
    const updatedProps = { ...defaultProps, transcripts: ['ar']}
    renderComponent(updatedProps);
    const addButton = screen.getByText(messages.uploadButtonLabel.defaultMessage);
    const transcriptRow = screen.getByTestId('transcript-ar');
    expect(addButton).toBeInTheDocument();
    expect(transcriptRow).toBeInTheDocument();
  });

  it('should open delete confirmation modal and handle cancel', async () => {
    const updatedProps = { ...defaultProps, transcripts: ['ar']}
    renderComponent(updatedProps);
    const menuButton = screen.getByTestId('ar-transcript-menu');
    await waitFor(() => {
      fireEvent.click(menuButton);
    });
    const deleteButton = screen.getByText(transcriptRowMessages.deleteTranscript.defaultMessage).closest('a');
    fireEvent.click(deleteButton);

    expect(screen.getByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeVisible();

    const cancelButton = screen.getByText(transcriptRowMessages.cancelDeleteLabel.defaultMessage);
    fireEvent.click(cancelButton);

    expect(screen.queryByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeNull();
  });

  it('should open delete confirmation modal and handle delete', async () => {
    const updatedProps = { ...defaultProps, transcripts: ['ar']}
    renderComponent(updatedProps);
    const menuButton = screen.getByTestId('ar-transcript-menu');
    await waitFor(() => {
      fireEvent.click(menuButton);
    });
    const deleteButton = screen.getByText(transcriptRowMessages.deleteTranscript.defaultMessage).closest('a');
    fireEvent.click(deleteButton);

    expect(screen.getByText(transcriptRowMessages.deleteConfirmationHeader.defaultMessage)).toBeVisible();

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

  it('should download transcript', async () => {
    const updatedProps = { ...defaultProps, transcripts: ['ar']}
    renderComponent(updatedProps);
    const menuButton = screen.getByTestId('ar-transcript-menu');
    await waitFor(() => {
      fireEvent.click(menuButton);
    });
    const downloadButton = screen.getByText(
      transcriptRowMessages.downloadTranscript.defaultMessage,
    ).closest('a');
    axiosMock.onGet(
      `${getApiBaseUrl()}/transcript_download/?edx_video_id=${updatedProps.id}&language_code=ar`,
    ).reply(200, 'string of transcript');
    await act(async () => {
      fireEvent.click(downloadButton);
    });
    const downloadStatus = store.getState().videos.transcriptStatus;

    expect(downloadStatus).toEqual(RequestStatus.SUCCESSFUL);
  });
  it('should replace transcript', async () => {
    const updatedProps = { ...defaultProps, transcripts: ['fr', 'ar']}
    renderComponent(updatedProps);
    const dropdownButton = screen.getAllByTestId('language-select-dropdown')[0];
    await waitFor(() => {
      fireEvent.click(dropdownButton);
    });

    const englishOption = screen.getByText('English');
    const arabicOption = screen.getAllByRole('button', { name: 'Arabic' })[0];
    await act(async () => {
      expect(arabicOption).toHaveClass('disabled');
      fireEvent.click(englishOption);
    });

    const menuButton = screen.getByTestId('ar-transcript-menu');
    await waitFor(() => {
      fireEvent.click(menuButton);
    });
    const replaceButton = screen.getByText(
      transcriptRowMessages.replaceTranscript.defaultMessage,
    ).closest('a');
    axiosMock.onPost(`${getApiBaseUrl()}/transcript_upload/`).reply(204);
    const file = new File(['(⌐□_□)'], 'download.srt', { type: 'text/srt' });

    await act(async () => {
      fireEvent.click(replaceButton);
      const addFileInput = screen.getAllByLabelText('file-input')[0];
      expect(addFileInput).toBeInTheDocument();

      userEvent.upload(addFileInput, file);
    });
    const addStatus = store.getState().videos.transcriptStatus;

    expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);

    const updatedTranscripts = store.getState().models.videos[defaultProps.id].transcripts;

    expect(updatedTranscripts).toEqual(['ar', 'en']);
  });
});
