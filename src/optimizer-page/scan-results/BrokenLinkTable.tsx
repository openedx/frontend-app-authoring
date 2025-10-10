import {
  Card, Icon, DataTable, StatefulButton,
} from '@openedx/paragon';
import {
  SpinnerSimple,
  ArrowForwardIos,
  LinkOff,
  Check,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import React, { FC } from 'react';
import { Filters, Unit } from '../types';
import messages from './messages';
import CustomIcon from './CustomIcon';
import lockedIcon from './lockedIcon';
import ManualIcon from './manualIcon';
import {
  STATEFUL_BUTTON_STATES, BROKEN, LOCKED, MANUAL,
} from '../../constants';

const BrokenLinkHref: FC<{ href: string }> = ({ href }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(href, '_blank');
  };

  return (
    <div className="broken-link-container">
      <a href={href} onClick={handleClick} className="broken-link" rel="noreferrer">
        {href}
      </a>
    </div>
  );
};

const GoToBlock: FC<{ block: { url: string, displayName?: string } }> = ({ block }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(block.url, '_blank');
  };

  return (
    <div className="go-to-block-link-container">
      <a href={block.url} onClick={handleClick} className="broken-link" rel="noreferrer">
        {block.displayName}
      </a>
    </div>
  );
};

const iconsMap = {
  broken: {
    icon: LinkOff,
    message1: messages.brokenLabel,
    message2: messages.brokenInfoTooltip,
  },
  locked: {
    icon: lockedIcon,
    message1: messages.lockedLabel,
    message2: messages.lockedInfoTooltip,
  },
  manual: {
    icon: ManualIcon,
    message1: messages.manualLabel,
    message2: messages.manualInfoTooltip,
  },
};

const LinksCol: FC<{
  block: { url: string, displayName: string, id?: string },
  href: string,
  linkType?: string,
  showIcon?: boolean,
  showUpdateButton?: boolean,
  isUpdated?: boolean,
  onUpdate?: (link: string, blockId: string, sectionId?: string) => void,
  sectionId?: string,
  originalLink?: string,
  updatedLinkMap?: Record<string, string>;
  updatedLinkInProgress?: Record<string, boolean>;
}> = ({
  block,
  href,
  linkType,
  showIcon = true,
  showUpdateButton = false,
  isUpdated = false,
  onUpdate,
  sectionId,
  originalLink,
  updatedLinkMap,
  updatedLinkInProgress,
}) => {
  const intl = useIntl();
  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(originalLink || href, block.id || block.url, sectionId);
    }
  };

  const uid = `${block.id}:${originalLink || href}`;
  const isUpdating = updatedLinkInProgress ? !!updatedLinkInProgress[uid] : false;

  return (
    <span
      className="links-container d-flex align-items-center justify-content-between w-100"
      data-updated-links-count={updatedLinkMap ? Object.keys(updatedLinkMap).length : undefined}
    >
      <div className="d-flex align-items-center flex-grow-1">
        <GoToBlock block={{ url: block.url, displayName: block.displayName || 'Go to block' }} />
        <Icon className="arrow-forward-ios" src={ArrowForwardIos} />
        <BrokenLinkHref href={href} />
      </div>
      <div className="d-flex align-items-center gap-2">
        {showIcon && linkType && iconsMap[linkType] && (
          <CustomIcon
            icon={iconsMap[linkType].icon}
            message1={iconsMap[linkType].message1}
            message2={iconsMap[linkType].message2}
          />
        )}
        {showUpdateButton && (
          isUpdated ? (
            <span
              className="updated-link-text d-flex align-items-center text-success"
            >
              {intl.formatMessage(messages.updated)}
              <Icon src={Check} className="text-success" />
            </span>
          ) : (
            <StatefulButton
              className="px-4 rounded-0 update-link-btn"
              labels={{
                default: intl.formatMessage(messages.updateButton),
                pending: intl.formatMessage(messages.updateButton),
              }}
              icons={{ default: '', pending: <Icon src={SpinnerSimple} className="icon-spin" /> }}
              state={isUpdating ? STATEFUL_BUTTON_STATES.pending : STATEFUL_BUTTON_STATES.default}
              onClick={handleUpdate}
              disabled={isUpdating}
              disabledStates={['pending']}
              variant="outline-primary"
              size="sm"
              data-testid={`update-link-${uid}`}
            />
          )
        )}
      </div>
    </span>
  );
};

