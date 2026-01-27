import { Card, Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../../messages';
import ActionButtons from './ActionButtons';

interface SidebarFooterProps {
  locationId?: string,
  displayUnitLocation?: boolean,
  openDiscardModal: () => void,
  handlePublishing: () => void,
  hideCopyButton?: boolean,
}

const SidebarFooter = ({
  locationId,
  handlePublishing,
  openDiscardModal,
  displayUnitLocation = false,
  hideCopyButton = false,
}: SidebarFooterProps) => {
  const intl = useIntl();

  return (
    <Card.Footer className="course-unit-sidebar-footer" orientation="horizontal">
      <Stack className="course-unit-sidebar-visibility">
        {displayUnitLocation ? (
          <small className="course-unit-sidebar-location-description">
            {intl.formatMessage(messages.unitLocationDescription, { id: locationId })}
          </small>
        ) : (
          <ActionButtons
            openDiscardModal={openDiscardModal}
            handlePublishing={handlePublishing}
            hideCopyButton={hideCopyButton}
          />
        )}
      </Stack>
    </Card.Footer>
  );
};

export default SidebarFooter;
