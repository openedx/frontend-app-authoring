import {
  Card, Icon, DataTable, Button,
} from '@openedx/paragon';
import {
  ArrowForwardIos,
  LinkOff,
  Check,
} from '@openedx/paragon/icons';
import { FC } from 'react';
import { Filters, Unit } from '../types';
import messages from './messages';
import CustomIcon from './CustomIcon';
import lockedIcon from './lockedIcon';
import ManualIcon from './manualIcon';

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

const GoToBlock: FC<{ block: { url: string, displayName: string } }> = ({ block }) => {
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
  originalLink?: string // Used for update operations when href is different from original
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
}) => (
  <span
    className="links-container d-flex align-items-center justify-content-between w-100"
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
            Updated
            <Icon src={Check} className="text-success" />
          </span>
        ) : (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onUpdate && onUpdate(originalLink || href, block.id || block.url, sectionId)}
            className="px-4 rounded-0 update-link-btn"
          >
            Update
          </Button>
        )
      )}
    </div>
  </span>
);

interface BrokenLinkTableProps {
  unit: Unit;
  filters?: Filters;
  linkType?: 'broken' | 'previous';
  onUpdateLink?: (link: string, blockId: string, sectionId?: string) => Promise<boolean>;
  sectionId?: string;
  updatedLinks?: string[];
}

type TableData = {
  Links: JSX.Element;
}[];

const BrokenLinkTable: FC<BrokenLinkTableProps> = ({
  unit,
  filters,
  linkType = 'broken',
  onUpdateLink,
  sectionId,
  updatedLinks = [],
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
            const isUpdatedFromClientState = updatedLinks ? updatedLinks.indexOf(`${block.id}:${originalLink}`) !== -1 : false;
            const isUpdated = isUpdatedFromAPI || isUpdatedFromClientState;
            const displayLink = isUpdated && updatedLink ? updatedLink : originalLink;

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
              linkType="broken"
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
              linkType="locked"
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
              linkType="manual"
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
