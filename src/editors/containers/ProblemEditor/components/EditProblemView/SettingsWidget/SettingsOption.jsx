import React from 'react';
import { Collapsible, Icon, Card } from '@edx/paragon';
import { KeyboardArrowUp, KeyboardArrowDown } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { showFullCard } from './hooks';

export const SettingsOption = ({
  title,
  summary,
  children,
}) => {
  const { isCardCollapsed, toggleCardCollapse } = showFullCard();

  return (
    <Card>
      <Card.Section className="settingsCardTitleSection">
        <Collapsible.Advanced
          open={isCardCollapsed}
          onToggle={toggleCardCollapse}
        >
          <Collapsible.Trigger className="collapsible-trigger d-flex">
            <span className="flex-grow-1">{title}</span>
            <Collapsible.Visible whenClosed>
              <Icon src={KeyboardArrowDown} />
            </Collapsible.Visible>
            <Collapsible.Visible whenOpen>
              <Icon src={KeyboardArrowUp} />
            </Collapsible.Visible>
          </Collapsible.Trigger>
        </Collapsible.Advanced>
      </Card.Section>
      <Card.Section>
        <Collapsible.Advanced
          open={!isCardCollapsed}
        >
          <Collapsible.Body className="collapsible-body">
            <span>{summary}</span>
          </Collapsible.Body>
        </Collapsible.Advanced>
        <Collapsible.Advanced
          open={isCardCollapsed}
        >
          <Collapsible.Body className="collapsible-body">
            {children}
          </Collapsible.Body>
        </Collapsible.Advanced>
      </Card.Section>
    </Card>
  );
};

SettingsOption.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default SettingsOption;
