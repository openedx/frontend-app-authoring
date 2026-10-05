import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';

import type { TextField } from '../gameContent';
import messages from '../messages';
import type { Card, GameType } from '../types';
import PictureIcon from './PictureIcon';

interface PreviewSideProps {
  field: TextField;
  text: string;
  imageUrl: string;
  imageAlt: string;
  withImages: boolean;
}

/** One side of a collapsed card: its image (or a placeholder icon), then its text. */
const PreviewSide = ({ field, text, imageUrl, imageAlt, withImages }: PreviewSideProps) => {
  const intl = useIntl();
  return (
    <span className={`preview-${field} d-flex align-items-center position-absolute text-truncate px-2`}>
      {withImages
        ? (
          <span
            className={`d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden rounded-sm border border-gray-500 mr-2 img-preview-wrapper ${
              imageUrl !== '' ? 'with-img' : 'with-icon'
            }`}
          >
            {imageUrl !== ''
              ? <img className="img-preview" src={imageUrl} alt={imageAlt} />
              : (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={`no-${field}-image-tooltip`}>
                      {intl.formatMessage(messages.noImageLabel)}
                    </Tooltip>
                  }
                >
                  <Icon className="img-preview text-gray-500" src={PictureIcon} />
                </OverlayTrigger>
              )}
          </span>
        )
        : ''}
      {text !== ''
        ? text
        : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
    </span>
  );
};

/** The one-line summary a collapsed card shows in its heading. */
const CardPreview = ({ card, type }: { card: Card; type: GameType; }) => {
  const withImages = type === 'flashcards';
  return (
    <div className="preview-block position-relative w-100 mr-2">
      <span className="align-middle">
        <PreviewSide
          field="term"
          text={card.term}
          imageUrl={card.term_image}
          imageAlt={card.term_image_alt}
          withImages={withImages}
        />
        <PreviewSide
          field="definition"
          text={card.definition}
          imageUrl={card.definition_image}
          imageAlt={card.definition_image_alt}
          withImages={withImages}
        />
      </span>
    </div>
  );
};

export default CardPreview;
