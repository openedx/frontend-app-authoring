import { Stack } from "@openedx/paragon";
import { useIntl } from '@edx/frontend-platform/i18n';
import React from "react";
import messages from "./messages";

const LibraryInfo = () => {
  const intl = useIntl();

  return (
    <Stack direction='vertical'>
      <div>
        Published section
      </div>
      <div>
        <span className="font-weight-bold">
          {intl.formatMessage(messages.organizationSectionTitle)}
        </span>
      </div>
      <div>
        Library History Section
      </div>
    </Stack>
  );
};

export default LibraryInfo;
