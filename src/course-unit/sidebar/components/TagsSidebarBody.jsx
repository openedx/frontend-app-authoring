import { useState } from 'react';
import {
  Card, Stack, Button, Sheet,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import { ContentTagsDrawer } from '../../../content-tags-drawer';

import messages from '../messages';

const TagsSidebarBody = () => {
  const intl = useIntl();
  const [showManageTags, setShowManageTags] = useState(false);
  const contentId = useParams().blockId;
  const onClose = () => setShowManageTags(false);

  return (
    <>
      <Card.Body className="course-unit-sidebar-date">
        <Stack>
          Test
          <Button variant="outline-primary" onClick={() => setShowManageTags(true)}>
            {intl.formatMessage(messages.tagsSidebarManageButtonLabel)}
          </Button>
        </Stack>
      </Card.Body>
      <Sheet
        position="right"
        show={showManageTags}
        onClose={onClose}
      >
        <ContentTagsDrawer
          id={contentId}
          onClose={onClose}
        />
      </Sheet>
    </>
  );
};

TagsSidebarBody.propTypes = {};

export default TagsSidebarBody;
