import { StudioHeader } from '@edx/frontend-component-header';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { type Container, useToggle } from '@openedx/paragon';

import { useWaffleFlags } from '../data/apiHooks';
import { SearchModal } from '../search-modal';
import {
  useContentMenuItems, useLibrarySettingsMenuItems, useLibraryToolsMenuItems, useSettingMenuItems, useToolsMenuItems,
} from './hooks';
import messages from './messages';

type ContainerPropsType = Omit<React.ComponentProps<typeof Container>, 'children'>;

interface HeaderProps {
  contextId?: string,
  number?: string,
  org?: string,
  title?: string,
  isHiddenMainMenu?: boolean,
  isLibrary?: boolean,
  containerProps?: ContainerPropsType,
  readOnly?: boolean,
}

const Header = ({
  contextId = '',
  org = '',
  number = '',
  title = '',
  isHiddenMainMenu = false,
  isLibrary = false,
  containerProps = {},
  readOnly = false,
}: HeaderProps) => {
  const intl = useIntl();
  const waffleFlags = useWaffleFlags();

  const [isShowSearchModalOpen, openSearchModal, closeSearchModal] = useToggle(false);

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const meiliSearchEnabled = [true, 'true'].includes(getConfig().MEILISEARCH_ENABLED);

  const contentMenuItems = useContentMenuItems(contextId);
  const settingMenuItems = useSettingMenuItems(contextId);
  const toolsMenuItems = useToolsMenuItems(contextId);
  const libraryToolsMenuItems = useLibraryToolsMenuItems(contextId);
  const libraryToolsSettingsItems = useLibrarySettingsMenuItems(contextId, readOnly);
  let mainMenuDropdowns = !isLibrary ? [
    {
      id: `${intl.formatMessage(messages['header.links.content'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.content']),
      items: contentMenuItems,
    },
    {
      id: `${intl.formatMessage(messages['header.links.settings'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.settings']),
      items: settingMenuItems,
    },
    {
      id: `${intl.formatMessage(messages['header.links.tools'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.tools']),
      items: toolsMenuItems,
    },
  ] : [{
    id: `${intl.formatMessage(messages['header.links.tools'])}-dropdown-menu`,
    buttonTitle: intl.formatMessage(messages['header.links.tools']),
    items: libraryToolsMenuItems,
  }];

  // Include settings menu only if user is allowed to see them.
  if (isLibrary && libraryToolsSettingsItems.length > 0) {
    mainMenuDropdowns = [
      {
        id: `${intl.formatMessage(messages['header.links.settings'])}-dropdown-menu`,
        buttonTitle: intl.formatMessage(messages['header.links.settings']),
        items: libraryToolsSettingsItems,
      },
      ...mainMenuDropdowns,
    ];
  }

  const getOutlineLink = () => {
    if (isLibrary) {
      return `/library/${contextId}`;
    }
    return waffleFlags.useNewCourseOutlinePage ? `/course/${contextId}` : `${studioBaseUrl}/course/${contextId}`;
  };

  return (
    <>
      <StudioHeader
        org={org}
        number={number}
        title={title}
        isHiddenMainMenu={isHiddenMainMenu}
        mainMenuDropdowns={mainMenuDropdowns}
        outlineLink={getOutlineLink()}
        searchButtonAction={meiliSearchEnabled ? openSearchModal : undefined}
        containerProps={containerProps}
        isNewHomePage={waffleFlags.useNewHomePage}
      />
      {meiliSearchEnabled && (
        <SearchModal
          isOpen={isShowSearchModalOpen}
          courseId={isLibrary ? undefined : contextId}
          onClose={closeSearchModal}
        />
      )}
    </>
  );
};

export default Header;
