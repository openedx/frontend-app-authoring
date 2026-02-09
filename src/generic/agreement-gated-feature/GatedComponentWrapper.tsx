import { AgreementGated } from '@src/constants';
import {
  getGatingAgreementTypes,
  useUserAgreementRecords,
} from '@src/data/apiHooks';

interface GatedComponentWrapperProps {
  gatingTypes: AgreementGated[];
  children: React.ReactNode;
}

export const GatedComponentWrapper = ({ gatingTypes, children }: GatedComponentWrapperProps) => {
  const agreementTypes = getGatingAgreementTypes(gatingTypes);
  const results = useUserAgreementRecords(agreementTypes);
  const isNotGated = results.every(result => !!result?.data?.isCurrent);
  return isNotGated ? children : (
    <div
      aria-disabled
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'blur(2px)',
      }}
    >
      {children}
    </div>
  );
};
