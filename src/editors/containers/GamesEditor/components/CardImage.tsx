import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon, IconButton, OverlayTrigger, Stack, Tooltip } from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import messages from '@src/editors/containers/GamesEditor/messages';
import type { ImageType } from '@src/editors/containers/GamesEditor/types';
import PictureIcon from './PictureIcon';

interface CardImageProps {
  url: string;
  altText: string;
  /** The card's id: every deck may render a card at the same position. */
  cardId: string;
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
  cardId,
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
    <Stack
      direction="horizontal"
      gap={2.5}
      className="card-image-area justify-content-center align-self-stretch px-4 pb-2"
    >
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`image-settings-tooltip-${imageType}-${cardId}`}>
            {intl.formatMessage(messages.imageSettingsTooltip)}
          </Tooltip>
        }
      >
        <Button
          variant="link"
          className="p-0 border-0 rounded-0"
          // Named here, not by the image inside: a decorative image has an
          // empty alt, which would leave this button with no name.
          aria-label={intl.formatMessage(messages.imageSettingsTooltip)}
          // Outside the disabled fieldset, so locked by hand: an alt-text
          // change made while a save is out is not in that save's payload.
          // `aria-disabled` rather than `disabled` keeps it in the tab order.
          aria-disabled={isSaving}
          onClick={openSettings}
        >
          <img
            className="card-image"
            src={url}
            alt={altText}
          />
        </Button>
      </OverlayTrigger>
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt={intl.formatMessage(messages.removeImageLabel)}
        variant="primary"
        onClick={onRemove}
      />
    </Stack>
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
