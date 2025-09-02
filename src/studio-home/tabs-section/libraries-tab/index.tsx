import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Row } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';

import { LoadingSpinner } from '@src/generic/Loading';
import AlertMessage from '@src/generic/alert-message';
import { useLibrariesV1Data } from '@src/studio-home/data/apiHooks';
import CardItem from '@src/studio-home/card-item';
import messages from '../messages';
import { sortAlphabeticallyArray } from '../utils';
import { MigrateLegacyLibrariesAlert } from './MigrateLegacyLibrariesAlert';

const LibrariesTab = () => {
  const intl = useIntl();
  const { isLoading, data, isError } = useLibrariesV1Data();

  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }
  return (
    isError ? (
      <AlertMessage
        variant="danger"
        description={(
          <Row className="m-0 align-items-center">
            <Icon src={Error} className="text-danger-500 mr-1" />
            <span>{intl.formatMessage(messages.librariesTabErrorMessage)}</span>
          </Row>
        )}
      />
    ) : (
        <>
          {getConfig().ENABLE_LEGACY_LIBRARY_MIGRATOR === 'true' && (<MigrateLegacyLibrariesAlert />)}
          <div className="courses-tab">
            {sortAlphabeticallyArray(data.libraries).map(({
              displayName, org, number, url, isMigrated, migratedToKey, migratedToTitle, migratedToCollectionKey
            }) => (
                <CardItem
                  key={`${org}+${number}`}
                  isLibraries
                  displayName={displayName}
                  org={org}
                  number={number}
                  url={url}
                  isMigrated={isMigrated}
                  migratedToKey={migratedToKey}
                  migratedToTitle={migratedToTitle}
                  migratedToCollectionKey={migratedToCollectionKey}
                />
              ))}
          </div>
        </>
    )
  );
};

export default LibrariesTab;
