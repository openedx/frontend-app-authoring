import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { NotificationsNone } from '@openedx/paragon/icons';
import { HookType, useDynamicHookShim } from './hooks';
import messages from './messages';

const NotificationHookConsumer = ({ hook }: { hook: () => HookType; }) => {
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

export const NotificationStatusIcon = () => {
  const loadedHook = useDynamicHookShim();

  // istanbul ignore if: dynamic hook shim not loaded (plugin slot edge case)
  if (!loadedHook) {
    return null;
  }

  return <NotificationHookConsumer hook={loadedHook} />;
};
