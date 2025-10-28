import {
  ActionRow, Card, Icon, Stack,
} from '@openedx/paragon';
import type { MessageDescriptor } from 'react-intl';
import { useMemo } from 'react';
import {
  Cached, ChevronRight, Delete, Done, Plus,
} from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { getItemIcon } from '@src/generic/block-type-utils';
import { ContainerType } from '@src/generic/key-utils';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import messages from './messages';
import { ContainerState } from './types';
import { isRowClickable } from './utils';

export interface ContainerRowProps {
  title: string;
  containerType: ContainerType | keyof typeof COMPONENT_TYPES | string;
  state?: ContainerState;
  side: 'Before' | 'After';
  originalName?: string;
  onClick?: () => void;
}

interface StateContext {
  className: string;
  icon: React.ComponentType;
  message?: MessageDescriptor;
  message2?: MessageDescriptor;
}

const ContainerRow = ({
  title, containerType, state, side, originalName, onClick,
}: ContainerRowProps) => {
  const isClickable = isRowClickable(state, containerType as ContainerType);
  const stateContext: StateContext = useMemo(() => {
    let message: MessageDescriptor | undefined;
    let message2: MessageDescriptor | undefined;
    switch (state) {
      case 'added':
        message = side === 'Before' ? messages.addedDiffBeforeMessage : messages.addedDiffAfterMessage;
        return { className: 'text-white bg-success-500', icon: Plus, message };
      case 'modified':
        message = side === 'Before' ? messages.modifiedDiffBeforeMessage : messages.modifiedDiffAfterMessage;
        return { className: 'text-white bg-warning-900', icon: Cached, message };
      case 'removed':
        message = side === 'Before' ? messages.removedDiffBeforeMessage : messages.removedDiffAfterMessage;
        return { className: 'text-white bg-danger-600', icon: Delete, message };
      case 'locallyRenamed':
        message = side === 'Before' ? messages.renamedDiffBeforeMessage : messages.renamedUpdatedDiffAfterMessage;
        return { className: 'bg-light-300 text-light-300 ', icon: Done, message };
      case 'locallyContentUpdated':
        message = side === 'Before' ? messages.locallyContentUpdatedBeforeMessage : messages.locallyContentUpdatedAfterMessage;
        return { className: 'bg-light-300 text-light-300 ', icon: Done, message };
      case 'locallyRenamedAndContentUpdated':
        message = side === 'Before' ? messages.renamedDiffBeforeMessage : messages.renamedUpdatedDiffAfterMessage;
        message2 = side === 'Before' ? messages.locallyContentUpdatedBeforeMessage : messages.locallyContentUpdatedAfterMessage;
        return {
          className: 'bg-light-300 text-light-300 ', icon: Done, message, message2,
        };
      case 'moved':
        message = side === 'Before' ? messages.movedDiffBeforeMessage : messages.movedDiffAfterMessage;
        return { className: 'bg-light-300 text-light-300', icon: Done, message };
      default:
        return { className: 'bg-light-300 text-light-300', icon: Done, message };
    }
  }, [state, side]);

  return (
    <Card
      isClickable={isClickable}
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
          className={`px-1 align-self-stretch align-content-center rounded-left ${stateContext.className}`}
        >
          <Icon size="sm" src={stateContext.icon} />
        </div>
        <ActionRow className="p-2">
          <Stack direction="vertical" gap={2}>
            <Stack direction="horizontal" gap={2}>
              <Icon
                src={getItemIcon(containerType)}
                screenReaderText={containerType}
                title={title}
              />
              <span className="small font-weight-bold">{title}</span>
            </Stack>
            {stateContext.message ? (
              <div className="d-flex flex-column">
                <span className="micro">
                  <FormattedMessage
                    {...stateContext.message}
                    values={{
                      blockType: containerType,
                      name: originalName,
                    }}
                  />
                </span>
                {stateContext.message2 && (
                  <span className="micro">
                    <FormattedMessage
                      {...stateContext.message2}
                      values={{
                        blockType: containerType,
                        name: originalName,
                      }}
                    />
                  </span>
                )}
              </div>
            ) : (
              <span className="micro">&nbsp;</span>
            )}
          </Stack>
          <ActionRow.Spacer />
          {isClickable && <Icon size="md" src={ChevronRight} />}
        </ActionRow>
      </Stack>
    </Card>
  );
};

export default ContainerRow;
