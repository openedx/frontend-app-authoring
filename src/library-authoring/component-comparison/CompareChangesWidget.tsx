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
  newVersion?: VersionSpec;
  isContainer?: boolean;
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
  isContainer = false,
}: Props) => {
  const intl = useIntl();

  return (
    <div>
      <Tabs variant="tabs" defaultActiveKey="new" id="preview-version-toggle" mountOnEnter>
        <Tab eventKey="old" title={intl.formatMessage(messages.oldVersionTitle)}>
          <div className="p-2 bg-white">
            {isContainer ? (<PreviewNotAvailable />) : (
              <IframeProvider>
                <LibraryBlock
                  usageKey={usageKey}
                  version={oldVersion}
                  minHeight="50vh"
                />
              </IframeProvider>
            )}
          </div>
        </Tab>
        <Tab eventKey="new" title={intl.formatMessage(messages.newVersionTitle)}>
          <div className="p-2 bg-white">
            {isContainer ? (<PreviewNotAvailable />) : (
              <IframeProvider>
                <LibraryBlock
                  usageKey={usageKey}
                  version={newVersion}
                  minHeight="50vh"
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
