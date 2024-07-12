import React from 'react';
import {
  Alert,
} from '@openedx/paragon';

const AlertError: React.FC<{ error: unknown }> = ({ error }) => (
  <Alert variant="danger" className="mt-3">
    {error instanceof Object && 'message' in error ? error.message : String(error)}
    <br />
    {error instanceof Object && (error as any).response?.data && JSON.stringify((error as any).response?.data)}
  </Alert>
);

export default AlertError;
