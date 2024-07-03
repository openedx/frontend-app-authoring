import { Stack } from "@openedx/paragon";
import { useIntl } from '@edx/frontend-platform/i18n';
import React from "react";
import messages from "./messages";
import { convertToStringFromDateAndFormat } from "../../utils";
import { COMMA_SEPARATED_DATE_FORMAT } from "../../constants";

type LibraryInfoProps = {
  orgName: string,
  createdAt: Date,
  updatedAt: Date,
};

const LibraryInfo = ({ orgName, createdAt, updatedAt } : LibraryInfoProps) => {
  const intl = useIntl();

  return (
    <Stack direction='vertical' gap={2.5}>
      <div>
        Published section
      </div>
      <Stack direction='vertical'>
        <span className="font-weight-bold">
          {intl.formatMessage(messages.organizationSectionTitle)}
        </span>
        <span>
          {orgName}
        </span>
      </Stack>
      <Stack>
        <span className="font-weight-bold">
          {intl.formatMessage(messages.libraryHistorySectionTitle)}
        </span>
        <Stack>
          <span className="small text-gray-500">
            {intl.formatMessage(messages.lastModifiedLabel)}
          </span>
          <span className="small">
            {convertToStringFromDateAndFormat(updatedAt, COMMA_SEPARATED_DATE_FORMAT)}
          </span>
        </Stack>
        <Stack>
          <span className="small text-gray-500">
            {intl.formatMessage(messages.createdLabel)}
          </span>
          <span className="small">
            {convertToStringFromDateAndFormat(createdAt, COMMA_SEPARATED_DATE_FORMAT)}
          </span>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LibraryInfo;
