import { useEffect } from 'react';

import { useCertificatesContext } from '@src/certificates/context';

const useLayout = () => {
  const {
    savingIsSuccess,
    savingErrorMessage,
  } = useCertificatesContext();

  useEffect(() => {
    if (savingIsSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savingIsSuccess]);

  return {
    savingErrorMessage,
  };
};

export default useLayout;
