import { ActionRow, Icon, Stack } from "@openedx/paragon";
import { getItemIcon } from "../generic/block-type-utils";
import { ContainerType } from "../generic/key-utils";
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';

export type ContainerState = "removed" | "added" | "modified" | "moved";

export interface ContainerRowProps {
  title: string;
  containerType: ContainerType | keyof typeof COMPONENT_TYPES;
  state?: ContainerState;
  tense?: "past" | "future";
  onClick?: () => void;
}

const ContainerRow = ({ title, containerType, state, tense, onClick }: ContainerRowProps) => {
  return (
    <ActionRow onClick={onClick}>
      {state}
      <Stack direction="horizontal" gap={2}>
        <Icon
          src={getItemIcon(containerType.toString())}
          screenReaderText={containerType.toString()}
          title={title}
        />
        <span>{title}</span>
      </Stack>
      {tense}
    </ActionRow>
  )
}

export default ContainerRow
