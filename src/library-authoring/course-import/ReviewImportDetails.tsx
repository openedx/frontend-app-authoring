import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Icon, Stack } from '@openedx/paragon';
import { LoadingSpinner } from '@src/generic/Loading';
import { getItemIcon } from '@src/generic/block-type-utils';
import { Widgets } from '@openedx/paragon/icons';
import messages from './messages';

export const ReviewImportDetails = () => (
  <Stack gap={4}>
    <Card>
      <Card.Section>
        <h4><FormattedMessage {...messages.importCourseInProgressStatusTitle} /></h4>
        <p><FormattedMessage {...messages.importCourseInProgressStatusBody} /></p>
      </Card.Section>
    </Card>
    <h4><FormattedMessage {...messages.importCourseAnalysisSummary} /></h4>
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
    <h4><FormattedMessage {...messages.importCourseDetailsTitle} /></h4>
    <Card className="p-6">
      <Stack className="align-items-center" gap={3}>
        <LoadingSpinner />
        <FormattedMessage {...messages.importCourseDetailsLoadingBody} />
      </Stack>
    </Card>
  </Stack>
);
