import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';

import VideoGallery from './index';

jest.unmock('react-redux');
jest.unmock('@edx/frontend-platform/i18n');
jest.unmock('@openedx/paragon');
jest.unmock('@openedx/paragon/icons');

let store;
const initialVideos = [
  {
    edx_video_id: 'id_1',
    client_video_id: 'client_id_1',
    course_video_image_url: 'course_video_image_url_1',
    created: '2022-09-07T04:56:58.726Z',
    status: 'Uploading',
    status_nontranslated: 'Uploading',
    duration: 3,
    transcripts: [],
  },
  {
    edx_video_id: 'id_2',
    client_video_id: 'client_id_2',
    course_video_image_url: 'course_video_image_url_2',
    created: '2022-11-07T04:56:58.726Z',
    status: 'In Progress',
    status_nontranslated: 'In Progress',
    duration: 2,
    transcripts: [],
  }, {
    edx_video_id: 'id_3',
    client_video_id: 'client_id_3',
    course_video_image_url: 'course_video_image_url_3',
    created: '2022-01-07T04:56:58.726Z',
    status: 'Ready',
    status_nontranslated: 'Ready',
    duration: 4,
    transcripts: [],
  },
];

// We are not using any style-based assertions and this function is very slow with jest-dom
window.getComputedStyle = () => ({
  getPropertyValue: () => undefined,
});

describe('VideoGallery', () => {
  describe('component', () => {
    let oldLocation;
    beforeEach(async () => {
      store = configureStore({
        reducer: (state, action) => ((action && action.newState) ? action.newState : state),
        preloadedState: {
          app: {
            videos: initialVideos,
            learningContextId: 'course-v1:test+test+test',
            blockId: 'some-block-id',
          },
          requests: {
            fetchVideos: { status: 'completed' },
            uploadVideo: { status: 'inactive' },
          },
        },
      });

      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'test-user',
          administrator: true,
          roles: [],
        },
      });
    });
    beforeAll(() => {
      oldLocation = window.location;
      delete window.location;
      window.location = { replace: jest.fn() };
    });
    afterAll(() => {
      window.location = oldLocation;
    });

    function updateState({ videos = initialVideos, fetchVideos = 'completed', uploadVideos = 'inactive' }) {
      store.dispatch({
        type: '',
        newState: {
          app: {
            videos,
            learningContextId: 'course-v1:test+test+test',
            blockId: 'some-block-id',
          },
          requests: {
            fetchVideos: { status: fetchVideos },
            uploadVideo: { status: uploadVideos },
          },
        },
      });
    }

    async function renderComponent() {
      return render(
        <AppProvider store={store}>
          <VideoGallery />
        </AppProvider>,
      );
    }

    it('displays a list of videos', async () => {
      await renderComponent();
      initialVideos.forEach(video => (
        expect(screen.getByText(video.client_video_id)).toBeInTheDocument()
      ));
    });
    it('navigates to video upload page when there are no videos', async () => {
      expect(window.location.replace).not.toHaveBeenCalled();
      updateState({ videos: [] });
      await renderComponent();
      expect(window.location.replace).toHaveBeenCalled();
    });
    it.each([
      [/newest/i, [2, 1, 3]],
      [/oldest/i, [3, 1, 2]],
      [/name A-Z/i, [1, 2, 3]],
      [/name Z-A/i, [3, 2, 1]],
      [/longest/i, [3, 1, 2]],
      [/shortest/i, [2, 1, 3]],
    ])('videos can be sorted %s', async (sortBy, order) => {
      await renderComponent();

      fireEvent.click(screen.getByRole('button', {
        name: /By newest/i,
      }));
      fireEvent.click(screen.getByRole('link', {
        name: sortBy,
      }));
      const videoElements = screen.getAllByRole('button', { name: /client_id/ });
      order.forEach((clientIdSuffix, idx) => {
        expect(videoElements[idx]).toHaveTextContent(`client_id_${clientIdSuffix}`);
      });
    });
    it.each([
      ['Uploading', 1, [1]],
      ['In Progress', 1, [2]],
      ['Ready', 1, [3]],
      ['Failed', 1, [4]],
    ])('videos can be filtered by status %s', async (filterBy, length, items) => {
      await renderComponent();
      updateState({
        videos: [...initialVideos, {
          edx_video_id: 'id_4',
          client_video_id: 'client_id_4',
          course_video_image_url: 'course_video_image_url_4',
          created: '2022-01-07T04:56:58.726Z',
          status: 'Failed',
          status_nontranslated: 'Failed',
          duration: 4,
          transcripts: [],
        }],
      });

      act(() => {
        fireEvent.click(screen.getByTestId('dropdown-filter'));
      });

      act(() => {
        fireEvent.click(screen.getByRole('button', {
          name: filterBy,
        }));
      });

      const videoElements = await screen.findAllByRole('button', { name: /client_id/ });
      expect(videoElements).toHaveLength(length);
      items.forEach(clientIdx => (
        expect(screen.getByText(`client_id_${clientIdx}`)).toBeInTheDocument()
      ));
    });

    it('filters videos by search string', async () => {
      await renderComponent();
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'CLIENT_ID_2' } });
      expect(screen.queryByText('client_id_2')).toBeInTheDocument();
      expect(screen.queryByText('client_id_1')).not.toBeInTheDocument();
      expect(screen.queryByText('client_id_3')).not.toBeInTheDocument();
    });
  });
});
