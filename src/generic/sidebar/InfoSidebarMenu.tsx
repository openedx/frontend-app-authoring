import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown, Icon, IconButton, Stack,
} from '@openedx/paragon';
import {
  ArrowDownward,
  ArrowOutward,
  ArrowUpward,
  ContentCopy,
  Delete,
  LinkOff,
  MoreVert,
  Newsstand,
} from '@openedx/paragon/icons';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import messages from './messages';

export interface InfoSidebarMenuProps {
  itemId: string;
  index: number;
  onClickUnlink: () => void;
  onClickDelete: () => void;
  onClickViewLibrary: () => void;
  onClickDuplicate?: () => void;
  onClickMoveUp?: () => void;
  onClickMoveDown?: () => void;
  canMoveItem?: (oldIndex: number, newIndex: number) => boolean;
  onClickCopy?: () => void;
  onClickCopyLocation?: () => void;
  onClickMove?: () => void;
}

export const InfoSidebarMenu = ({
  itemId,
  index,
  onClickDuplicate,
  onClickMoveUp,
  onClickMoveDown,
  canMoveItem,
  onClickUnlink,
  onClickDelete,
  onClickViewLibrary,
  onClickCopy,
  onClickCopyLocation,
  onClickMove,
}: InfoSidebarMenuProps) => {
  const intl = useIntl();
  const { data: item } = useCourseItemData(itemId);

  if (item === undefined) {
    return null;
  }

  const { actions, upstreamInfo } = item;

  return (
    <Dropdown>
      <Dropdown.Toggle
        as={IconButton}
        iconAs={Icon}
        src={MoreVert}
        alt={intl.formatMessage(messages.itemMenuAlt)}
      />
      <Dropdown.Menu>
        {actions.duplicable && onClickDuplicate && (
          <Dropdown.Item
            onClick={onClickDuplicate}
          >
            <Stack direction="horizontal" gap={2}>
              <Icon src={ContentCopy} />
              {intl.formatMessage(messages.menuDuplicate)}
            </Stack>
          </Dropdown.Item>
        )}
        {onClickCopy && (
          <Dropdown.Item onClick={onClickCopy}>
            <Stack direction="horizontal" gap={2}>
              <Icon src={ContentCopy} />
              {intl.formatMessage(messages.menuCopy)}
            </Stack>
          </Dropdown.Item>
        )}
        {onClickCopyLocation && (
          <Dropdown.Item onClick={onClickCopyLocation}>
            <Stack direction="horizontal" gap={2}>
              <Icon src={ContentCopy} />
              {intl.formatMessage(messages.menuCopy)}
            </Stack>
          </Dropdown.Item>
        )}
        {onClickMove && (
          <Dropdown.Item onClick={onClickMove}>
            <Stack direction="horizontal" gap={2}>
              <Icon src={ArrowOutward} />
              {intl.formatMessage(messages.menuMove)}
            </Stack>
          </Dropdown.Item>
        )}
        {actions.draggable && onClickMoveUp && onClickMoveDown && canMoveItem && (
          <>
            <Dropdown.Item
              onClick={onClickMoveUp}
              disabled={!canMoveItem(index, -1)}
            >
              <Stack direction="horizontal" gap={2}>
                <Icon src={ArrowUpward} />
                {intl.formatMessage(messages.menuMoveUp)}
              </Stack>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={onClickMoveDown}
              disabled={!canMoveItem(index, 1)}
            >
              <Stack direction="horizontal" gap={2}>
                <Icon src={ArrowDownward} />
                {intl.formatMessage(messages.menuMoveDown)}
              </Stack>
            </Dropdown.Item>
          </>
        )}
        {upstreamInfo?.upstreamRef && (
          <Dropdown.Item
            onClick={onClickViewLibrary}
          >
            <Stack direction="horizontal" gap={2}>
              <Icon src={Newsstand} />
              {intl.formatMessage(messages.menuViewLibrary)}
            </Stack>
          </Dropdown.Item>
        )}
        {((actions.unlinkable ?? null) !== null || actions.deletable) && <Dropdown.Divider />}
        {(actions.unlinkable ?? null) !== null && (
          <Dropdown.Item
            onClick={onClickUnlink}
            disabled={!actions.unlinkable}
            title={!actions.unlinkable ? intl.formatMessage(messages.menuUnlinkDisabledTooltip) : undefined}
          >
            <Stack direction="horizontal" gap={2}>
              <Icon src={LinkOff} />
              {intl.formatMessage(messages.menuUnlink)}
            </Stack>
          </Dropdown.Item>
        )}
        {actions.deletable && (
          <Dropdown.Item
            onClick={onClickDelete}
            className="text-danger-700"
          >
            <Stack direction="horizontal" gap={2}>
              <Icon src={Delete} />
              {intl.formatMessage(messages.menuDelete)}
            </Stack>
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
