import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { NotificationsNone } from '@openedx/paragon/icons';
import React from 'react';
import messages from './messages';

interface HooKType {
  notificationAppData: {
    tabsCount?: {
      count?: number;
    }
  }
}

// Load the hook module asynchronously
function useDynamicHookShim() {
  const [hook, setHook] = React.useState<(() => HooKType) | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const module = await import("@edx/frontend-plugin-notifications");
        const hookFn = module.useAppNotifications ?? module.default;
        if (!cancelled) {
          // `module.useAppNotifications` is itself a hook
          setHook(() => hookFn);
        }
      } catch (err: any) {
        // If the module cannot be found, just keep `hook` as null.
        console.error("Failed to load notifications plugin:", err);
        // No hook – the UI will fall back to the placeholder.
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return hook;
}

// Component that actually calls the loaded hook
function NotificationHookConsumer({ hook }: { hook: () => HooKType }) {
  // The hook is now called on **every** render of this component
  const { notificationAppData } = hook();

  if (!notificationAppData?.tabsCount?.count || notificationAppData?.tabsCount?.count < 1) {
    return null;
  }

  // You can use `hookResult` here as needed
  return (
    <small className="d-flex">
      <Icon className="mr-1" size="md" src={NotificationsNone} />
      <FormattedMessage
        {...messages.notificationMetadataTitle}
        values={{ count: notificationAppData?.tabsCount?.count }}
      />
    </small>
  );
}

// Main component
export const NotificationStatusIcon = () => {
  const loadedHook = useDynamicHookShim();

  if (!loadedHook) {
    return null;
  }

  // Once loaded, delegate to a component that calls the hook
  return <NotificationHookConsumer hook={loadedHook} />;
};

