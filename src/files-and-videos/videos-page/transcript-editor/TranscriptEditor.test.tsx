import type MockAdapter from 'axios-mock-adapter';
import { logError } from '@edx/frontend-platform/logging';

import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import TranscriptEditor from './TranscriptEditor';
import messages from './messages';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const SRT = [
  '1',
  '00:00:01,000 --> 00:00:02,000',
  'Hello',
  '',
  '2',
  '00:00:03,000 --> 00:00:04,000',
  'World',
].join('\n');

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  language: 'en',
  languages: { en: 'English' },
  video: {
    id: 'vid-1',
    displayName: 'My Video',
    downloadLink: 'https://cdn.example.com/video.mp4',
  },
  transcriptSettings: {
    transcriptDownloadHandlerUrl: '/transcript_download/',
    transcriptUploadHandlerUrl: '/transcript_upload/',
  },
};

let axiosMock: MockAdapter;
let playSpy: jest.SpyInstance;

const readFileText = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

const renderEditor = (props = {}) => render(<TranscriptEditor {...defaultProps} {...props} />);

const mockTranscript = (body: string = SRT) => {
  axiosMock.onGet(/transcript_download/).reply(200, body);
};

beforeAll(() => {
  // jsdom does not implement these; the component guards on their presence.
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-track');
  global.URL.revokeObjectURL = jest.fn();
  Element.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  ({ axiosMock } = initializeMocks());
  jest.clearAllMocks();
  playSpy = jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
});

afterEach(() => {
  playSpy.mockRestore();
  jest.useRealTimers();
});

