import {
  ActionRow, Card, Icon, Stack,
} from '@openedx/paragon';
import type { MessageDescriptor } from 'react-intl';
import { useMemo } from 'react';
import {
  Cached, Delete, Done, Plus,
} from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { getItemIcon } from '../generic/block-type-utils';
import { ContainerType } from '../generic/key-utils';
import { COMPONENT_TYPES } from '../generic/block-type-utils/constants';
import { ContainerState } from './types';

export interface ContainerRowProps {
  title: string;
  containerType: ContainerType | keyof typeof COMPONENT_TYPES | string;
  state?: ContainerState;
  side: 'Before' | 'After';
  originalName?: string;
  onClick?: () => void;
}

const ContainerRow = ({
  title, containerType, state, side, originalName, onClick,
}: ContainerRowProps) => {
  const stateContext = useMemo(() => {
    let message: MessageDescriptor | undefined;
    switch (state) {
      case 'added':
        message = side === 'Before' ? messages.addedDiffBeforeMessage : messages.addedDiffAfterMessage;
        return ['text-white bg-success-500', Plus, message];
      case 'modified':
        message = side === 'Before' ? messages.modifiedDiffBeforeMessage : messages.modifiedDiffAfterMessage;
        return ['text-white bg-warning-800', Cached, message];
      case 'removed':
        message = side === 'Before' ? messages.removedDiffBeforeMessage : messages.removedDiffAfterMessage;
        return ['text-white bg-danger-600', Delete, message];
      case 'renamed':
        message = side === 'Before' ? messages.renamedDiffBeforeMessage : messages.renamedDiffAfterMessage;
        return ['bg-light-300 text-light-300 ', Done, message];
      case 'moved':
        message = side === 'Before' ? messages.movedDiffBeforeMessage : messages.movedDiffAfterMessage;
        return ['bg-light-300 text-light-300', Done, message];
      default:
        return ['bg-light-300 text-light-300', Done, message];
    }
  }, [state, side]);

  return (
    <Card
      isClickable={state === 'modified'}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      className="mb-2 rounded shadow-sm border border-light-100"
    >
      <Stack direction="horizontal" gap={0}>
        <div
          className={`px-1 align-self-stretch align-content-center rounded-left ${stateContext[0]}`}
        >
          <Icon size="sm" src={stateContext[1]} />
        </div>
        <ActionRow className="p-2">
          <Stack direction="vertical" gap={3}>
            <Stack direction="horizontal" gap={2}>
              <Icon
                src={getItemIcon(containerType)}
                screenReaderText={containerType}
                title={title}
              />
              <span className="small font-weight-bold">{title}</span>
            </Stack>
            {stateContext[2] ? (
              <span className="micro">
                <FormattedMessage
                  {...stateContext[2]}
                  values={{
                    blockType: containerType,
                    name: originalName,
                  }}
                />
              </span>
            ) : (
              <span className="micro">&nbsp;</span>
            )}
          </Stack>
          <ActionRow.Spacer />
        </ActionRow>
      </Stack>
    </Card>
  );
};

export default ContainerRow;
