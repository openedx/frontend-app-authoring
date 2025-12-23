import { useState, FC } from 'react';
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
  title: string;
  children: React.ReactNode;
  brokenNumber: number;
  manualNumber: number;
  lockedNumber: number;
  className?: string;
}

const SectionCollapsible: FC<Props> = ({
  title, children, brokenNumber = 0, manualNumber = 0, lockedNumber = 0, className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const styling = 'card-lg rounded-sm shadow-outline';
  const collapsibleTitle = (
    <div className={className}>
      <div className="section-collapsible-header-item">
        <Icon src={isOpen ? ArrowDropDown : ArrowRight} />
        <strong>{title}</strong>
      </div>
      <div className="section-collapsible-header-actions">
        <span>
          <CustomIcon icon={LinkOff} message1={messages.brokenLabel} message2={messages.brokenInfoTooltip} />
          {brokenNumber}
        </span>
        <span>
          <CustomIcon icon={ManualIcon} message1={messages.manualLabel} message2={messages.manualInfoTooltip} />
          {manualNumber}
        </span>
        <span>
          <CustomIcon icon={lockedIcon} message1={messages.lockedLabel} message2={messages.lockedInfoTooltip} />
          {lockedNumber}
        </span>
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
        onToggle={() => setIsOpen(!isOpen)}
      >
        <Collapsible.Body>{children}</Collapsible.Body>
      </Collapsible>
    </div>
  );
};

export default SectionCollapsible;
