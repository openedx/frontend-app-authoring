import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '@src/testUtils';
import VideoSourceWidget from '.';
import * as hooks from './hooks';
import * as widgetHooks from '../hooks';

describe('VideoSourceWidget', () => {
  let widgetValuesSpy;
  let videoIdChangeAlertSpy;
  let sourceHooksSpy;
  let fallbackHooksSpy;
  beforeEach(() => {
    jest.resetModules();
    widgetValuesSpy = jest.spyOn(widgetHooks, 'widgetValues');
    videoIdChangeAlertSpy = jest.spyOn(hooks, 'videoIdChangeAlert');
    sourceHooksSpy = jest.spyOn(hooks, 'sourceHooks');
    fallbackHooksSpy = jest.spyOn(hooks, 'fallbackHooks');
    initializeMocks();
  });

  it('renders all main fields and labels', () => {
    widgetValuesSpy.mockReturnValue({
      videoId: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      videoSource: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      fallbackVideos: {
        formValue: [], onChange: jest.fn(), onBlur: jest.fn(), local: [],
      },
      allowVideoDownloads: { local: false, onCheckedChange: jest.fn() },
    });
    videoIdChangeAlertSpy.mockReturnValue({
      videoIdChangeAlert: { set: jest.fn(), show: false, dismiss: jest.fn() },
    });
    sourceHooksSpy.mockReturnValue({
      updateVideoId: jest.fn(),
      updateVideoURL: jest.fn(),
    });
    fallbackHooksSpy.mockReturnValue({
      addFallbackVideo: jest.fn(),
      deleteFallbackVideo: jest.fn(),
    });

    render(<VideoSourceWidget />);
    expect(screen.getByText('Video source')).toBeInTheDocument();
    expect(screen.getByLabelText('Video ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Video URL')).toBeInTheDocument();
    expect(screen.getByText('Allow video downloads')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('calls updateVideoId on videoId field blur', () => {
    const updateVideoId = jest.fn();
    widgetValuesSpy.mockReturnValue({
      videoId: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      videoSource: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      fallbackVideos: {
        formValue: [], onChange: jest.fn(), onBlur: jest.fn(), local: [],
      },
      allowVideoDownloads: { local: false, onCheckedChange: jest.fn() },
    });
    videoIdChangeAlertSpy.mockReturnValue({
      videoIdChangeAlert: { set: jest.fn(), show: false, dismiss: jest.fn() },
    });
    sourceHooksSpy.mockReturnValue({
      updateVideoId,
      updateVideoURL: jest.fn(),
    });
    fallbackHooksSpy.mockReturnValue({
      addFallbackVideo: jest.fn(),
      deleteFallbackVideo: jest.fn(),
    });

    render(<VideoSourceWidget />);
    const videoIdInput = screen.getByLabelText('Video ID');
    fireEvent.blur(videoIdInput);
    expect(updateVideoId).toHaveBeenCalled();
  });

  it('calls updateVideoURL on videoSource field blur', () => {
    const updateVideoURL = jest.fn();
    widgetValuesSpy.mockReturnValue({
      videoId: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      videoSource: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      fallbackVideos: {
        formValue: [], onChange: jest.fn(), onBlur: jest.fn(), local: [],
      },
      allowVideoDownloads: { local: false, onCheckedChange: jest.fn() },
    });
    videoIdChangeAlertSpy.mockReturnValue({
      videoIdChangeAlert: { set: jest.fn(), show: false, dismiss: jest.fn() },
    });
    sourceHooksSpy.mockReturnValue({
      updateVideoId: jest.fn(),
      updateVideoURL,
    });
    fallbackHooksSpy.mockReturnValue({
      addFallbackVideo: jest.fn(),
      deleteFallbackVideo: jest.fn(),
    });

    render(<VideoSourceWidget />);
    const videoUrlInput = screen.getByLabelText('Video URL');
    fireEvent.blur(videoUrlInput);
    expect(updateVideoURL).toHaveBeenCalled();
  });

  it('renders fallback video fields and calls deleteFallbackVideo on delete', () => {
    const deleteFallbackVideo = jest.fn();
    widgetValuesSpy.mockReturnValue({
      videoId: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      videoSource: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      fallbackVideos: {
        formValue: ['url1', 'url2'],
        onChange: () => jest.fn(),
        onBlur: () => jest.fn(),
        local: ['url1', 'url2'],
      },
      allowVideoDownloads: { local: false, onCheckedChange: jest.fn() },
    });
    videoIdChangeAlertSpy.mockReturnValue({
      videoIdChangeAlert: { set: jest.fn(), show: false, dismiss: jest.fn() },
    });
    sourceHooksSpy.mockReturnValue({
      updateVideoId: jest.fn(),
      updateVideoURL: jest.fn(),
    });
    fallbackHooksSpy.mockReturnValue({
      addFallbackVideo: jest.fn(),
      deleteFallbackVideo,
    });

    render(<VideoSourceWidget />);
    expect(screen.getAllByText('Video URL').length).toBe(3); // 1 main + 2 fallback
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(deleteFallbackVideo).toHaveBeenCalledWith(0);
  });

  it('calls addFallbackVideo when add button is clicked', () => {
    const addFallbackVideo = jest.fn();
    widgetValuesSpy.mockReturnValue({
      videoId: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      videoSource: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      fallbackVideos: {
        formValue: [], onChange: jest.fn(), onBlur: jest.fn(), local: [],
      },
      allowVideoDownloads: { local: false, onCheckedChange: jest.fn() },
    });
    videoIdChangeAlertSpy.mockReturnValue({
      videoIdChangeAlert: { set: jest.fn(), show: false, dismiss: jest.fn() },
    });
    sourceHooksSpy.mockReturnValue({
      updateVideoId: jest.fn(),
      updateVideoURL: jest.fn(),
    });
    fallbackHooksSpy.mockReturnValue({
      addFallbackVideo,
      deleteFallbackVideo: jest.fn(),
    });

    render(<VideoSourceWidget />);
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    expect(addFallbackVideo).toHaveBeenCalled();
  });

  it('calls allowDownload.onCheckedChange when checkbox is clicked', () => {
    const onCheckedChange = jest.fn();
    widgetValuesSpy.mockReturnValue({
      videoId: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      videoSource: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      fallbackVideos: {
        formValue: [], onChange: jest.fn(), onBlur: jest.fn(), local: [],
      },
      allowVideoDownloads: { local: false, onCheckedChange },
    });
    videoIdChangeAlertSpy.mockReturnValue({
      videoIdChangeAlert: { set: jest.fn(), show: false, dismiss: jest.fn() },
    });
    sourceHooksSpy.mockReturnValue({
      updateVideoId: jest.fn(),
      updateVideoURL: jest.fn(),
    });
    fallbackHooksSpy.mockReturnValue({
      addFallbackVideo: jest.fn(),
      deleteFallbackVideo: jest.fn(),
    });

    render(<VideoSourceWidget />);
    const checkbox = screen.getByLabelText('Allow video downloads');
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalled();
  });

  it('shows error alert when videoIdChangeAlert.show is true', () => {
    widgetValuesSpy.mockReturnValue({
      videoId: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      videoSource: {
        onChange: jest.fn(), onBlur: jest.fn(), local: '', formValue: '',
      },
      fallbackVideos: {
        formValue: [], onChange: jest.fn(), onBlur: jest.fn(), local: [],
      },
      allowVideoDownloads: { local: false, onCheckedChange: jest.fn() },
    });
    videoIdChangeAlertSpy.mockReturnValue({
      videoIdChangeAlert: { set: jest.fn(), show: true, dismiss: jest.fn() },
    });
    sourceHooksSpy.mockReturnValue({
      updateVideoId: jest.fn(),
      updateVideoURL: jest.fn(),
    });
    fallbackHooksSpy.mockReturnValue({
      addFallbackVideo: jest.fn(),
      deleteFallbackVideo: jest.fn(),
    });

    render(<VideoSourceWidget />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
