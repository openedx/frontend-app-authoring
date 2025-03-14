import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
} from '@openedx/paragon';
import messages from './messages';

export interface AlertErrorProps {
  error: unknown;
  title?: string;
  onDismiss?: () => void;
}

/* eslint-disable react/prop-types */
const AlertError: React.FC<AlertErrorProps> = ({ error, title, onDismiss }) => {
  const intl = useIntl();
  let errorDetails: string | undefined;
  if (error instanceof Object && (error as any).response?.data) {
    if (typeof (error as any).response?.data === 'string') {
      errorDetails = (error as any).response?.data;
    } else {
      errorDetails = JSON.stringify((error as any).response?.data, null, 2);
    }
  }

  return (
    <Alert
      variant="danger"
      className="mt-3"
      dismissible={!!onDismiss}
      closeLabel={intl.formatMessage(messages.dismissLabel)}
      onClose={onDismiss}
    >
      {title && <Alert.Heading>{title}</Alert.Heading>}
      {error instanceof Object && 'message' in error ? error.message : String(error)}
      <br />
      {errorDetails && (
        <pre>
          {errorDetails}
        </pre>
      )}
    </Alert>
  );
};

export default AlertError;
