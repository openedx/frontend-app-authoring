import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { ComponentHierarchy } from '../hierarchy/ComponentHierarchy';

export const ComponentUsageTab = () => (
  <>
    <h4>
      <FormattedMessage {...messages.usageTabHierarchyHeading} />
    </h4>
    <ComponentHierarchy />
  </>
);
