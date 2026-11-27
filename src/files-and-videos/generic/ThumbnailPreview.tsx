import React from 'react';

export interface ThumbnailPreviewData {
  thumbnail?: string | null;
  wrapperType?: string | null;
  contentType?: string | null;
  externalUrl?: string | null;
  displayName?: string | null;
  imageSize: {
    width: string;
    height: string;
  };
  id?: string | null;
  status?: string | null;
}

interface ThumbnailPreviewProps extends ThumbnailPreviewData {
  /** Renders the preview; FileThumbnail on the Files page, VideoThumbnail on the Videos page. */
  thumbnailPreview: (data: ThumbnailPreviewData) => React.ReactNode;
}

const ThumbnailPreview = ({
  thumbnail,
  wrapperType,
  contentType,
  externalUrl,
  displayName,
  imageSize,
  id,
  status,
  thumbnailPreview,
}: ThumbnailPreviewProps) => (
  <>
    {thumbnailPreview({
      thumbnail,
      wrapperType,
      contentType,
      externalUrl,
      displayName,
      imageSize,
      id,
      status,
    })}
  </>
);

export default ThumbnailPreview;
