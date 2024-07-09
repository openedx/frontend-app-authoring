import React from "react";
import { Stack } from "@openedx/paragon";
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from "./messages";
import { convertToStringFromDateAndFormat } from "../../utils";
import { COMMA_SEPARATED_DATE_FORMAT } from "../../constants";
import LibraryPublishStatus from "./LibraryPublishStatus";
import { ContentLibrary } from "../data/api";

type LibraryInfoProps = {
  library: ContentLibrary,
};

const LibraryInfo = ({ library } : LibraryInfoProps) => {
  const intl = useIntl();

  return (
    <Stack direction='vertical' gap={2.5}>
      <LibraryPublishStatus library={library}/>
      <Stack direction='vertical'>
        <span className="font-weight-bold">
          {intl.formatMessage(messages.organizationSectionTitle)}
        </span>
        <span>
          {library.org}
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
            {convertToStringFromDateAndFormat(library.updated, COMMA_SEPARATED_DATE_FORMAT)}
          </span>
        </Stack>
        <Stack>
          <span className="small text-gray-500">
            {intl.formatMessage(messages.createdLabel)}
          </span>
          <span className="small">
            {convertToStringFromDateAndFormat(library.created, COMMA_SEPARATED_DATE_FORMAT)}
          </span>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LibraryInfo;
