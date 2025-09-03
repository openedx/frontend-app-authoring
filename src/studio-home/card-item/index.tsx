import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Dropdown,
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { AccessTime, ArrowForward, MoreHoriz } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Link } from 'react-router-dom';

import { useWaffleFlags } from '@src/data/apiHooks';
import { COURSE_CREATOR_STATES } from '@src/constants';
import { parseLibraryKey } from '@src/generic/key-utils';
import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';

interface BaseProps {
  displayName: string;
  org: string;
  number: string;
  run?: string;
  lmsLink?: string | null;
  rerunLink?: string | null;
  courseKey?: string;
  isLibraries?: boolean;
  isMigrated?: boolean;
  migratedToKey?: string;
  migratedToTitle?: string;
  migratedToCollectionKey?: string | null;
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

const PrevToNextName = ({ from, to }: { from: React.ReactNode, to?: React.ReactNode }) => (
  <Stack direction="horizontal" gap={2}>
    <span>{from}</span>
    {to
        && (
        <>
          <Icon src={ArrowForward} size="xs" className="mb-1" />
          <span>{to}</span>
        </>
        )}
  </Stack>
);

const MakeLinkOrSpan = ({
  when, to, children, className,
}: {
  when: boolean,
  to: string,
  children: React.ReactNode;
  className?: string,
}) => {
  if (when) {
    return <Link className={className} to={to}>{children}</Link>;
  }
  return <span className={className}>{children}</span>;
};

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
  path,
  url,
  isMigrated = false,
  migratedToKey,
  migratedToTitle,
  migratedToCollectionKey,
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
  const readOnlyItem = !(lmsLink || rerunLink || url || path);
  const showActions = !(readOnlyItem || isLibraries);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const title = (displayName ?? '').trim().length ? displayName : courseKey;

  const getSubtitle = useCallback(() => {
    let subtitle = isLibraries ? <>{org} / {number}</> : <>{org} / {number} / {run}</>;
    if (isMigrated && migratedToKey) {
      const migratedToKeyObj = parseLibraryKey(migratedToKey);
      subtitle = (
        <PrevToNextName
          from={subtitle}
          to={<>{migratedToKeyObj.org} / {migratedToKeyObj.lib}</>}
        />
      );
    }
    return subtitle;
  }, [isLibraries, org, number, run, migratedToKey, isMigrated]);

  const collectionLink = () => {
    let libUrl = `/library/${migratedToKey}`;
    if (migratedToCollectionKey) {
      libUrl += `/collection/${migratedToCollectionKey}`;
    }
    return libUrl;
  };

  const getTitle = useCallback(() => (
    <PrevToNextName
      from={(
        <MakeLinkOrSpan
          when={!readOnlyItem}
          to={destinationUrl}
          className="card-item-title"
        >
          {title}
        </MakeLinkOrSpan>
        )}
      to={
          isMigrated && migratedToTitle && (
            <MakeLinkOrSpan
              when={!readOnlyItem}
              to={`/library/${migratedToKey}`}
              className="card-item-title"
            >
              {migratedToTitle}
            </MakeLinkOrSpan>
          )
        }
    />
  ), [readOnlyItem, isMigrated, destinationUrl, migratedToTitle, title]);

  return (
    <Card className="card-item">
      <Card.Header
        size="sm"
        title={getTitle()}
        subtitle={getSubtitle()}
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
      {isMigrated && migratedToKey
        && (
        <Card.Status className="bg-white pt-0 text-gray-500">
          <Stack direction="horizontal" gap={2}>
            <Icon src={AccessTime} size="sm" className="mb-1" />
            {intl.formatMessage(messages.libraryMigrationStatusText)}
            <b>
              <MakeLinkOrSpan
                when={!readOnlyItem}
                to={collectionLink()}
                className="text-info-500"
              >
                {migratedToTitle}
              </MakeLinkOrSpan>
            </b>
          </Stack>
        </Card.Status>
        )}
    </Card>
  );
};

export default CardItem;
