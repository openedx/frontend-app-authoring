import React, { useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Dropdown, Icon, IconButton, Stack } from '@openedx/paragon';
import { ExpandLess, ExpandMore, MoreHoriz } from '@openedx/paragon/icons';

import { SortableItem } from '@src/generic/DraggableList';
import {
  type FieldError,
  imageAlt,
  imageDisplayUrl,
  type TextField,
} from '@src/editors/containers/GamesEditor/gameContent';
import messages from '@src/editors/containers/GamesEditor/messages';
import type { Card, GameType, ImageType } from '@src/editors/containers/GamesEditor/types';
import CardField from './CardField';
import { CardImage, CardImageUploadButton } from './CardImage';
import CardPreview from './CardPreview';

const actionStyle: React.CSSProperties = {
  position: 'absolute',
  top: '6px',
  left: '12px',
  zIndex: 2,
};

const componentStyle: React.CSSProperties = {
  borderRadius: '6px',
  boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.15)',
  position: 'relative',
  width: '100%',
  flexDirection: 'column',
};

const acceptedImages = 'image/png, image/jpeg, image/gif, image/webp';

interface GameCardProps {
  card: Card;
  index: number;
  /** False for a blank draft, which has no content to move. */
  draggable?: boolean;
  type: GameType;
  /** The block's Studio, which its relative image URLs are shown from. */
  studioEndpointUrl: string;
  errors: Partial<Record<TextField, FieldError>>;
  /** Locks the image settings trigger, which sits outside the disabled fieldset's reach. */
  isSaving: boolean;
  onToggle: (isOpen: boolean) => void;
  onChange: (field: TextField, value: string) => void;
  /** Whether Move up is available for this card; false at a deck edge or beside a blank draft. */
  canMoveUp: boolean;
  /** Whether Move down is available for this card; false at a deck edge or beside a blank draft. */
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onImagePicked: (imageType: ImageType, file: File) => void;
  onImageRemoved: (imageType: ImageType) => void;
  onOpenImageSettings: (imageType: ImageType) => void;
}

