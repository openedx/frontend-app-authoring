import React from 'react';
import {
  Button, Chip, Collapsible, Icon, Stack,
} from '@openedx/paragon';
import { getItemIcon } from '../block-type-utils';

export type BlockTemplate = {
  displayName: string;
  boilerplateName: string;
};

export interface BlockCardButtonProps {
  name: string;
  blockType: string;
  onClick: () => void;
  disabled?: boolean;
  templates?: BlockTemplate[];
  onClickTemplate?: (boilerplateName: string) => void;
  actionIcon?: React.ReactElement;
}

/**
 * Renders a Card button with icon, name and templates of a block type
 */
export const BlockCardButton = ({
  name,
  blockType,
  onClick,
  templates,
  disabled = false,
  onClickTemplate,
  actionIcon,
}: BlockCardButtonProps) => {
  const titleComponent = (
    <Stack direction="horizontal" gap={3}>
      <span className={`icon-with-border icon-with-border-${blockType} p-2 rounded`}>
        <Icon size="lg" src={getItemIcon(blockType)} />
      </span>
      <span className="text-primary-700">
        {name}
      </span>
    </Stack>
  );

  if (templates?.length) {
    return (
      <div data-testid={`${blockType}-collapsible`}>
        <Collapsible
          styling="card-lg"
          className="mx-2 font-weight-bold shadow pl-1 rounded"
          title={titleComponent}
        >
          <Stack direction="horizontal" className="d-flex flex-wrap" gap={2}>
            {templates.map((template) => (
              <Chip onClick={() => onClickTemplate?.(template.boilerplateName)}>
                {template.displayName}
              </Chip>
            ))}
          </Stack>
        </Collapsible>
      </div>
    );
  }

  return (
    <Button
      variant="tertiary"
      className="mx-2 shadow border justify-content-between pl-4 font-weight-bold"
      onClick={onClick}
      disabled={disabled}
    >
      {titleComponent}
      <div className="mr-1">
        {actionIcon}
      </div>
    </Button>
  );
};
