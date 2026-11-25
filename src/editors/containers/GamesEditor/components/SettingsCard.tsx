import React from 'react';
import { Card, Collapsible, Icon } from '@openedx/paragon';
import { KeyboardArrowDown, KeyboardArrowUp } from '@openedx/paragon/icons';

interface Props {
  title: string;
  /** The current value, shown in place of the controls while the card is collapsed. */
  summary: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * One card in the settings sidebar: a title row that opens and closes the
 * card, and either a one-line summary (closed, the default, as in
 * ProblemEditor's settings) or the controls (open).
 */
const SettingsCard = ({
  title,
  summary,
  className = '',
  children,
}: Props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Card className={`${className} border border-light-700 shadow-none`}>
      <Card.Section className="settingsCardTitleSection">
        <Collapsible.Advanced open={isOpen} onToggle={setIsOpen}>
          <Collapsible.Trigger className="collapsible-trigger d-flex">
            <span className="flex-grow-1 text-primary-500 x-small">{title}</span>
            <Collapsible.Visible whenClosed>
              <Icon src={KeyboardArrowDown} />
            </Collapsible.Visible>
            <Collapsible.Visible whenOpen>
              <Icon src={KeyboardArrowUp} />
            </Collapsible.Visible>
          </Collapsible.Trigger>
        </Collapsible.Advanced>
      </Card.Section>
      <Card.Section className="pt-0">
        {isOpen
          ? <div className="text-primary-500 x-small">{children}</div>
          : <span className="small text-primary-500">{summary}</span>}
      </Card.Section>
    </Card>
  );
};

export default SettingsCard;
