/* istanbul ignore file */
import React from 'react';

export interface HookType {
  notificationAppData: {
    tabsCount?: {
      count?: number;
    }
  }
}

// Load the hook module asynchronously
export function useDynamicHookShim() {
  const [hook, setHook] = React.useState<(() => HookType) | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // @ts-ignore
        // eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
        const module = await import('@edx/frontend-plugin-notifications');
        const hookFn = module.useAppNotifications ?? module.default;
        if (!cancelled) {
          // `module.useAppNotifications` is itself a hook
          setHook(() => hookFn);
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to load notifications plugin:', err);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return hook;
}
