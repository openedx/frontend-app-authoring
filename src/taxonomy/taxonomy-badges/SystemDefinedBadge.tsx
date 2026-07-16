import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  OverlayTrigger,
  Popover,
} from '@openedx/paragon';
import messages from './messages';

export const SystemDefinedBadge = ({ taxonomyId }: { taxonomyId: number }) => {
  const intl = useIntl();
  const getToolTip = () => (
    <Popover id={`system-defined-tooltip-${taxonomyId}`} className="mw-300px">
      <Popover.Title as="h5">
        {intl.formatMessage(messages.systemTaxonomyPopoverTitle)}
      </Popover.Title>
      <Popover.Content>
        {intl.formatMessage(messages.systemTaxonomyPopoverBody)}
      </Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger
      key={`system-defined-overlay-${taxonomyId}`}
      placement="top"
      overlay={getToolTip()}
    >
      <Badge variant="light" className="p-1.5 font-weight-normal">
        {intl.formatMessage(messages.systemDefinedBadge)}
      </Badge>
    </OverlayTrigger>
  );
};
