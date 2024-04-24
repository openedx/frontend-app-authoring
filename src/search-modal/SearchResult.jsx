/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { getConfig, getPath } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import {
  Article,
  Folder,
  OpenInNew,
} from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { COMPONENT_TYPE_ICON_MAP, TYPE_ICONS_MAP } from '../course-unit/constants';
import { getStudioHomeData } from '../studio-home/data/selectors';
import { useSearchContext } from './manager/SearchManager';
import Highlight from './Highlight';
import messages from './messages';

const STRUCTURAL_TYPE_ICONS = {
  vertical: TYPE_ICONS_MAP.vertical,
  sequential: Folder,
  chapter: Folder,
};

/** @param {string} blockType */
function getItemIcon(blockType) {
  return STRUCTURAL_TYPE_ICONS[blockType] ?? COMPONENT_TYPE_ICON_MAP[blockType] ?? Article;
}

/**
 * A single search result (row), usually represents an XBlock/Component
 * @type {React.FC<{hit: import('./data/api').ContentHit}>}
 */
const SearchResult = ({ hit }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { closeSearchModal } = useSearchContext();
  const { libraryAuthoringMfeUrl, redirectToLibraryAuthoringMfe } = useSelector(getStudioHomeData);

  /**
   * Returns the URL for the context of the hit
   */
  const getContextUrl = React.useCallback((newWindow = false) => {
    const { contextKey, usageKey } = hit;
    if (contextKey.startsWith('course-v1:')) {
      const courseSufix = `course/${contextKey}?show=${encodeURIComponent(usageKey)}`;
      if (newWindow) {
        return `${getPath(getConfig().PUBLIC_PATH)}${courseSufix}`;
      }
      return `/${courseSufix}`;
    }
    if (usageKey.startsWith('lb:')) {
      if (redirectToLibraryAuthoringMfe) {
        return `${libraryAuthoringMfeUrl}library/${contextKey}`;
      }
    }

    // No context URL for this hit
    return undefined;
  }, [libraryAuthoringMfeUrl, redirectToLibraryAuthoringMfe]);

  const redirectUrl = React.useMemo(() => getContextUrl(), [libraryAuthoringMfeUrl, redirectToLibraryAuthoringMfe]);
  const newWindowUrl = React.useMemo(
    () => getContextUrl(true),
    [libraryAuthoringMfeUrl, redirectToLibraryAuthoringMfe],
  );

  /**
   * Opens the context of the hit in a new window
   * @param {React.MouseEvent} e
   * @returns {void}
   */
  const openContextInNewWindow = (e) => {
    e.stopPropagation();
    /* istanbul ignore next */
    if (!newWindowUrl) {
      return;
    }
    window.open(newWindowUrl, '_blank');
  };

  /**
   * Navigates to the context of the hit
   * @param {(React.MouseEvent | React.KeyboardEvent)} e
   * @returns {void}
   */
  const navigateToContext = (e) => {
    e.stopPropagation();

    /* istanbul ignore next */
    if (!redirectUrl) {
      // This case is for the library authoring MFE
      return;
    }

    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }

    /* istanbul ignore next */
    if (redirectUrl.startsWith('http')) {
      // This case is for the library authoring MFE
      window.location.href = redirectUrl;
      return;
    }

    navigate(redirectUrl);
    closeSearchModal();
  };

  return (
    <Stack
      className={`border-bottom search-result p-2 align-items-start ${!redirectUrl ? 'text-muted' : ''}`}
      direction="horizontal"
      gap={3}
      onClick={navigateToContext}
      onKeyDown={navigateToContext}
      tabIndex={redirectUrl ? 0 : undefined}
      role="button"
    >
      <Icon className="text-muted" src={getItemIcon(hit.blockType)} />
      <Stack>
        <div className="hit-name small">
          <Highlight text={hit.formatted.displayName} />
        </div>
        <div className="hit-description x-small text-truncate">
          <Highlight text={hit.formatted.content?.htmlContent ?? ''} />
          <Highlight text={hit.formatted.content?.capaContent ?? ''} />
        </div>
        <div className="text-muted x-small">
          {hit.breadcrumbs.map(bc => bc.displayName).join(' / ')}
        </div>
      </Stack>
      <IconButton
        src={OpenInNew}
        iconAs={Icon}
        disabled={!newWindowUrl}
        onClick={openContextInNewWindow}
        alt={intl.formatMessage(messages.openInNewWindow)}
      />
    </Stack>
  );
};

export default SearchResult;
