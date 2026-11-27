import type React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Image } from '@openedx/paragon';
import { getSrc, hasImagePreview } from './data/utils';
import messages from './messages';

export interface FileThumbnailProps {
  thumbnail?: string | null;
  wrapperType?: string | null;
  contentType?: string | null;
  externalUrl?: string | null;
  displayName?: string | null;
  imageSize: {
    width?: string;
    height: string;
  };
}

const FileThumbnail = ({
  thumbnail,
  wrapperType,
  contentType,
  externalUrl,
  displayName,
  imageSize,
}: FileThumbnailProps) => {
  const intl = useIntl();

  const previewFields = {
    thumbnail,
    externalUrl,
    wrapperType,
    contentType,
  };
  const src = getSrc(previewFields);
  const { width, height } = imageSize;

  return (
    <div className="row justify-content-center align-itmes-center">
      {hasImagePreview(previewFields) ?
        (
          <Image
            style={{
              width,
              height,
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            className="border rounded p-1"
            src={src as string}
            alt={intl.formatMessage(messages.thumbnailAltMessage, { displayName })}
          />
        ) :
        (
          <div
            className="row justify-content-center align-items-center m-0 border rounded"
            style={imageSize}
          >
            <Icon src={src as React.ComponentType} style={{ height: '48px', width: '48px' }} />
          </div>
        )}
    </div>
  );
};

export default FileThumbnail;
