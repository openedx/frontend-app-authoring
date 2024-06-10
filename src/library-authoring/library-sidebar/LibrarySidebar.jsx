// @ts-check
import React from 'react';
import {
  Stack,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getSidebarBodyComponent } from '../data/selectors';
import { closeLibrarySidebar } from '../data/slice';
import messages from '../messages';
import { AddContentContainer } from '../add-content';

/**
 * Sidebar container for library pages.
 *
 * It's designed to "squash" the page when open.
 * Uses `sidebarBodyComponent` of the `store` to
 * choose which component is rendered.
 * You can add more components in `bodyComponentMap`.
 * Use the slice actions to open and close this sidebar.
 */
const LibrarySidebar = () => {
  const intl = useIntl();
  const bodyComponent = useSelector(getSidebarBodyComponent);
  const dispatch = useDispatch();

  const bodyComponentMap = {
    'add-content': <AddContentContainer />,
  };

  const buildBody = () => bodyComponentMap[bodyComponent];

  return (
    <div className="p-2 vh-100">
      <Stack direction="horizontal" className="d-flex justify-content-between">
        <span className="font-weight-bold m-1.5">
          {intl.formatMessage(messages.addContentTitle)}
        </span>
        <IconButton
          src={Close}
          iconAs={Icon}
          alt={intl.formatMessage(messages.closeButtonAlt)}
          onClick={() => dispatch(closeLibrarySidebar())}
          variant="black"
        />
      </Stack>
      {buildBody()}
    </div>
  );
};

LibrarySidebar.propTypes = {};

export default LibrarySidebar;
