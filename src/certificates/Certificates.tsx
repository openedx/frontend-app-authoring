import { Helmet } from 'react-helmet';

import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';
import Placeholder from '../editors/Placeholder';
import Loading from '../generic/Loading';
import { useCertificatesData } from './hooks/useCertificates';
import CertificateWithoutModes from './certificate-without-modes/CertificateWithoutModes';
import EmptyCertificatesWithModes from './empty-certificates-with-modes/EmptyCertificatesWithModes';
import CertificatesList from './certificates-list/CertificatesList';
import CertificateCreateForm from './certificate-create-form/CertificateCreateForm';
import CertificateEditForm from './certificate-edit-form/CertificateEditForm';
import { MODE_STATES } from './data/constants';
import MainLayout from './layout/MainLayout';
import { useCertificatesContext } from './context';

const MODE_COMPONENTS = {
  [MODE_STATES.noModes]: CertificateWithoutModes,
  [MODE_STATES.noCertificates]: EmptyCertificatesWithModes,
  [MODE_STATES.create]: CertificateCreateForm,
  [MODE_STATES.view]: CertificatesList,
  [MODE_STATES.editAll]: CertificateEditForm,
};

const Certificates = () => {
  const {
    certificates,
    componentMode,
    isLoading,
    isDenied,
    pageHeadTitle,
    hasCertificateModes,
  } = useCertificatesData();

  const { canViewCertificates } = useCertificatesContext();

  if (!canViewCertificates) {
    return <PermissionDeniedAlert />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isDenied) {
    return (
      <div className="row justify-content-center m-6" data-testid="request-denied-placeholder">
        <Placeholder />
      </div>
    );
  }

  const ModeComponent = MODE_COMPONENTS[componentMode] || MODE_COMPONENTS[MODE_STATES.noModes];

  return (
    <>
      <Helmet>
        <title>{pageHeadTitle}</title>
      </Helmet>
      <MainLayout
        showHeaderButtons={!!(hasCertificateModes && certificates && certificates?.length > 0)}
      >
        <ModeComponent />
      </MainLayout>
    </>
  );
};

export default Certificates;
