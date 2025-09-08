import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import VideoThumbnail from './VideoThumbnail';
import { VIDEO_SUCCESS_STATUSES } from './data/constants';
import { RequestStatus } from '../../data/constants';

it('shows fallback icon if thumbnail fails to load', () => {
  const { container } = render(
    <IntlProvider locale="en">
      <VideoThumbnail
        thumbnail="http://bad-url/image.png"
        displayName="Test Video"
        id="vid1"
        imageSize={{ width: '100px', height: '100px' }}
        handleAddThumbnail={jest.fn()}
        videoImageSettings={{ videoImageUploadEnabled: true, supportedFileFormats: { jpg: 'image/jpg' } }}
        status={VIDEO_SUCCESS_STATUSES[0]}
        pageLoadStatus={RequestStatus.SUCCESSFUL}
      />
    </IntlProvider>,
  );

  const image = screen.getByRole('img', { name: /video thumbnail/i });
  expect(image).toBeInTheDocument();
  fireEvent.error(image);

  expect(screen.queryByRole('img', { name: /video thumbnail/i })).toBeNull();

  const fallbackSvg = container.querySelector('svg[role="img"]');
  expect(fallbackSvg).toBeInTheDocument();
});
