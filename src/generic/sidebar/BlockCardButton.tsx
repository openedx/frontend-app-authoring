import {
  Button, Chip, Collapsible, Icon, Stack,
} from '@openedx/paragon';
import { getIconBorderStyleColor, getItemIcon } from '../block-type-utils';

export interface BlockCardButtonProps {
  name: string;
  blockType: string;
  onClick: () => void;
  disabled?: boolean;
  templates?: {
    displayName: string;
    boilerplateName: string;
  }[];
  onClickTemplate?: (boilerplateName: string) => void;
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
}: BlockCardButtonProps) => {
  const titleComponent = (
    <Stack direction="horizontal" gap={3}>
      <span className={`p-2 rounded ${getIconBorderStyleColor(blockType)}`}>
        <Icon size="lg" src={getItemIcon(blockType)} />
      </span>
      {name}
    </Stack>
  );

  if (templates?.length) {
    return (
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
    );
  }

  return (
    <Button
      variant="tertiary"
      className="mx-2 shadow border justify-content-start px-4 font-weight-bold"
      onClick={onClick}
      disabled={disabled}
    >
      {titleComponent}
    </Button>
  );
};
