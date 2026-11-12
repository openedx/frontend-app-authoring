import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon, IconButton, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { CardSideType } from '@src/editors/containers/FlashcardsEditor/types';

interface CardImageProps {
  url: string;
  altText: string;
  index: number;
  imageType: CardSideType;
  onOpenSettings: () => void;
  onRemove: () => void;
}

/** A card's image, which opens its settings when activated, and its Remove button. */
export const CardImage = ({
  url,
  altText,
  index,
  imageType,
  onOpenSettings,
  onRemove,
}: CardImageProps) => {
  const intl = useIntl();

  return (
    <div className="d-flex align-items-center justify-content-center align-self-stretch px-4 pb-2">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`image-settings-tooltip-${imageType}-${index}`}>
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
          onClick={onOpenSettings}
        >
          <img
            style={{ maxHeight: '200px' }}
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
    </div>
  );
};
