import React, { useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Dropdown, Icon, IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore, MoreHoriz } from '@openedx/paragon/icons';

import { SortableItem } from '@src/generic/DraggableList';
import type { FieldError, TextField } from '../gameContent';
import messages from '../messages';
import type { Card, GameType, ImageType } from '../types';
import CardField from './CardField';
import { CardImage, CardImageUploadButton } from './CardImage';
import CardPreview from './CardPreview';

const actionStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  zIndex: 2,
};

const componentStyle: React.CSSProperties = {
  background: 'white',
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
  type: GameType;
  errors: Partial<Record<TextField, FieldError>>;
  /** Locks the image settings trigger, which sits outside the disabled fieldset's reach. */
  isSaving: boolean;
  onToggle: (isOpen: boolean) => void;
  onChange: (field: TextField, value: string) => void;
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
  type,
  errors,
  isSaving,
  onToggle,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onImagePicked,
  onImageRemoved,
  onOpenImageSettings,
}: GameCardProps) => {
  const intl = useIntl();
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
        index={index}
        value={card[name]}
        error={errors[name]}
        onChange={(value) => onChange(name, value)}
        withImages={withImages}
        image={withImages && imageUrl !== '' && (
          <CardImage
            url={imageUrl}
            altText={card[`${name}_image_alt`]}
            index={index}
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
      actionStyle={actionStyle}
      componentStyle={componentStyle}
    >
      <Collapsible.Advanced
        className="card d-flex flex-column align-items-start align-self-stretch w-100 position-relative bg-white"
        open={card.editorOpen}
        onToggle={onToggle}
      >
        <input
          type="file"
          id={`term_image_upload|${index}`}
          ref={fileInputs.term}
          hidden
          onChange={handlePick('term')}
          accept={acceptedImages}
        />
        <input
          type="file"
          id={`definition_image_upload|${index}`}
          ref={fileInputs.definition}
          hidden
          onChange={handlePick('definition')}
          accept={acceptedImages}
        />
        <div className="card-heading-row d-flex align-items-center w-100 pr-4">
          <Collapsible.Trigger className="card-heading-wrapper d-flex align-items-center flex-grow-1 py-2.5 pl-4">
            <div className="card-heading d-flex align-items-center align-self-stretch w-100 ml-4">
              <div className="card-number d-inline-flex align-items-center justify-content-center mr-2.5 text-primary-500 font-weight-bold">
                {index + 1}
              </div>
              {!card.editorOpen
                ? <CardPreview card={card} type={type} />
                : <div className="d-flex align-self-stretch flex-grow-1" />}
            </div>
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
              <Dropdown.Item onClick={onMoveUp}>
                {intl.formatMessage(messages.moveUpLabel)}
              </Dropdown.Item>
              <Dropdown.Item onClick={onMoveDown}>
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
        </div>
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
