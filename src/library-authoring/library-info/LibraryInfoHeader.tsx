import React from "react";
import { Icon, IconButton, Stack } from "@openedx/paragon";
import { Edit } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from "./messages";

type LibraryInfoHeaderProps = {
  displayName: string,
  canEditLibrary: boolean,
};

const LibraryInfoHeader = ({ displayName, canEditLibrary} : LibraryInfoHeaderProps) => {
  const intl = useIntl();

  return (
    <Stack direction='horizontal'>
      <span className="font-weight-bold m-1.5">
        {displayName}
      </span>
      {canEditLibrary && (
        <IconButton
          src={Edit}
          iconAs={Icon}
          alt={intl.formatMessage(messages.editNameButtonAlt)}
        />
      )}
    </Stack>
  );
};

export default LibraryInfoHeader;
