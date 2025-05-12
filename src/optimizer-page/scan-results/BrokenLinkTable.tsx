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

const LinksCol: FC<{ block: { url: string, displayName: string }, href: string }> = ({ block, href }) => (
  <span className="links-container">
    <GoToBlock block={{ url: block.url, displayName: block.displayName || 'Go to block' }} />
    <Icon className="arrow-forward-ios" src={ArrowForwardIos} />
    <BrokenLinkHref href={href} />
  </span>
);

interface BrokenLinkTableProps {
  unit: Unit;
  filters: Filters;
}

type TableData = {
  Links: JSX.Element;
  status: JSX.Element;
}[];

const BrokenLinkTable: FC<BrokenLinkTableProps> = ({
  unit,
  filters,
}) => {
  const brokenLinkList = unit.blocks.reduce(
    (
      acc: TableData,
      block,
    ) => {
      if (
        filters.brokenLinks
            || (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
      ) {
        const blockBrokenLinks = block.brokenLinks.map((link) => ({
          Links: (
            <LinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
            />
          ),
          status: (
            <CustomIcon
              icon={LinkOff}
              message1={messages.brokenLabel}
              message2={messages.brokenInfoTooltip}
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
            />
          ),
          status: (
            <CustomIcon
              icon={lockedIcon}
              message1={messages.lockedLabel}
              message2={messages.lockedInfoTooltip}
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
            />
          ),
          status: (
            <CustomIcon
              icon={ManualIcon}
              message1={messages.manualLabel}
              message2={messages.manualInfoTooltip}
            />
          ),
        }));

        acc.push(...externalForbiddenLinks);
      }

      return acc;
    },
    [],
  );

  return (
    <Card className="unit-card rounded-sm pt-2 pb-3 pl-3 pr-4 mb-2.5">
      <p className="unit-header">{unit.displayName}</p>
      <DataTable
        data={brokenLinkList}
        itemCount={brokenLinkList.length}
        columns={[
          {
            accessor: 'Links',
            width: 'col-9',
          },
          {
            accessor: 'status',
            width: 'col-3',
          },
        ]}
      />
    </Card>
  );
};

export default BrokenLinkTable;
