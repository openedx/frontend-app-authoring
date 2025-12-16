import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { NotificationsNone } from '@openedx/paragon/icons';
import { HooKType, useDynamicHookShim } from './hooks';
import messages from './messages';

// Component that actually calls the loaded hook
const NotificationHookConsumer = ({ hook }: { hook: () => HooKType }) => {
  // The hook is now called on **every** render of this component
  const { notificationAppData } = hook();

  if (!notificationAppData?.tabsCount?.count || notificationAppData?.tabsCount?.count < 1) {
    return null;
  }

  return (
    <small className="d-flex">
      <Icon className="mr-1" size="md" src={NotificationsNone} />
      <FormattedMessage
        {...messages.notificationMetadataTitle}
        values={{ count: notificationAppData?.tabsCount?.count }}
      />
    </small>
  );
};

// Main component
export const NotificationStatusIcon = () => {
  const loadedHook = useDynamicHookShim();

  // istanbul ignore if
  if (!loadedHook) {
    return null;
  }

  // Once loaded, delegate to a component that calls the hook
  return <NotificationHookConsumer hook={loadedHook} />;
};
