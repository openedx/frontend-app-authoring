import React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Dropdown,
  Form,
  IconButton,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Link } from 'react-router-dom';

import { useWaffleFlags } from '../../data/apiHooks';
import { COURSE_CREATOR_STATES } from '../../constants';
import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';

interface CardTitleProps {
  readOnlyItem: boolean;
  inSelectMode: boolean;
  destinationUrl: string;
  hasDisplayName: string;
  displayName: string;
  itemId?: string | null;
}

const CardTitle: React.FC<CardTitleProps> = ({
  readOnlyItem,
  inSelectMode,
  destinationUrl,
  hasDisplayName,
  displayName,
  itemId,
}) => {
  if (!readOnlyItem && !inSelectMode) {
    return (
      <Link
        className="card-item-title"
        to={destinationUrl}
      >
        {hasDisplayName}
      </Link>
    );
  }
  if (inSelectMode) {
    return (
      <Form.Radio className="mt-1 ml-1" value={itemId} name={`select-card-item-${itemId}`}>
        <span
          className="card-item-title"
          style={{ marginTop: '-0.2rem' }}
        >
          {displayName}
        </span>
      </Form.Radio>
    );
  }

  return (
    <span className="card-item-title">{displayName}</span>
  );
};

interface BaseProps {
  displayName: string;
  org: string;
  number: string;
  run?: string;
  lmsLink?: string | null;
  rerunLink?: string | null;
  courseKey?: string;
  isLibraries?: boolean;
  inSelectMode?: boolean;
  itemId?: string | null;
}
type Props = BaseProps & (
  /** If we should open this course/library in this MFE, this is the path to the edit page, e.g. '/course/foo' */
  { path: string, url?: never } |
  /**
   * If we might be redirecting to the legacy Studio view, this is the URL to redirect to.
   * URLs starting with '/' are assumed to be relative to the legacy Studio root.
   */
  { url: string, path?: never }
);

/**
 * A card on the Studio home page that represents a Course or a Library
 */
const CardItem: React.FC<Props> = ({
  displayName,
  lmsLink = '',
  rerunLink = '',
  org,
  number,
  run = '',
  isLibraries = false,
  courseKey = '',
  inSelectMode = false,
  itemId = '',
  path,
  url,
}) => {
  const intl = useIntl();
  const {
    allowCourseReruns,
    courseCreatorStatus,
    rerunCreatorStatus,
  } = useSelector(getStudioHomeData);
  const waffleFlags = useWaffleFlags();

  const destinationUrl: string = path ?? (
    waffleFlags.useNewCourseOutlinePage && !isLibraries
      ? url
      : new URL(url, getConfig().STUDIO_BASE_URL).toString()
  );
  const subtitle = isLibraries ? `${org} / ${number}` : `${org} / ${number} / ${run}`;
  const readOnlyItem = !(lmsLink || rerunLink || url || path);
  const showActions = !(readOnlyItem || isLibraries);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const hasDisplayName = (displayName ?? '').trim().length ? displayName : courseKey;

  return (
    <Card className="card-item">
      <Card.Header
        size="sm"
        title={(
          <CardTitle
            readOnlyItem={readOnlyItem}
            inSelectMode={inSelectMode}
            destinationUrl={destinationUrl}
            hasDisplayName={hasDisplayName}
            displayName={displayName}
            itemId={itemId}
          />
        )}
        subtitle={subtitle}
        actions={showActions && (
        <Dropdown>
          <Dropdown.Toggle
            as={IconButton}
            iconAs={MoreHoriz}
            variant="primary"
            aria-label={intl.formatMessage(messages.btnDropDownText)}
          />
          <Dropdown.Menu>
            {isShowRerunLink && (
              <Dropdown.Item
                as={Link}
                to={rerunLink ?? ''}
              >
                {messages.btnReRunText.defaultMessage}
              </Dropdown.Item>
            )}
            <Dropdown.Item href={lmsLink}>
              {intl.formatMessage(messages.viewLiveBtnText)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        )}
      />
    </Card>
  );
};

export default CardItem;
