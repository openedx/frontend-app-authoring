import { Alert, Button, Hyperlink } from '@openedx/paragon';
import { Policy } from '@openedx/paragon/icons';
import {
  getGatingAgreementType,
  useUserAgreement,
  useUserAgreementRecord, useUserAgreementRecordUpdater,
} from '@src/data/apiHooks';

const AlertAgreement = ({ agreementType }: { agreementType: string }) => {
  const { data, isLoading, isError } = useUserAgreement(agreementType);
  const mutation = useUserAgreementRecordUpdater(agreementType);
  const showAlert = !data && !isLoading && !isError;
  if (!showAlert) { return null; }
  const { url, name, summary } = data;
  return (
    <Alert
      variant="warning"
      icon={Policy}
      actions={[
        <Hyperlink destination={url}>Learn more</Hyperlink>,
        <Button onClick={async () => mutation.mutateAsync()}>Agree</Button>,
      ]}
    >
      <Alert.Heading>{name}</Alert.Heading>
      {summary}
    </Alert>
  );
};

const AlertAgreementWrapper = ({ agreementType }: { agreementType: string }) => {
  const { data, isLoading, isError } = useUserAgreementRecord(agreementType);
  const showAlert = !data && !isLoading && !isError;
  if (!showAlert) { return null; }
  return <AlertAgreement agreementType={agreementType} />;
};

export const AlertAgreementGatedFeature = ({ gatingType }: { gatingType: string }) => {
  const agreementType = getGatingAgreementType(gatingType);
  if (!agreementType) { return null; }
  return <AlertAgreementWrapper agreementType={agreementType} />;
};
