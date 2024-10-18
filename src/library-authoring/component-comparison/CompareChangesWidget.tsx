import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';

import { LibraryBlock, type VersionSpec } from '../LibraryBlock';

import messages from './messages';

interface Props {
  usageKey: string;
  oldVersion?: VersionSpec;
  newVersion?: VersionSpec;
}

/**
 * A widget with tabs that can be used to show the old version and the new
 * version of a component (XBlock), so users can switch back and forth to spot
 * the differences.
 *
 * In the future, it would be better to have a way of highlighting the changes
 * or showing a diff.
 */
const CompareChangesWidget = ({ usageKey, oldVersion = 'published', newVersion = 'draft' }: Props) => {
  const intl = useIntl();

  return (
    <div>
      <Tabs variant="tabs" defaultActiveKey="new" id="preview-version-toggle">
        <Tab eventKey="old" title={intl.formatMessage(messages.oldVersionTitle)}>
          <div className="p-2 bg-white">
            <LibraryBlock usageKey={usageKey} version={oldVersion} />
          </div>
        </Tab>
        <Tab eventKey="new" title={intl.formatMessage(messages.newVersionTitle)}>
          <div className="p-2 bg-white">
            <LibraryBlock usageKey={usageKey} version={newVersion} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default CompareChangesWidget;
