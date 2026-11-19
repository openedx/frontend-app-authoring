import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';

import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { useContext, useId } from 'react';
import { Card } from '@src/editors/containers/FlashcardsEditor/types';
import { FlashcardsEditorContext } from '@src/editors/containers/FlashcardsEditor/context';
import PictureIcon from './PictureIcon';

interface PreviewSideProps {
  text: string;
  imageUrl: string;
  imageAlt: string;
}

/** One side of a collapsed card: its image (or a placeholder icon), then its text. */
const PreviewSide = ({ text, imageUrl, imageAlt }: PreviewSideProps) => {
  const intl = useIntl();
  const id = useId();
  const { staticRootUrl } = useContext(FlashcardsEditorContext);

  return (
    <span className="d-inline-flex align-items-center text-truncate w-50 px-2">
      <span
        className="d-flex align-items-center justify-content-center overflow-hidden rounded-sm border border-gray-500 mr-2"
        style={{
          width: '2rem',
          minWidth: '2rem',
          height: '2rem',
        }}
      >
        {imageUrl !== ''
          ? (
            <img
              className="img-preview"
              src={staticRootUrl + imageUrl}
              alt={imageAlt}
              style={{ maxWidth: '2rem', maxHeight: '2rem', objectFit: 'cover' }}
            />
          )
          : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={id}>
                  {intl.formatMessage(messages.noImageLabel)}
                </Tooltip>
              }
            >
              <Icon className="text-gray-500" src={PictureIcon} />
            </OverlayTrigger>
          )}
      </span>
      {text !== ''
        ? text
        : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
    </span>
  );
};

/** The one-line summary a collapsed card shows in its heading. */
const CardPreview = ({ card }: { card: Card; }) => {
  return (
    <div className="w-100 mr-2">
      <PreviewSide
        text={card.front.text}
        imageUrl={card.front.image.url}
        imageAlt={card.front.image.alt || card.front.text}
      />
      <PreviewSide
        text={card.back.text}
        imageUrl={card.back.image.url}
        imageAlt={card.back.image.alt || card.back.text}
      />
    </div>
  );
};

export default CardPreview;