describe('TranscriptEditor', () => {
  it('fetches the transcript for the video/language and renders its cues', async () => {
    mockTranscript();
    renderEditor();

    expect(await screen.findByDisplayValue('Hello')).toBeInTheDocument();
    expect(screen.getByDisplayValue('World')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(axiosMock.history.get[0].url).toContain(
      '/transcript_download/?edx_video_id=vid-1&language_code=en',
    );
  });

  it('shows an error alert when the transcript fails to load', async () => {
    axiosMock.onGet(/transcript_download/).reply(500);
    renderEditor();

    expect(await screen.findByText(messages.saveFailedLabel.defaultMessage)).toBeInTheDocument();
  });

  it('saves edited cues as a re-uploaded SRT file and shows the saved indicator', async () => {
    mockTranscript();
    axiosMock.onPost(/transcript_upload/).reply(200);
    renderEditor();

    fireEvent.change(await screen.findByDisplayValue('Hello'), { target: { value: 'Hello edited' } });
    fireEvent.click(screen.getByRole('button', { name: messages.saveButtonLabel.defaultMessage }));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    const formData = axiosMock.history.post[0].data as FormData;
    expect(formData.get('edx_video_id')).toBe('vid-1');
    expect(formData.get('language_code')).toBe('en');
    expect(formData.get('new_language_code')).toBe('en');
    const file = formData.get('file') as File;
    expect(file.name).toBe('My Video-en.srt');
    expect(await readFileText(file)).toContain('Hello edited');

    expect(await screen.findByText(messages.savedLabel.defaultMessage)).toBeInTheDocument();

    // The "Saved" indicator clears itself after five seconds.
    await waitFor(
      () => expect(screen.queryByText(messages.savedLabel.defaultMessage)).not.toBeInTheDocument(),
      { timeout: 6000 },
    );
  }, 15000);

  it('surfaces save failures and logs the error', async () => {
    mockTranscript();
    axiosMock.onPost(/transcript_upload/).reply(500);
    renderEditor();

    fireEvent.change(await screen.findByDisplayValue('Hello'), { target: { value: 'Hello edited' } });
    fireEvent.click(screen.getByRole('button', { name: messages.saveButtonLabel.defaultMessage }));

    expect(await screen.findByText(messages.saveFailedLabel.defaultMessage)).toBeInTheDocument();
    expect(logError).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: messages.saveButtonLabel.defaultMessage })).toBeEnabled();
  });

  it('closes immediately when there are no unsaved changes', async () => {
    const onClose = jest.fn();
    mockTranscript();
    renderEditor({ onClose });

    await screen.findByDisplayValue('Hello');
    fireEvent.click(screen.getByRole('button', { name: messages.cancelButtonLabel.defaultMessage }));

    expect(onClose).toHaveBeenCalledWith(false);
    expect(screen.queryByText(messages.unsavedModalTitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('asks for confirmation before discarding unsaved changes', async () => {
    const onClose = jest.fn();
    mockTranscript();
    renderEditor({ onClose });

    fireEvent.change(await screen.findByDisplayValue('Hello'), { target: { value: 'Changed' } });
    fireEvent.click(screen.getByRole('button', { name: messages.cancelButtonLabel.defaultMessage }));

    expect(await screen.findByText(messages.unsavedModalDescription.defaultMessage)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: messages.keepEditingButtonLabel.defaultMessage }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: messages.cancelButtonLabel.defaultMessage }));
    fireEvent.click(await screen.findByRole('button', { name: messages.closeEditorButtonLabel.defaultMessage }));
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it('inserts a first cue into an empty transcript and flags empty text as invalid', async () => {
    mockTranscript('');
    renderEditor();

    fireEvent.click(await screen.findByRole('button', { name: messages.insertCueLabel.defaultMessage }));

    expect(screen.getByDisplayValue('00:00:00,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('00:00:02,000')).toBeInTheDocument();
    expect(screen.getByText(messages.invalidCueTextLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.saveButtonLabel.defaultMessage })).toBeDisabled();
  });

  it('inserts a cue after an existing one and deletes cues', async () => {
    mockTranscript();
    renderEditor();
    await screen.findByDisplayValue('Hello');

    fireEvent.click(screen.getAllByRole('button', { name: messages.insertCueLabel.defaultMessage })[0]);
    // New cue starts where the first cue ends, capped at the next cue's start.
    expect(screen.getAllByDisplayValue('00:00:02,000')).toHaveLength(2);
    expect(screen.getAllByDisplayValue('00:00:03,000')).toHaveLength(2);

    const deleteButtons = screen.getAllByRole('button', { name: messages.deleteCueLabel.defaultMessage });
    expect(deleteButtons).toHaveLength(3);
    fireEvent.click(deleteButtons[1]);
    expect(screen.getAllByRole('button', { name: messages.deleteCueLabel.defaultMessage })).toHaveLength(2);
  });

  it('normalizes timestamp edits on blur and flags invalid ranges', async () => {
    mockTranscript();
    renderEditor();
    await screen.findByDisplayValue('Hello');

    const start = screen.getByDisplayValue('00:00:03,000');
    fireEvent.change(start, { target: { value: '00:00:03.500' } });
    // Dots are normalized to commas while typing...
    expect(screen.getByDisplayValue('00:00:03,500')).toBeInTheDocument();
    fireEvent.blur(screen.getByDisplayValue('00:00:03,500'), { target: { value: '00:00:03,500' } });
    expect(screen.getByDisplayValue('00:00:03,500')).toBeInTheDocument();

    // ...and an end time before the start time is flagged, disabling Save.
    const end = screen.getByDisplayValue('00:00:04,000');
    fireEvent.change(end, { target: { value: '00:00:01,000' } });
    expect(screen.getByText(messages.invalidTimestampLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.saveButtonLabel.defaultMessage })).toBeDisabled();
  });

  it('seeks the preview on cue play, ignoring interrupted play() but logging other errors', async () => {
    mockTranscript();
    renderEditor();
    await screen.findByDisplayValue('Hello');

    const abortError = new Error('interrupted');
    abortError.name = 'AbortError';
    playSpy.mockRejectedValueOnce(abortError);

    const seekButtons = screen.getAllByRole('button', { name: messages.seekCueLabel.defaultMessage });
    fireEvent.click(seekButtons[0]);
    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(1));
    expect(logError).not.toHaveBeenCalled();
    // Seeking into the first cue's range marks it active.
    expect(document.querySelector('.transcript-editor-modal__cue--active')).not.toBeNull();

    playSpy.mockRejectedValueOnce(new Error('autoplay blocked'));
    fireEvent.click(seekButtons[1]);
    await waitFor(() => expect(logError).toHaveBeenCalledTimes(1));
  });
});
