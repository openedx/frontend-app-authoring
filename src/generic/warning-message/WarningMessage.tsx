import React from 'react';
import { Card, Icon } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import './WarningMessage.scss';

interface WarningMessageProps {
  message: string;
}

const WarningMessage: React.FC<WarningMessageProps> = ({ message }) => (
  <Card className="warning-message-card p-0">
    <div className="warning-message-content d-flex align-items-center">
      <span className="warning-message-icon d-flex align-items-center justify-content-center mr-3">
        <Icon src={WarningFilled} size="md" />
      </span>
      <div>
        <span className="warning-message-heading font-weight-bold d-block mb-0">Warning</span>
        <span className="warning-message-text">{message}</span>
      </div>
    </div>
  </Card>
);

export default WarningMessage;
