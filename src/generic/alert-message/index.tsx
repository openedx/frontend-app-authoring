import React from 'react';
import { Alert } from '@openedx/paragon';

interface Props extends React.ComponentPropsWithoutRef<typeof Alert> {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
}

const AlertMessage: React.FC<Props> = ({ title, description, ...props }) => (
  <Alert {...props}>
    <Alert.Heading>{title}</Alert.Heading>
    <span>{description}</span>
  </Alert>
);

export default AlertMessage;
