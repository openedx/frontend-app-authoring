import React from 'react';
import {
  Button,
  Stack,
  Container,
  Row,
  Col,
  Toast,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import messages from './messages';
import { LibrarySidebar } from './library-sidebar';
import { closeToast, openAddContentSidebar } from './data/slice';
import { getShowLibrarySidebar, getShowToast, getToastMessage } from './data/selectors';

const LibraryLayout = () => {
  const intl = useIntl();
  const showDrawer = useSelector(getShowLibrarySidebar);
  const showToast = useSelector(getShowToast);
  const toastMessage = useSelector(getToastMessage);
  const dispatch = useDispatch();

  return (
    <>
      <Container>
        <Row>
          <Col>
            <Stack direction="horizontal" className="d-flex justify-content-between">
              <span>
                This is a test
              </span>
              <Button
                iconBefore={Add}
                variant="primary rounded-0"
                onClick={() => dispatch(openAddContentSidebar())}
              >
                {intl.formatMessage(messages.newContentButton)}
              </Button>
            </Stack>
          </Col>
          {showDrawer && (
            <Col xs={6} md={4} className="box-shadow-left-1">
              <LibrarySidebar />
            </Col>
          )}
        </Row>
      </Container>
      <Toast
        show={showToast}
        onClose={() => dispatch(closeToast())}
      >
        {toastMessage}
      </Toast>
    </>
  );
};

export default LibraryLayout;
