import { useState, FC } from 'react';
import {
  Collapsible,
  Icon,
} from '@openedx/paragon';
import {
  ArrowRight,
  ArrowDropDown,
} from '@openedx/paragon/icons';

interface Props {
  title: string;
  children: React.ReactNode;
  redItalics?: string;
  yellowItalics?: string;
  greenItalics?: string;
  className?: string;
}

const SectionCollapsible: FC<Props> = ({
  title, children, redItalics = '', yellowItalics = '', greenItalics = '', className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const styling = 'card-lg';
  const collapsibleTitle = (
    <div className={className}>
      <Icon src={isOpen ? ArrowDropDown : ArrowRight} className="open-arrow" />
      <strong>{title}</strong>
      <span className="red-italics">{redItalics}</span>
      <span className="yellow-italics">{yellowItalics}</span>
      <span className="green-italics">{greenItalics}</span>
    </div>
  );

  return (
    <div className={`section ${isOpen ? 'is-open' : ''}`}>
      <Collapsible
        styling={styling}
        title={(
          <p>
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
