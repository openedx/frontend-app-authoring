import React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Hyperlink,
  Dropdown,
  IconButton,
  ActionRow,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Link, useNavigate } from 'react-router-dom';

import { cn } from 'shared/lib/utils';
import { ArrowRight } from '@untitledui/icons';
import { convertFromSnakeCaseToTitleCase, formatToDate } from '../../../../utils';
import { getWaffleFlags } from '../../../../data/selectors';
import { COURSE_CREATOR_STATES } from '../../../../constants';
import { getStudioHomeData } from '../../../data/selectors';
import messages from '../../../messages';
import { trimSlashes } from './utils';

interface BaseProps {
  displayName: string;
  org: string;
  number: string;
  run?: string;
  lmsLink?: string | null;
  rerunLink?: string | null;
  courseKey?: string;
  isPaginated?: boolean;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
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
  courseKey = '',
  isPaginated = false,
  path,
  url,
  imageUrl,
  startDate,
  endDate,
}) => {
  const intl = useIntl();
  const {
    allowCourseReruns,
    courseCreatorStatus,
    rerunCreatorStatus,
  } = useSelector(getStudioHomeData);
  const waffleFlags = useSelector(getWaffleFlags);
  const getBadgesList = (): string[] => [org, convertFromSnakeCaseToTitleCase(run)].filter(Boolean);
  const navigate = useNavigate();
  const destinationUrl: string = path ?? (
    waffleFlags.useNewCourseOutlinePage
      ? url
      : new URL(url, getConfig().STUDIO_BASE_URL).toString()
  );
  const readOnlyItem = !(lmsLink || rerunLink || url || path);
  const showActions = !(readOnlyItem);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const hasDisplayName = (displayName ?? '').trim().length ? displayName : courseKey;

  const thumbnailImage = imageUrl ? `url(${imageUrl})` : 'none';

  const renderSubtitle = () => {
    return (
      <div className="tw-text-sm tw-font-normal tw-text-gray-500 tw-w-full tw-truncate tw-line-clamp-1 hover:tw-no-underline tw-flex tw-flex-row tw-gap-2 tw-items-center">
        {startDate ? <span>{formatToDate(startDate, 'MMM DD, YYYY')}</span> : 'N/A'}
        <ArrowRight className="tw-size-3" />
        {endDate ? <span>{formatToDate(endDate, 'MMM DD, YYYY')}</span> : 'N/A'}
      </div>
    );
  };

  return (
    <Card className={cn(
      'tw-bg-white/70 tw-border tw-border-solid tw-border-white tw-h-full',
      'tw-rounded-2xl tw-p-2 tw-pb-4',
      'tw-flex tw-flex-col tw-gap-4',
      'tw-shadow-none',
    )}
    >
      <button
        type="button"
        onClick={() => {
          navigate(destinationUrl);
        }}
        style={{
          backgroundImage: thumbnailImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        className="tw-h-[144px] tw-w-full tw-rounded-[8px] tw-relative tw-cursor-pointer tw-border-none tw-outline-none"
      >
        <BadgesList badges={getBadgesList()} />
      </button>
      <Card.Header
        className="!tw-pl-3 !tw-p-0 tw-flex tw-flex-row tw-gap-2 "
        size="sm"
        title={!readOnlyItem ? (
          <Link
            className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-w-fit tw-max-w-full tw-truncate tw-line-clamp-1 hover:tw-no-underline"
            to={destinationUrl}
          >
            {hasDisplayName}
          </Link>
        ) : (
          <span className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-w-full tw-truncate tw-line-clamp-1 hover:tw-no-underline">{displayName}</span>
        )}
        subtitle={renderSubtitle()}
        actions={showActions && (
          isPaginated ? (
            <Dropdown>
              <Dropdown.Toggle
                as={IconButton}
                iconAs={MoreVert}
                variant="primary"
                data-testid="toggle-dropdown"
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
          ) : (
            <ActionRow>
              {isShowRerunLink && (
                <Hyperlink
                  className="small"
                  destination={trimSlashes(rerunLink ?? '')}
                  key={`action-row-rerunLink-${courseKey}`}
                >
                  {intl.formatMessage(messages.btnReRunText)}
                </Hyperlink>
              )}
              <Hyperlink
                className="small ml-3"
                destination={lmsLink ?? ''}
                key={`action-row-lmsLink-${courseKey}`}
              >
                {intl.formatMessage(messages.viewLiveBtnText)}
              </Hyperlink>
            </ActionRow>
          )
        )}
      />
    </Card>
  );
};

const BadgesList = ({ badges }: { badges: string[] }) => (
  <div className="tw-absolute tw-top-0 tw-left-0 tw-p-3 tw-flex tw-flex-row tw-gap-1">
    {badges.map((badge) => (
      <div className={cn(
        'tw-bg-[#101828] tw-bg-opacity-60 tw-px-[6px] tw-py-[2px] tw-rounded-[6px]',
        'tw-backdrop-blur-[8px]',
      )}
      >
        <span className="tw-text-gray-200 tw-font-medium tw-text-xs tw-truncate tw-line-clamp-1">{badge}</span>
      </div>
    ))}
  </div>
);

export default CardItem;
