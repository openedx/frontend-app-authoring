import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';

import { imageAlt, imageDisplayUrl, type TextField } from '@src/editors/containers/FlashcardsEditor/flashcardsContent';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import type { Card } from '@src/editors/containers/FlashcardsEditor/types';
import PictureIcon from './PictureIcon';

interface PreviewSideProps {
  field: TextField;
  text: string;
  imageUrl: string;
  imageAlt: string;
}

/** One side of a collapsed card: its image (or a placeholder icon), then its text. */
const PreviewSide = ({ field, text, imageUrl, imageAlt }: PreviewSideProps) => {
  const intl = useIntl();
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
              src={imageUrl}
              alt={imageAlt}
              style={{ maxWidth: '2rem', maxHeight: '2rem', objectFit: 'cover' }}
            />
          )
          : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`no-${field}-image-tooltip`}>
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
const CardPreview = ({ card, studioEndpointUrl }: { card: Card; studioEndpointUrl: string; }) => {
  return (
    <div className="w-100 mr-2">
      <PreviewSide
        field="term"
        text={card.term}
        imageUrl={imageDisplayUrl(card.term_image, studioEndpointUrl)}
        imageAlt={imageAlt(card.term_image_alt, card.term)}
      />
      <PreviewSide
        field="definition"
        text={card.definition}
        imageUrl={imageDisplayUrl(card.definition_image, studioEndpointUrl)}
        imageAlt={imageAlt(card.definition_image_alt, card.definition)}
      />
    </div>
  );
};

export default CardPreview;
