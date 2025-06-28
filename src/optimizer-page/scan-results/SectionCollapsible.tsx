import { FC } from 'react';
import {
  Collapsible,
  Icon,
} from '@openedx/paragon';
import {
  ArrowRight,
  ArrowDropDown,
  LinkOff,
} from '@openedx/paragon/icons';
import CustomIcon from './CustomIcon';
import messages from './messages';
import lockedIcon from './lockedIcon';
import ManualIcon from './manualIcon';

interface Props {
  index: number;
  handleToggle: Function;
  isOpen: boolean;
  hasPrevAndIsOpen: boolean;
  hasNextAndIsOpen: boolean;
  title: string;
  children: React.ReactNode;
  brokenNumber: number;
  manualNumber: number;
  lockedNumber: number;
  className?: string;
}

const SectionCollapsible: FC<Props> = ({
  index,
  handleToggle,
  isOpen,
  hasPrevAndIsOpen,
  hasNextAndIsOpen,
  title,
  children,
  brokenNumber,
  manualNumber,
  lockedNumber,
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
          <CustomIcon icon={LinkOff} message1={messages.brokenLabel} message2={messages.brokenInfoTooltip} />
          <p>{brokenNumber}</p>
        </div>
        <div className="section-collapsible-header-action-item">
          <CustomIcon icon={ManualIcon} message1={messages.manualLabel} message2={messages.manualInfoTooltip} />
          <p>{manualNumber}</p>
        </div>
        <div className="section-collapsible-header-action-item">
          <CustomIcon icon={lockedIcon} message1={messages.lockedLabel} message2={messages.lockedInfoTooltip} />
          <p>{lockedNumber}</p>
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

export default SectionCollapsible;
