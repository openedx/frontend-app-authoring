import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { StudioHeader } from '@edx/frontend-component-header';
import { type Container, useToggle } from '@openedx/paragon';
import { generatePath, useHref } from 'react-router-dom';

import { getWaffleFlags } from '../data/selectors';
import { SearchModal } from '../search-modal';
import { useContentMenuItems, useSettingMenuItems, useToolsMenuItems } from './hooks';
import messages from './messages';

type ContainerPropsType = React.ComponentProps<typeof Container>;

interface HeaderProps {
  contextId?: string,
  number?: string,
  org?: string,
  title?: string,
  isHiddenMainMenu?: boolean,
  isLibrary?: boolean,
  containerProps?: ContainerPropsType,
}

const Header = ({
  contextId = '',
  org = '',
  number = '',
  title = '',
  isHiddenMainMenu = false,
  isLibrary = false,
  containerProps = {},
}: HeaderProps) => {
  const intl = useIntl();
  const libraryHref = useHref('/library/:libraryId');
  const waffleFlags = useSelector(getWaffleFlags);

  const [isShowSearchModalOpen, openSearchModal, closeSearchModal] = useToggle(false);

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const meiliSearchEnabled = [true, 'true'].includes(getConfig().MEILISEARCH_ENABLED);

  const contentMenuItems = useContentMenuItems(contextId);
  const settingMenuItems = useSettingMenuItems(contextId);
  const toolsMenuItems = useToolsMenuItems(contextId);
  const mainMenuDropdowns = !isLibrary ? [
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
  ] : [];

  const getOutlineLink = () => {
    if (isLibrary) {
      return generatePath(libraryHref, { libraryId: contextId });
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
