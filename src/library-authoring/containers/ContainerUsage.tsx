import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { ItemHierarchy } from '../hierarchy/ItemHierarchy';

const ContainerUsage = () => {
  const intl = useIntl();

  return (
    <>
      <h4>{intl.formatMessage(messages.usageTabHierarchyHeading)}</h4>
      <ItemHierarchy />
    </>
  );
};

export default ContainerUsage;
