import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { StudioHeader } from '@edx/frontend-component-header';
import { type Container, useToggle } from '@openedx/paragon';
import { generatePath, useHref } from 'react-router-dom';

import { SearchModal } from '../search-modal';
import { useContentMenuItems, useSettingMenuItems, useToolsMenuItems } from './hooks';
import messages from './messages';
import { setUIPreference } from '../services/uiPreferenceService';

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

  const outlineLink = !isLibrary
    ? `${studioBaseUrl}/course/${contextId}`
    : generatePath(libraryHref, { libraryId: contextId });

  return (
    <>
      <StudioHeader
        org={org}
        number={number}
        title={title}
        isHiddenMainMenu={isHiddenMainMenu}
        mainMenuDropdowns={mainMenuDropdowns}
        outlineLink={outlineLink}
        searchButtonAction={meiliSearchEnabled ? openSearchModal : undefined}
        containerProps={containerProps}
      />
      {meiliSearchEnabled && (
        <SearchModal
          isOpen={isShowSearchModalOpen}
          courseId={isLibrary ? undefined : contextId}
          onClose={closeSearchModal}
        />
      )}
      <button
        type="button"
        onClick={async () => {
          try {
            // Call API to set UI preference to new UI
            const success = await setUIPreference(true);
            if (success) {
              // Reload the page to apply changes
              window.location.reload();
            } else {
              // eslint-disable-next-line no-console
              console.error('Failed to switch to new UI');
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error switching to new UI:', error);
          }
        }}
        style={{
          position: 'absolute',
          top: '0.4rem',
          borderRadius: '6px',
          right: '20rem',
          zIndex: 9999,
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          width: 'fit-content',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Switch to New UI
      </button>
    </>
  );
};

export default Header;