/** One card of the game: a collapsible, draggable term and definition pair. */
const GameCard = ({
  card,
  index,
  draggable = true,
  type,
  studioEndpointUrl,
  errors,
  isSaving,
  onToggle,
  onChange,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
  onImagePicked,
  onImageRemoved,
  onOpenImageSettings,
}: GameCardProps) => {
  const intl = useIntl();
  // The handle names the card so a screen reader can tell the rows apart; a
  // card with no text falls back to the same "No text" the preview shows.
  // A card with no term has no name to reuse: give its handle its own label
  // rather than composing "Reorder No text".
  const dragHandleLabel = card.term.trim()
    ? intl.formatMessage(messages.dragCardHandleLabel, { cardName: card.term })
    : intl.formatMessage(messages.dragCardHandleLabelNoText);
  const fileInputs = {
    term: useRef<HTMLInputElement>(null),
    definition: useRef<HTMLInputElement>(null),
  };
  const withImages = type !== 'matching';

  const handlePick = (imageType: ImageType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    // Clear the selection now: a browser fires no `change` for re-choosing the
    // same file, so a failed upload could otherwise not be retried with it.
    // The File object is independent of the selection and stays usable.
    input.value = '';
    if (file) { onImagePicked(imageType, file); }
  };

  const handleRemove = (imageType: ImageType) => {
    const input = fileInputs[imageType].current;
    if (input) { input.value = ''; }
    onImageRemoved(imageType);
  };

  const field = (name: TextField) => {
    const imageUrl = card[`${name}_image`];
    return (
      <CardField
        field={name}
        cardId={card.id}
        value={card[name]}
        error={errors[name]}
        onChange={(value) => onChange(name, value)}
        withImages={withImages}
        image={withImages && imageUrl !== '' && (
          <CardImage
            url={imageDisplayUrl(imageUrl, studioEndpointUrl)}
            altText={imageAlt(card[`${name}_image_alt`], card[name])}
            cardId={card.id}
            imageType={name}
            isSaving={isSaving}
            onOpenSettings={() => onOpenImageSettings(name)}
            onRemove={() => handleRemove(name)}
          />
        )}
        uploadButton={withImages && <CardImageUploadButton onClick={() => fileInputs[name].current?.click()} />}
      />
    );
  };

  return (
    <SortableItem
      id={card.id}
      actions={null}
      dragHandleLabel={dragHandleLabel}
      actionStyle={actionStyle}
      componentStyle={componentStyle}
      disabled={!draggable}
    >
      <Collapsible.Advanced
        // Paragon's .card supplies the themed background.
        className="card d-flex flex-column align-items-start align-self-stretch w-100 position-relative"
        open={card.editorOpen}
        // The heading trigger is a div, so the save's disabled fieldset cannot
        // reach it: while a save is out a toggle from it is ignored, and the
        // trigger reports that with aria-disabled.
        onToggle={(isOpen: boolean) => {
          if (!isSaving) { onToggle(isOpen); }
        }}
      >
        <input
          type="file"
          id={`term_image_upload|${card.id}`}
          ref={fileInputs.term}
          hidden
          onChange={handlePick('term')}
          accept={acceptedImages}
        />
        <input
          type="file"
          id={`definition_image_upload|${card.id}`}
          ref={fileInputs.definition}
          hidden
          onChange={handlePick('definition')}
          accept={acceptedImages}
        />
        <Stack direction="horizontal" gap={2.5} className="w-100 pr-4 align-items-center">
          <Collapsible.Trigger
            className="card-heading-wrapper d-flex align-items-center flex-grow-1 py-2.5 pl-4"
            // A div, not a native control: locked by hand while a save is out,
            // as the image settings trigger is.
            aria-disabled={isSaving}
          >
            <Stack direction="horizontal" gap={2.5} className="align-self-stretch w-100 ml-4 align-items-center">
              <div className="card-number d-inline-flex align-items-center justify-content-center mr-2.5 text-primary-500 font-weight-bold">
                {index + 1}
              </div>
              {!card.editorOpen
                ? <CardPreview card={card} type={type} studioEndpointUrl={studioEndpointUrl} />
                : <div className="d-flex align-self-stretch flex-grow-1" />}
            </Stack>
          </Collapsible.Trigger>
          {/* Siblings of the trigger: a button nested in a button is invalid markup. */}
          <Dropdown>
            <Dropdown.Toggle
              className="card-dropdown"
              as={IconButton}
              src={MoreHoriz}
              iconAs={Icon}
              alt={intl.formatMessage(messages.cardActionsLabel)}
              variant="primary"
            />
            <Dropdown.Menu align="right">
              <Dropdown.Item onClick={onMoveUp} disabled={!canMoveUp}>
                {intl.formatMessage(messages.moveUpLabel)}
              </Dropdown.Item>
              <Dropdown.Item onClick={onMoveDown} disabled={!canMoveDown}>
                {intl.formatMessage(messages.moveDownLabel)}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={onDelete}>
                {intl.formatMessage(messages.deleteLabel)}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <IconButton
            src={card.editorOpen ? ExpandLess : ExpandMore}
            iconAs={Icon}
            alt={intl.formatMessage(card.editorOpen ? messages.collapseCardLabel : messages.expandCardLabel)}
            variant="primary"
            onClick={() => onToggle(!card.editorOpen)}
          />
        </Stack>
        <div className="card-body w-100 position-relative p-0">
          <Collapsible.Body>
            <div className="card-divider w-100 bg-light-400" />
            {field('term')}
            <div className="card-divider w-100 bg-light-400" />
            {field('definition')}
          </Collapsible.Body>
        </div>
      </Collapsible.Advanced>
    </SortableItem>
  );
};

export default GameCard;
