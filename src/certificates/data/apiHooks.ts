import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as api from './api';
import { useMutationWithProcessingNotification } from '@src/generic/processing-notification/data/apiHooks';
import { NOTIFICATION_MESSAGES } from '@src/constants';

export const certificatesQueryKeys = {
  all: ['certificates'],
  /** Base key for certificate data specific to a courseId */
  certificates: (courseId: string) => [...certificatesQueryKeys.all, courseId],
};

/**
 * Hook to fetch certificates metadata for the given courseId.
 */
export const useCertificates = (courseId: string) => (
  useQuery<api.CertificatesMetadata, AxiosError>({
    queryKey: certificatesQueryKeys.certificates(courseId),
    queryFn: () => api.getCertificates(courseId),
  })
);

/**
 * Hook to create a new certificate for a course.
 */
export const useCreateCertificate = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (certificateData: api.CreateCertificateData) => api.createCertificate(courseId, certificateData),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: certificatesQueryKeys.certificates(courseId) });
    },
  });
};

/**
 * Hook to update an existing certificate for a course.
 */
export const useUpdateCertificate = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (certificateData: api.Certificate) => api.updateCertificate(courseId, certificateData),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: certificatesQueryKeys.certificates(courseId) });
    },
  });
};

/**
 * Hook to delete a certificate from a course.
 */
export const useDeleteCertificate = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (certificateId: number) => api.deleteCertificate(courseId, certificateId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: certificatesQueryKeys.certificates(courseId) });
    },
  }, {
    notificationMessage: NOTIFICATION_MESSAGES.deleting,
  });
};

/**
 * Hook to activate or deactivate a course certificate.
 */
export const useUpdateCertificateActiveStatus = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: ({ path, activationStatus }: { path: string; activationStatus: unknown; }) =>
      api.updateActiveStatus(path, activationStatus),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: certificatesQueryKeys.certificates(courseId) });
    },
  });
};
