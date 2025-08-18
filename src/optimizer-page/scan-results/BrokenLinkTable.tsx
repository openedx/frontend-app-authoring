import {
  Card, Icon, DataTable,
} from '@openedx/paragon';
import {
  ArrowForwardIos,
  LinkOff,
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
  block: { url: string, displayName: string },
  href: string,
  linkType?: string,
  showIcon?: boolean
}> = ({
  block, href, linkType, showIcon = true,
}) => (
  <span className="links-container">
    <GoToBlock block={{ url: block.url, displayName: block.displayName || 'Go to block' }} />
    <Icon className="arrow-forward-ios" src={ArrowForwardIos} />
    <BrokenLinkHref href={href} />
    {showIcon && linkType && iconsMap[linkType] && (
      <div className="icon-container">
        <CustomIcon
          icon={iconsMap[linkType].icon}
          message1={iconsMap[linkType].message1}
          message2={iconsMap[linkType].message2}
        />
      </div>
    )}
  </span>
);

interface BrokenLinkTableProps {
  unit: Unit;
  filters?: Filters;
  linkType?: 'broken' | 'previous';
}

type TableData = {
  Links: JSX.Element;
}[];

const BrokenLinkTable: FC<BrokenLinkTableProps> = ({
  unit,
  filters,
  linkType = 'broken',
}) => {
  const brokenLinkList = unit.blocks.reduce(
    (
      acc: TableData,
      block,
    ) => {
      if (linkType === 'previous') {
        // Handle previous run links (no filtering, no icons)
        if (block.previousRunLinks && block.previousRunLinks.length > 0) {
          const blockPreviousRunLinks = block.previousRunLinks.map((link) => ({
            Links: (
              <LinksCol
                block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
                href={link}
                showIcon={false}
              />
            ),
          }));
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