interface BrokenLinkTableProps {
  unit: Unit;
  filters?: Filters;
  linkType?: 'broken' | 'previous';
  onUpdateLink?: (link: string, blockId: string, sectionId?: string) => Promise<boolean>;
  sectionId?: string;
  updatedLinks?: string[];
  updatedLinkMap?: Record<string, string>;
  updatedLinkInProgress?: Record<string, boolean>;
}

type TableData = {
  Links: JSX.Element;
}[];

const BrokenLinkTable: FC<BrokenLinkTableProps> = ({
  unit,
  filters,
  linkType = BROKEN,
  onUpdateLink,
  sectionId,
  updatedLinks = [],
  updatedLinkMap = {},
  updatedLinkInProgress = {},
}) => {
  const brokenLinkList = unit.blocks.reduce(
    (
      acc: TableData,
      block,
    ) => {
      if (linkType === 'previous') {
        // Handle previous run links (no filtering, no icons, but with update buttons)
        if (block.previousRunLinks && block.previousRunLinks.length > 0) {
          const blockPreviousRunLinks = block.previousRunLinks.map(({
            originalLink,
            isUpdated: isUpdatedFromAPI,
            updatedLink,
          }) => {
            const uid = `${block.id}:${originalLink}`;
            const isUpdatedFromClientState = updatedLinks ? updatedLinks.indexOf(uid) !== -1 : false;
            const isUpdatedFromMap = updatedLinkMap && !!updatedLinkMap[uid];
            const isUpdated = isUpdatedFromAPI || isUpdatedFromClientState || isUpdatedFromMap;
            let displayLink = originalLink;
            if (isUpdatedFromMap) {
              displayLink = updatedLinkMap[uid];
            } else if (isUpdated && updatedLink) {
              displayLink = updatedLink;
            }

            return {
              Links: (
                <LinksCol
                  block={{ url: block.url, displayName: block.displayName || 'Go to block', id: block.id }}
                  href={displayLink}
                  showIcon={false}
                  showUpdateButton
                  isUpdated={isUpdated}
                  onUpdate={onUpdateLink}
                  sectionId={sectionId}
                  originalLink={originalLink}
                  updatedLinkMap={updatedLinkMap}
                  updatedLinkInProgress={updatedLinkInProgress}
                />
              ),
            };
          });
          acc.push(...blockPreviousRunLinks);
        }
        return acc;
      }

      // Handle broken links with filtering and icons
      if (!filters) { return acc; }

      if (
        filters.brokenLinks
              || (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
      ) {
        const blockBrokenLinks = block.brokenLinks.map((link) => ({
          Links: (
            <LinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
              linkType={BROKEN}
            />
          ),
        }));
        acc.push(...blockBrokenLinks);
      }

      if (
        filters.lockedLinks
              || (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
      ) {
        const blockLockedLinks = block.lockedLinks.map((link) => ({
          Links: (
            <LinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
              linkType={LOCKED}
            />
          ),
        }));

        acc.push(...blockLockedLinks);
      }

      if (
        filters.externalForbiddenLinks
              || (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
      ) {
        const externalForbiddenLinks = block.externalForbiddenLinks.map((link) => ({
          Links: (
            <LinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
              linkType={MANUAL}
            />
          ),
        }));

        acc.push(...externalForbiddenLinks);
      }

      return acc;
    },
    [],
  );

  if (brokenLinkList.length === 0) {
    return null;
  }

  return (
    <Card className="unit-card rounded-sm pt-2 pb-3 pl-3 pr-4 mb-2.5">
      <p className="unit-header">{unit.displayName}</p>
      <DataTable
        data={brokenLinkList}
        itemCount={brokenLinkList.length}
        columns={[
          {
            accessor: 'Links',
            width: 'col-12',
          },
        ]}
      />
    </Card>
  );
};

export default BrokenLinkTable;
