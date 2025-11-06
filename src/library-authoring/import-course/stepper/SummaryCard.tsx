import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Icon, Stack } from '@openedx/paragon';
import { Widgets } from '@openedx/paragon/icons';

import { LoadingSpinner } from '@src/generic/Loading';
import { getItemIcon } from '@src/generic/block-type-utils';

import messages from '../messages';

interface DisplayNumberProps {
  count?: number;
  isPending?: boolean;
}

const DisplayNumber = ({ count, isPending }: DisplayNumberProps) => {
  if (isPending) {
    return <LoadingSpinner />
  }
  return (
    <span className='lead'>{count}</span>
  )
}

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
  return (
    <Card>
      <Card.Section>
        <Stack direction="horizontal" gap={3}>
          <Stack className="align-items-center border-right py-3" gap={1}>
            <FormattedMessage {...messages.importCourseTotalBlocks} />
            <div>
              <DisplayNumber count={totalBlocks} isPending={isPending} />
              {unsupportedBlocks && <span className='lead'>
                /
                <DisplayNumber count={(totalBlocks || 0) + unsupportedBlocks} />
              </span>}
            </div>
          </Stack>
          <Stack className="ml-3 py-3" gap={1}>
            <FormattedMessage {...messages.importCourseSections} />
            <Stack direction="horizontal" gap={3}>
              <Icon src={getItemIcon('section')} />
              <DisplayNumber count={sections} isPending={isPending} />
            </Stack>
          </Stack>
          <Stack className="py-3" gap={1}>
            <FormattedMessage {...messages.importCourseSubsections} />
            <Stack direction="horizontal" gap={3}>
              <Icon src={getItemIcon('subsection')} />
              <DisplayNumber count={subsections} isPending={isPending} />
            </Stack>
          </Stack>
          <Stack className="py-3" gap={1}>
            <FormattedMessage {...messages.importCourseUnits} />
            <Stack direction="horizontal" gap={3}>
              <Icon src={getItemIcon('unit')} />
              <DisplayNumber count={units} isPending={isPending} />
            </Stack>
          </Stack>
          <Stack className="py-3" gap={1}>
            <FormattedMessage {...messages.importCourseComponents} />
            <Stack direction="horizontal" gap={3}>
              <Icon src={Widgets} />
            <div>
              <DisplayNumber count={totalComponents} isPending={isPending} />
              {unsupportedBlocks && <span className='lead'>
                /
                <DisplayNumber count={(totalComponents || 0) + unsupportedBlocks} />
              </span>}
            </div>
            </Stack>
          </Stack>
        </Stack>
      </Card.Section>
    </Card>
  )
};
