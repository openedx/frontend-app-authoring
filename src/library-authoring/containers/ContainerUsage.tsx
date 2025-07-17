import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import ContainerHierarchy from './ContainerHierarchy';

const ContainerUsage = () => {
  const intl = useIntl();

  return (
    <>
      <h4>{intl.formatMessage(messages.usageTabHierarchyHeading)}</h4>
      <ContainerHierarchy />
    </>
  );
};

export default ContainerUsage;
