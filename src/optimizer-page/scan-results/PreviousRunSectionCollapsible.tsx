import { FC } from 'react';
import {
  Collapsible,
  Icon,
} from '@openedx/paragon';
import {
  ArrowRight,
  ArrowDropDown,
} from '@openedx/paragon/icons';

interface Props {
  index: number;
  handleToggle: Function;
  isOpen: boolean;
  hasPrevAndIsOpen: boolean;
  hasNextAndIsOpen: boolean;
  title: string;
  children: React.ReactNode;
  previousRunLinksCount: number;
  className?: string;
}

const PreviousRunSectionCollapsible: FC<Props> = ({
  index,
  handleToggle,
  isOpen,
  hasPrevAndIsOpen,
  hasNextAndIsOpen,
  title,
  children,
  previousRunLinksCount,
  className,
}) => {
  const styling = `card-lg open-section-rounded ${hasPrevAndIsOpen ? 'closed-section-rounded-top' : ''} ${hasNextAndIsOpen ? 'closed-section-rounded-bottom' : ''}`;
  const collapsibleTitle = (
    <div className={className}>
      <div className="section-collapsible-header-item">
        <Icon src={isOpen ? ArrowDropDown : ArrowRight} />
        <p className="section-title">{title}</p>
      </div>
      <div className="section-collapsible-header-actions">
        <div className="section-collapsible-header-action-item">
          <p>{previousRunLinksCount > 0 ? previousRunLinksCount : '-'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`section ${isOpen ? 'is-open' : ''}`}>
      <Collapsible
        className="section-collapsible-item-container"
        styling={styling}
        title={(
          <p className="flex-grow-1 section-collapsible-item">
            <strong>{collapsibleTitle}</strong>
          </p>
        )}
        iconWhenClosed=""
        iconWhenOpen=""
        open={isOpen}
        onToggle={() => handleToggle(index)}
      >
        <Collapsible.Body className="section-collapsible-item-body">{children}</Collapsible.Body>
      </Collapsible>
    </div>
  );
};

export default PreviousRunSectionCollapsible;
