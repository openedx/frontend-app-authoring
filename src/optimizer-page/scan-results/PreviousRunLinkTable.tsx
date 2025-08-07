import {
  Card, Icon, DataTable,
} from '@openedx/paragon';
import {
  ArrowForwardIos,
} from '@openedx/paragon/icons';
import { FC } from 'react';
import { Unit } from '../types';

const PreviousRunLinkHref: FC<{ href: string }> = ({ href }) => {
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

const PreviousRunLinksCol: FC<{ block: { url: string, displayName: string }, href: string }> = ({ block, href }) => (
  <span className="links-container">
    <GoToBlock block={{ url: block.url, displayName: block.displayName || 'Go to block' }} />
    <Icon className="arrow-forward-ios" src={ArrowForwardIos} style={{ color: '#8F8F8F' }} />
    <PreviousRunLinkHref href={href} />
  </span>
);

interface PreviousRunLinkTableProps {
  unit: Unit;
}

type TableData = {
  Links: JSX.Element;
}[];

const PreviousRunLinkTable: FC<PreviousRunLinkTableProps> = ({
  unit,
}) => {
  const previousRunLinkList = unit.blocks.reduce(
    (
      acc: TableData,
      block,
    ) => {
      if (block.previousRunLinks && block.previousRunLinks.length > 0) {
        const blockPreviousRunLinks = block.previousRunLinks.map((link) => ({
          Links: (
            <PreviousRunLinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
            />
          ),
        }));
        acc.push(...blockPreviousRunLinks);
      }

      return acc;
    },
    [],
  );

  if (previousRunLinkList.length === 0) {
    return null;
  }

  return (
    <Card className="unit-card rounded-sm pt-2 pb-3 pl-3 pr-4 mb-2.5">
      <p className="unit-header">{unit.displayName}</p>
      <DataTable
        data={previousRunLinkList}
        itemCount={previousRunLinkList.length}
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

export default PreviousRunLinkTable;
