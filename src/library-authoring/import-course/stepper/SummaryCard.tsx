import { FormattedMessage } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import {
  Bubble, Card, Icon, OverlayTrigger, Stack, Tooltip,
} from '@openedx/paragon';
import { Info, Widgets } from '@openedx/paragon/icons';

import { LoadingSpinner } from '@src/generic/Loading';
import { getItemIcon } from '@src/generic/block-type-utils';

import messages from '../messages';

interface DisplayNumberProps {
  count?: string;
  isPending?: boolean;
}

const DisplayNumber = ({ count, isPending }: DisplayNumberProps) => {
  if (isPending) {
    return <LoadingSpinner />;
  }
  return (
    <span className="lead">{count}</span>
  );
};

interface DisplayNumberComponentProps {
  count?: string;
  isPending?: boolean;
  icon?: React.ComponentType;
  typeId: 'total' | 'section' | 'subsection' | 'unit' | 'unsupported';
  title: MessageDescriptor;
  info?: React.ReactNode;
}

const DisplayNumberComponent = ({
  count, isPending, icon, typeId, title, info,
}: DisplayNumberComponentProps) => (
  <>
    <div className="d-flex align-items-start">
      <FormattedMessage {...title} />
      {info
          && (
          <OverlayTrigger
            placement="top"
            overlay={(
              <Tooltip variant="light" id={`${typeId}-info`}>
                {info}
              </Tooltip>
            )}
          >
            <Bubble className="ml-2 min-1-rem">
              <Icon size="xs" src={Info} />
            </Bubble>
          </OverlayTrigger>
          )}
    </div>
    {icon
      ? (
        <Stack direction="horizontal" gap={3}>
          <Icon src={icon} />
          <DisplayNumber count={count} isPending={isPending} />
        </Stack>
      )
      : <DisplayNumber count={count} isPending={isPending} />}
  </>
);

interface Props {
  totalBlocks?: number;
  totalComponents?: number;
  sections?: number;
  subsections?: number;
  units?: number;
  unsupportedBlocks?: number;
  isPending?: boolean;
}

export const SummaryCard = ({
  totalBlocks,
  totalComponents,
  sections,
  subsections,
  units,
  unsupportedBlocks,
  isPending,
}: Props) => {
  let totalBlocksStr = totalBlocks?.toString();
  if (unsupportedBlocks && totalBlocks) {
    totalBlocksStr = `${totalBlocksStr}/${totalBlocks + unsupportedBlocks}`;
  }
  let totalComponentsStr = totalComponents?.toString();
  if (unsupportedBlocks && totalComponents) {
    totalComponentsStr = `${totalComponentsStr}/${totalComponents + unsupportedBlocks}`;
  }
  return (
    <Card>
      <Card.Section>
        <Stack direction="horizontal" gap={3}>
          <Stack className="align-items-center border-right py-3" gap={1}>
            <DisplayNumberComponent
              count={totalBlocksStr}
              isPending={isPending}
              typeId="total"
              title={messages.importCourseTotalBlocks}
            />
          </Stack>
          <Stack className="ml-3 py-3" gap={1}>
            <DisplayNumberComponent
              count={sections?.toString()}
              isPending={isPending}
              typeId="section"
              icon={getItemIcon('section')}
              title={messages.importCourseSections}
            />
          </Stack>
          <Stack className="py-3" gap={1}>
            <DisplayNumberComponent
              count={subsections?.toString()}
              isPending={isPending}
              typeId="subsection"
              icon={getItemIcon('subsection')}
              title={messages.importCourseSubsections}
            />
          </Stack>
          <Stack className="py-3" gap={1}>
            <DisplayNumberComponent
              count={units?.toString()}
              isPending={isPending}
              typeId="unit"
              icon={getItemIcon('unit')}
              title={messages.importCourseUnits}
            />
          </Stack>
          <Stack className="py-3" gap={1}>
            <DisplayNumberComponent
              count={totalComponentsStr}
              isPending={isPending}
              icon={Widgets}
              typeId="unsupported"
              title={messages.importCourseComponents}
              info={unsupportedBlocks ? (
                <FormattedMessage
                  {...messages.importCourseComponentsUnsupportedInfo}
                  values={{
                    count: unsupportedBlocks,
                  }}
                />
              ) : null}
            />
          </Stack>
        </Stack>
      </Card.Section>
    </Card>
  );
};
