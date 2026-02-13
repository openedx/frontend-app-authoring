import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Dropdown,
  Icon,
  IconButton,
  IconButtonToggle,
  Stack,
} from '@openedx/paragon';
import { ResizableBox } from '@src/generic/resizable/Resizable';
import type { MessageDescriptor } from 'react-intl';

import messages from './messages';
import { CollapsedIcon } from './icons/CollapsedIcon';
import { ExpandedIcon } from './icons/ExpandedIcon';

export interface SidebarPage {
  component: React.ComponentType;
  icon: React.ComponentType;
  title: MessageDescriptor;
}

type SidebarPages = Record<string, SidebarPage>;

/**
 * Sidebar component
 */
interface SidebarProps<T extends SidebarPages> {
  /** Object containing the pages that are rendered in the sidebar.
   * Must satisfy the SidebarPages interface */
  pages: T;
  /** The page that is initially rendered in the sidebar.
   * Must be a key of the pages object */
  currentPageKey: keyof T;
  /** Function that is called when the page is changed.
   * Must be a key of the pages object */
  setCurrentPageKey: (pageKey: keyof T) => void;
  /** Whether the sidebar is open or not */
  isOpen: boolean;
  /** Function that toggles the sidebar */
  toggle: () => void;
}

/**
 * Sidebar component
 *
 * This component is used to render a sidebar that can be toggled open and closed.
 * The generic type T is used to define the pages that are rendered in the sidebar.
 *
 * Example usage:
 *
 * ```tsx
 * const sidebarPages = {
 *   help: {
 *     component: OutlineHelpSidebar,
 *     icon: HelpOutline,
 *     title: messages.sidebarButtonHelp,
 *   },
 *   info: {
 *     component: OutlineInfoSidebar,
 *     icon: Info,
 *     title: messages.sidebarButtonInfo,
 *   },
 * } satisfies SidebarPages;
 *
 * const [isOpen, open, , toggle] = useToggle(true);
 *
 * return (
 *   <Sidebar
 *     pages={sidebarPages}
 *     currentPageKey="help"
 *     isOpen={isOpen}
 *     toggle={toggle}
 *   />
 *);
 * ```
 */
// eslint-disable-next-line react/function-component-definition
export function Sidebar<T extends SidebarPages>({
  pages,
  currentPageKey,
  setCurrentPageKey,
  isOpen,
  toggle,
}: SidebarProps<T>) {
  const intl = useIntl();

  const SidebarComponent = pages[currentPageKey].component;
  const activeKey = isOpen ? currentPageKey : undefined;

  return (
    <Stack direction="horizontal" className="sidebar align-items-baseline ml-3" gap={2}>
      {(isOpen && !!currentPageKey) ? (
        <ResizableBox>
          <div className="sidebar-content p-3 bg-white border-right">
            <Dropdown data-testid="sidebar-dropdown">
              <Dropdown.Toggle
                id="dropdown-toggle-with-iconbutton"
                as={Button}
                variant="tertiary"
                className="x-small text-primary font-weight-bold pl-0"
              >
                {intl.formatMessage(pages[currentPageKey].title)}
                <Icon src={pages[currentPageKey].icon} size="xs" className="ml-2" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="mt-1">
                {Object.entries(pages).map(([key, page]) => (
                  <Dropdown.Item
                    key={key}
                    onClick={() => setCurrentPageKey(key)}
                  >
                    <Stack direction="horizontal" gap={2}>
                      <Icon src={page.icon} />
                      {intl.formatMessage(page.title)}
                    </Stack>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <SidebarComponent />
          </div>
        </ResizableBox>
      ) : (
        <div className="min-vh-100 border" />
      )}
      <div className="sidebar-toggle p-1" data-testid="sidebar-toggle">
        <IconButton
          src={isOpen ? ExpandedIcon : CollapsedIcon}
          alt={intl.formatMessage(messages.toggle)}
          onClick={toggle}
          variant="primary"
        />
        <IconButtonToggle
          activeValue={activeKey}
          onChange={setCurrentPageKey}
        >
          {Object.entries(pages).map(([key, page]) => (
            <IconButton
              key={key}
              // FIXME: The following ts-ignore can be removed when the type fix is released in paragon
              // https://github.com/openedx/paragon/pull/4031
              // @ts-ignore
              value={key}
              src={page.icon}
              alt={intl.formatMessage(page.title)}
              className="rounded-iconbutton my-2"
            />
          ))}
        </IconButtonToggle>
      </div>
    </Stack>
  );
}
