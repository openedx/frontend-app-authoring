/* eslint-disable react/prop-types */
// @ts-check
import React, { useCallback, useMemo } from 'react';
import { getConfig, getPath } from '@edx/frontend-platform';
import {
  Button,
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
    window.open(newWindowUrl, '_blank');
  };

  /**
    * Navigates to the context of the hit
    * @param {React.MouseEvent} e
    * @returns {void}
    * */
  const navigateToContext = (e) => {
    e.stopPropagation();
    if (redirectUrl.startsWith('http')) {
      window.location.href = redirectUrl;
      return;
    }

    navigate(redirectUrl);
    closeSearch?.();
  };

  return (
    <Button
      variant="tertiary w-100 text-left"
      onClick={navigateToContext}
      disabled={!redirectUrl}
    >
      <Stack
        className="border-bottom search-result p-2 w-100"
        direction="horizontal"
        gap={2}
      >
        <div className="align-top">
          <Icon className="align-top" src={ItemIcon[hit.block_type] || Article} />
        </div>
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
        />
      </Stack>
    </Button>
  );
};

export default SearchResult;
