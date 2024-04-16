/* eslint-disable react/prop-types */
// @ts-check
import React, { useCallback, useMemo } from 'react';
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
  Question,
  TextFields,
  Videocam,
} from '@openedx/paragon/icons';
import {
  Highlight,
  Snippet,
} from 'react-instantsearch';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getStudioHomeData } from '../studio-home/data/selectors';
import messages from './messages';

/**
  * @typedef {import('instantsearch.js').Hit<{
  *  id: string,
  *  usage_key: string,
  *  context_key: string,
  *  display_name: string,
  *  block_type: string,
  *  'content.html_content'?: string,
  *  'content.capa_content'?: string,
  *  breadcrumbs: {display_name: string}[]
  *  breadcrumbsNames: string[],
  *  }>} CustomHit
  */

/**
 * Custom Highlight component that uses the <b> tag for highlighting
 * @type {React.FC<{
 *   attribute: keyof CustomHit | string[],
 *   hit: CustomHit,
 *   separator?: string,
 * }>}
 */
const CustomHighlight = ({ attribute, hit, separator }) => (
  <Highlight
    attribute={attribute}
    hit={hit}
    separator={separator}
    highlightedTagName="b"
  />
);

const ItemIcon = {
  vertical: Folder,
  sequential: Folder,
  chapter: Folder,
  problem: Question,
  video: Videocam,
  html: TextFields,
};

/**
 * A single search result (row), usually represents an XBlock/Component
 * @type {React.FC<{ hit: CustomHit, closeSearch?: () => void}>}
 */
const SearchResult = ({ hit, closeSearch }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { libraryAuthoringMfeUrl, redirectToLibraryAuthoringMfe } = useSelector(getStudioHomeData);

  /**
   * Returns the URL for the context of the hit
   * @param {CustomHit} hit
   * @param {boolean?} newWindow
   * @param {string} libraryAuthoringMfeUrl
   * @returns {string?}
   */
  const getContextUrl = useCallback((newWindow) => {
    const { context_key: contextKey, usage_key: usageKey } = hit;
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

  const redirectUrl = useMemo(() => getContextUrl(), [libraryAuthoringMfeUrl, redirectToLibraryAuthoringMfe]);
  const newWindowUrl = useMemo(() => getContextUrl(true), [libraryAuthoringMfeUrl, redirectToLibraryAuthoringMfe]);

  /**
    * Opens the context of the hit in a new window
    * @param {React.MouseEvent} e
    * @returns {void}
    * */
  const openContextInNewWindow = (e) => {
    e.stopPropagation();

    if (!newWindowUrl) {
      return;
    }

    window.open(newWindowUrl, '_blank');
  };

  /**
    * Navigates to the context of the hit
    * @param {(React.MouseEvent | React.KeyboardEvent)} e
    * @returns {void}
    * */
  const navigateToContext = (e) => {
    e.stopPropagation();

    if (!redirectUrl) {
      return;
    }

    // @ts-ignore Cannot use 'instanceof' with React.KeyboardEvent to narrow down the type
    if (e.nativeEvent instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }

    if (redirectUrl.startsWith('http')) {
      window.location.href = redirectUrl;
      return;
    }

    navigate(redirectUrl);
    closeSearch?.();
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
      <Icon className="text-muted" src={ItemIcon[hit.block_type] || Article} />
      <Stack>
        <div className="hit-name small">
          <CustomHighlight attribute="display_name" hit={hit} />
        </div>
        <div className="hit-description x-small text-truncate">
          <Snippet attribute="content.html_content" hit={hit} highlightedTagName="b" />
          <Snippet attribute="content.capa_content" hit={hit} highlightedTagName="b" />
        </div>
        <div className="text-muted x-small">
          <CustomHighlight attribute="breadcrumbsNames" separator=" / " hit={hit} />
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
