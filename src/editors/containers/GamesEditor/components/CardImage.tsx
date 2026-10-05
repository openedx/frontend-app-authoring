import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import messages from '../messages';
import type { ImageType } from '../types';
import PictureIcon from './PictureIcon';

interface CardImageProps {
  url: string;
  altText: string;
  index: number;
  imageType: ImageType;
  /** Locks the settings trigger while a save is out. */
  isSaving: boolean;
  onOpenSettings: () => void;
  onRemove: () => void;
}

/** A card's image, which opens its settings when activated, and its Remove button. */
export const CardImage = ({
  url,
  altText,
  index,
  imageType,
  isSaving,
  onOpenSettings,
  onRemove,
}: CardImageProps) => {
  const intl = useIntl();
  const openSettings = () => {
    if (isSaving) { return; }
    onOpenSettings();
  };
  return (
    <div className="card-image-area d-flex align-items-center justify-content-center align-self-stretch px-4 pb-2">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`image-settings-tooltip-${imageType}-${index}`}>
            {intl.formatMessage(messages.imageSettingsTooltip)}
          </Tooltip>
        }
      >
        <div
          role="button"
          tabIndex={0}
          // Named here, not by the image inside: a decorative image has an
          // empty alt, which would leave this button with no name.
          aria-label={intl.formatMessage(messages.imageSettingsTooltip)}
          // Outside the disabled fieldset, so locked by hand: an alt-text
          // change made while a save is out is not in that save's payload.
          aria-disabled={isSaving}
          style={{ cursor: isSaving ? 'default' : 'pointer', display: 'inline-block' }}
          onClick={openSettings}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openSettings();
            }
          }}
        >
          {
            /* An empty alt is the author's "decorative" choice (see
            GameImageSettingsModal) and must stay empty. */
          }
          <img
            className="card-image"
            src={url}
            alt={altText}
          />
        </div>
      </OverlayTrigger>
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt={intl.formatMessage(messages.removeImageLabel)}
        variant="primary"
        onClick={onRemove}
      />
    </div>
  );
};

/** Opens the file picker for a card image. */
export const CardImageUploadButton = ({ onClick }: { onClick: () => void; }) => {
  const intl = useIntl();
  return (
    <IconButton
      src={PictureIcon}
      iconAs={Icon}
      alt={intl.formatMessage(messages.addImageLabel)}
      variant="dark"
      onClick={onClick}
    />
  );
};
