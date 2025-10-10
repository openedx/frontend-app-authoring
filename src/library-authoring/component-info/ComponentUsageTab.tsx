import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { ItemHierarchy } from '../hierarchy/ItemHierarchy';

export const ComponentUsageTab = () => (
  <>
    <h4>
      <FormattedMessage {...messages.usageTabHierarchyHeading} />
    </h4>
    <ItemHierarchy />
  </>
);
