import React from 'react';
import { getConfig, getPath } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { OpenInNew } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';

import { getItemIcon } from '../generic/block-type-utils';
import { isLibraryKey } from '../generic/key-utils';
import { useSearchContext, type ContentHit, Highlight } from '../search-manager';
import messages from './messages';

/**
 * Returns the URL Suffix for library/library component hit
*/
function getLibraryComponentUrlSuffix(hit: ContentHit): string {
  const { contextKey } = hit;
  return `library/${contextKey}`;
}

/**
 * Returns the URL Suffix for a unit hit
*/
function getUnitUrlSuffix(hit: ContentHit): string {
  const { contextKey, usageKey } = hit;
  return `course/${contextKey}/container/${usageKey}`;
}

/**
 * Returns the URL Suffix for a unit component hit
*/
function getUnitComponentUrlSuffix(hit: ContentHit): string {
  const { breadcrumbs, contextKey, usageKey } = hit;
  if (breadcrumbs.length > 1) {
    let parent = breadcrumbs[breadcrumbs.length - 1];

    if ('usageKey' in parent) {
      // Handle case for library component in unit
      let libComponentUsageKey: string | undefined;
      if (parent.usageKey.includes('type@library_content') && breadcrumbs.length > 2) {
        libComponentUsageKey = parent.usageKey;
        parent = breadcrumbs[breadcrumbs.length - 2];
      }

      if ('usageKey' in parent) {
        const encodedUsageKey = encodeURIComponent(libComponentUsageKey || usageKey);
        return `course/${contextKey}/container/${parent.usageKey}?show=${encodedUsageKey}`;
      }
    }
  }

  // istanbul ignore next - This case should never be reached
  return `course/${contextKey}`;
}

/**
 * Returns the URL Suffix for a course component hit
*/
function getCourseComponentUrlSuffix(hit: ContentHit): string {
  const { contextKey, usageKey } = hit;
  return `course/${contextKey}?show=${encodeURIComponent(usageKey)}`;
}

/**
 * Returns the URL Suffix for the search hit param
*/
function getUrlSuffix(hit: ContentHit): string {
  const { blockType, breadcrumbs } = hit;

  // Check if is a unit
  if (blockType === 'vertical') {
    return getUnitUrlSuffix(hit);
  }

  // Check if the parent is a unit or a library component in a unit
  if (breadcrumbs.length > 1) {
    const parent = breadcrumbs[breadcrumbs.length - 1];

    if ('usageKey' in parent && (
      parent.usageKey.includes('type@vertical') || parent.usageKey.includes('type@library_content'))
    ) {
      return getUnitComponentUrlSuffix(hit);
    }
  }

  return getCourseComponentUrlSuffix(hit);
}

/**
 * A single search result (row), usually represents an XBlock/Component
 */
const SearchResult: React.FC<{ hit: ContentHit }> = ({ hit }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { closeSearchModal } = useSearchContext();

  /**
   * Returns the URL for the context of the hit
   */
  const getContextUrl = React.useCallback((newWindow = false) => {
    const { contextKey } = hit;

    if (contextKey.startsWith('course-v1:')) {
      const urlSuffix = getUrlSuffix(hit);

      if (newWindow) {
        return `${getPath(getConfig().PUBLIC_PATH)}${urlSuffix}`;
      }
      return `/${urlSuffix}`;
    }

    if (isLibraryKey(contextKey)) {
      const urlSuffix = getLibraryComponentUrlSuffix(hit);
      if (newWindow) {
        return `${getPath(getConfig().PUBLIC_PATH)}${urlSuffix}`;
      }
      return `/${urlSuffix}`;
    }

    // istanbul ignore next - This case should never be reached
    return undefined;
  }, [hit]);

  /**
   * Opens the context of the hit in a new window
   */
  const openContextInNewWindow = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const newWindowUrl = getContextUrl(true);
    /* istanbul ignore next */
    if (!newWindowUrl) {
      return;
    }
    window.open(newWindowUrl, '_blank');
  };

  /**
   * Navigates to the context of the hit
   */
  const navigateToContext = React.useCallback((e: React.MouseEvent | React.KeyboardEvent): void => {
    e.stopPropagation();
    const redirectUrl = getContextUrl();

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
  }, [getContextUrl]);

  return (
    <Stack
      className="border-bottom search-result p-2 align-items-start"
      direction="horizontal"
      gap={3}
      onClick={navigateToContext}
      onKeyDown={navigateToContext}
      tabIndex={0}
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
        onClick={openContextInNewWindow}
        alt={intl.formatMessage(messages.openInNewWindow)}
      />
    </Stack>
  );
};

export default SearchResult;
