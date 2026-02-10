import { Alert, Button, Hyperlink } from '@openedx/paragon';
import { Policy } from '@openedx/paragon/icons';
import { AgreementGated } from '@src/constants';
import {
  getGatingAgreementTypes,
  useUserAgreement,
  useUserAgreementRecord,
  useUserAgreementRecordUpdater,
} from '@src/data/apiHooks';

const AlertAgreement = ({ agreementType }: { agreementType: string }) => {
  const { data, isLoading, isError } = useUserAgreement(agreementType);
  const mutation = useUserAgreementRecordUpdater(agreementType);
  const showAlert = data && !isLoading && !isError;
  const handleAcceptAgreement = async () => {
    try {
      await mutation.mutateAsync();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error accepting agreement', e);
    }
  };
  if (!showAlert) { return null; }
  const { url, name, summary } = data;
  return (
    <Alert
      variant="warning"
      icon={Policy}
      actions={[
        <Hyperlink destination={url}>Learn more</Hyperlink>,
        <Button onClick={handleAcceptAgreement}>Agree</Button>,
      ]}
    >
      <Alert.Heading>{name}</Alert.Heading>
      {summary}
    </Alert>
  );
};

const AlertAgreementWrapper = (
  { agreementType }: { agreementType: string },
) => {
  const { data, isLoading, isError } = useUserAgreementRecord(agreementType);
  const showAlert = !data?.isCurrent && !isLoading && !isError;
  if (!showAlert) { return null; }
  return <AlertAgreement agreementType={agreementType} />;
};

export const AlertAgreementGatedFeature = (
  { gatingTypes }: { gatingTypes: AgreementGated[] },
) => {
  const agreementTypes = getGatingAgreementTypes(gatingTypes);
  return (
    <>
      {agreementTypes.map((agreementType) => (
        <AlertAgreementWrapper
          key={agreementType}
          agreementType={agreementType}
        />
      ))}
    </>
  );
};
