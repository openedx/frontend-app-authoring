import { useEffect } from 'react';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';

type SidebarLevel = 'section' | 'subsection' | 'unit';

interface TabConfig {
  defaultKey: string;
  availableTabs: Record<string, string>;
}

const TAB_CONFIG: Record<SidebarLevel, TabConfig> = {
  section: { defaultKey: 'info', availableTabs: { info: 'info', settings: 'settings' } },
  subsection: { defaultKey: 'info', availableTabs: { info: 'info', settings: 'settings' } },
  unit: { defaultKey: 'preview', availableTabs: { preview: 'preview', info: 'info', settings: 'settings' } },
};

/**
 * Sets the default sidebar tab on mount if no valid tab is selected.
 *
 * @param level - Sidebar level identifying which block is being viewed.
 *
 *   - `'section'` / `'subsection'`: defaults to `'info'` tab.
 *   - `'unit'`: defaults to `'preview'` tab.
 */
export function useDefaultTab(level: SidebarLevel): void {
  const { currentTabKey, setCurrentTabKey } = useOutlineSidebarContext();
  const { defaultKey, availableTabs } = TAB_CONFIG[level];

  useEffect(() => {
    if (!currentTabKey || !Object.values(availableTabs).includes(currentTabKey)) {
      setCurrentTabKey(defaultKey);
    }
  }, [currentTabKey, setCurrentTabKey, defaultKey, availableTabs]);
}
