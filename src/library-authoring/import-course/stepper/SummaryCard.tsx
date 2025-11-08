import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Icon, Stack } from '@openedx/paragon';
import { Widgets } from '@openedx/paragon/icons';

import { LoadingSpinner } from '@src/generic/Loading';
import { getItemIcon } from '@src/generic/block-type-utils';

import messages from '../messages';

// TODO: The SummaryCard is always in loading state
export const SummaryCard = () => (
  <Card>
    <Card.Section>
      <Stack direction="horizontal">
        <Stack className="align-items-center" gap={2}>
          <FormattedMessage {...messages.importCourseTotalBlocks} />
          <LoadingSpinner />
        </Stack>
        <div className="border-light-400" style={{ borderLeft: '2px solid', height: '50px' }} />
        <Stack className="align-items-center" gap={2}>
          <FormattedMessage {...messages.importCourseSections} />
          <Stack className="justify-content-center" direction="horizontal" gap={3}>
            <Icon src={getItemIcon('section')} />
            <LoadingSpinner />
          </Stack>
        </Stack>
        <Stack className="align-items-center" gap={2}>
          <FormattedMessage {...messages.importCourseSubsections} />
          <Stack className="justify-content-center" direction="horizontal" gap={3}>
            <Icon src={getItemIcon('subsection')} />
            <LoadingSpinner />
          </Stack>
        </Stack>
        <Stack className="align-items-center" gap={2}>
          <FormattedMessage {...messages.importCourseUnits} />
          <Stack className="justify-content-center" direction="horizontal" gap={3}>
            <Icon src={getItemIcon('unit')} />
            <LoadingSpinner />
          </Stack>
        </Stack>
        <Stack className="align-items-center" gap={2}>
          <FormattedMessage {...messages.importCourseComponents} />
          <Stack className="justify-content-center" direction="horizontal" gap={3}>
            <Icon src={Widgets} />
            <LoadingSpinner />
          </Stack>
        </Stack>
      </Stack>
    </Card.Section>
  </Card>
);
