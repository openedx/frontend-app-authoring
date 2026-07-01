import { createContext, useContext, useMemo, useState } from 'react';
import { MODE_STATES } from './data/constants';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import {
  useCreateCertificate,
  useDeleteCertificate,
  useUpdateCertificate,
  useUpdateCertificateActiveStatus,
} from './data/apiHooks';
import { UseMutationResult } from '@tanstack/react-query';

export type ModeState = typeof MODE_STATES[keyof typeof MODE_STATES];

export type CertificatesContextData = {
  componentMode: ModeState;
  setComponentMode: (mode: ModeState) => void;
  savingIsSuccess: boolean;
  savingErrorMessage?: string;
  activationStatusMutation: UseMutationResult;
  updateCertificateMutation: UseMutationResult;
  deleteCertificateMutation: UseMutationResult;
  createCertificateMutation: UseMutationResult;
};

/**
 * Certificates Context
 */
const CertificatesContext = createContext<CertificatesContextData | undefined>(undefined);

export const CertificatesProvider = ({ children }) => {
  const { courseId } = useCourseAuthoringContext();
  const [componentMode, setComponentMode] = useState<ModeState>(MODE_STATES.noModes);
  const activationStatusMutation = useUpdateCertificateActiveStatus(courseId);
  const updateCertificateMutation = useUpdateCertificate(courseId);
  const deleteCertificateMutation = useDeleteCertificate(courseId);
  const createCertificateMutation = useCreateCertificate(courseId);

  const context = useMemo<CertificatesContextData>(() => {
    const savingIsSuccess = activationStatusMutation.isSuccess ||
      updateCertificateMutation.isSuccess ||
      deleteCertificateMutation.isSuccess ||
      createCertificateMutation.isSuccess;
    const savingErrorMessage =
      (activationStatusMutation.isError ? activationStatusMutation.error?.message : undefined) ??
        (updateCertificateMutation.isError ? updateCertificateMutation.error?.message : undefined) ??
        (deleteCertificateMutation.isError ? deleteCertificateMutation.error?.message : undefined) ??
        (createCertificateMutation.isError ? createCertificateMutation.error?.message : undefined);

    const contextValue = {
      componentMode,
      setComponentMode,
      activationStatusMutation,
      updateCertificateMutation,
      deleteCertificateMutation,
      createCertificateMutation,
      savingIsSuccess,
      savingErrorMessage,
    } as CertificatesContextData;

    return contextValue;
  }, [
    componentMode,
    setComponentMode,
    activationStatusMutation,
    updateCertificateMutation,
  ]);

  return (
    <CertificatesContext.Provider value={context}>
      {children}
    </CertificatesContext.Provider>
  );
};

export function useCertificatesContext(): CertificatesContextData {
  const ctx = useContext(CertificatesContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useCertificatesContext() was used in a component without a <CertificatesProvider> ancestor.');
  }
  return ctx;
}
