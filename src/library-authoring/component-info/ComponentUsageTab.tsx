import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { ComponentHierarchy } from '../hierarchy/ComponentHierarchy';

export const ComponentUsageTab = () => {
  const intl = useIntl();

  return (
    <>
      <h4>{intl.formatMessage(messages.usageTabHierarchyHeading)}</h4>
      <ComponentHierarchy />
    </>
  );
};
