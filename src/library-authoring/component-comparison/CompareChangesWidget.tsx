import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';
import { IframeProvider } from '../../generic/hooks/context/iFrameContext';

import { LibraryBlock, type VersionSpec } from '../LibraryBlock';

import messages from './messages';

const PreviewNotAvailable = () => {
  const intl = useIntl();

  return (
    <div className="d-flex mt-4 justify-content-center">
      {intl.formatMessage(messages.previewNotAvailable)}
    </div>
  );
};

interface Props {
  usageKey: string;
  oldVersion?: VersionSpec;
  oldTitle?: string | null;
  newVersion?: VersionSpec;
  isContainer?: boolean;
  oldUsageKey?: string | null;
  hasLocalChanges?: boolean;
}

/**
 * A widget with tabs that can be used to show the old version and the new
 * version of a component (XBlock), so users can switch back and forth to spot
 * the differences.
 *
 * In the future, it would be better to have a way of highlighting the changes
 * or showing a diff.
 */
const CompareChangesWidget = ({
  usageKey,
  oldVersion = 'published',
  newVersion = 'draft',
  oldTitle = null,
  isContainer = false,
  oldUsageKey = null,
  hasLocalChanges = false,
}: Props) => {
  const intl = useIntl();

  const oldTabMessage = hasLocalChanges
    ? intl.formatMessage(messages.courseContentTitle)
    : intl.formatMessage(messages.oldVersionTitle);
  const newTabMessage = hasLocalChanges
    ? intl.formatMessage(messages.publishedLibraryContentTitle)
    : intl.formatMessage(messages.newVersionTitle);

  return (
    <div>
      <Tabs variant="tabs" defaultActiveKey="new" id="preview-version-toggle" mountOnEnter>
        <Tab eventKey="old" title={oldTabMessage}>
          <div className="p-2 bg-white">
            {isContainer ? (<PreviewNotAvailable />) : (
              <>
                {oldTitle && hasLocalChanges && (
                  <div className="h3 mt-3.5">
                    {oldTitle}
                  </div>
                )}
                <div style={hasLocalChanges ? { marginLeft: '-35px', marginTop: '-15px' } : {}}>
                  <IframeProvider>
                    <LibraryBlock
                      usageKey={oldUsageKey || usageKey}
                      version={oldVersion}
                      minHeight="50vh"
                      showTitle={hasLocalChanges}
                      isBlockV1={!!oldUsageKey}
                    />
                  </IframeProvider>
                </div>
              </>
            )}
          </div>
        </Tab>
        <Tab eventKey="new" title={newTabMessage}>
          <div className="p-2 bg-white">
            {isContainer ? (<PreviewNotAvailable />) : (
              <IframeProvider>
                <LibraryBlock
                  usageKey={usageKey}
                  version={newVersion}
                  minHeight="50vh"
                  showTitle={hasLocalChanges}
                />
              </IframeProvider>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default CompareChangesWidget;
