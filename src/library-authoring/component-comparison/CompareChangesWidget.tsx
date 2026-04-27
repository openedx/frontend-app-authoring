import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, Stack, Tab, Tabs } from '@openedx/paragon';
import classNames from 'classnames';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';

import { LibraryBlock, type VersionSpec } from '../LibraryBlock';

import messages from './messages';

interface Props {
  usageKey: string;
  oldVersion?: VersionSpec;
  newVersion?: VersionSpec;
  oldTitle?: string;
  showNewTitle?: boolean;
  hasLocalChanges?: boolean;
  oldUsageKey?: string;
  sideBySide?: boolean;
  showTitle?: boolean;
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
  oldTitle,
  showNewTitle = false,
  oldUsageKey,
  hasLocalChanges = false,
  sideBySide = false,
  showTitle = false,
}: Props) => {
  const intl = useIntl();

  const oldTabMessage = hasLocalChanges
    ? intl.formatMessage(messages.courseContentTitle)
    : intl.formatMessage(messages.oldVersionTitle);
  const newTabMessage = hasLocalChanges
    ? intl.formatMessage(messages.publishedLibraryContentTitle)
    : intl.formatMessage(messages.newVersionTitle);

  const oldBlock = oldVersion !== 0 && (
    <Card className={classNames('flex-1 min-w-0', { 'border-0': !sideBySide })}>
      <Card.Body
        className="p-4 bg-white overflow-auto"
        style={{ height: '70vh' }}
      >
        {sideBySide && (
          <h3 className="w-100 text-center mb-4">
            {oldTabMessage}
          </h3>
        )}
        {oldTitle && hasLocalChanges && (
          <div className="h3 mt-3.5">
            {oldTitle}
          </div>
        )}
        <div style={hasLocalChanges ? { marginLeft: '-35px', marginTop: '-8px' } : {}}>
          <IframeProvider>
            <LibraryBlock
              usageKey={oldUsageKey || usageKey}
              version={oldVersion}
              minHeight="50vh"
              showTitle={showTitle}
              addHeight={40}
            />
          </IframeProvider>
        </div>
      </Card.Body>
    </Card>
  );

  const newBlock = (
    <Card className={classNames('flex-1 min-w-0', { 'border-0': !sideBySide })}>
      <Card.Body
        className="p-4 bg-white overflow-auto"
        style={{ height: '70vh' }}
      >
        {sideBySide && (
          <h3 className="w-100 text-center mb-4">
            {newTabMessage}
          </h3>
        )}
        <IframeProvider>
          <LibraryBlock
            usageKey={usageKey}
            version={newVersion}
            showTitle={showNewTitle || showTitle}
            minHeight="50vh"
            addHeight={40}
          />
        </IframeProvider>
      </Card.Body>
    </Card>
  );

  return (
    <div className="bg-light-300 py-2 px-1">
      {sideBySide ? (
        <Stack direction='horizontal' gap={3}>
          {oldBlock}
          {newBlock}
        </Stack>
      ) : (
        <Tabs variant="tabs" defaultActiveKey="new" id="preview-version-toggle" mountOnEnter>
          {oldBlock && <Tab eventKey="old" title={oldTabMessage}>{oldBlock}</Tab>}
          <Tab eventKey="new" title={newTabMessage}>{newBlock}</Tab>
        </Tabs>
      )}
    </div>
  );
};

export default CompareChangesWidget;
