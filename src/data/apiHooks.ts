import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { UserAgreement, UserAgreementRecord } from '@src/data/types';
import { libraryAuthoringQueryKeys } from '@src/library-authoring/data/apiHooks';
import {
  skipToken, useMutation, useQueries, useQuery, useQueryClient, UseQueryOptions,
} from '@tanstack/react-query';
import {
  BulkMigrateRequestData,
  bulkModulestoreMigrate,
  getCourseDetails,
  getModulestoreMigrationStatus,
  getPreviewModulestoreMigration, getUserAgreement,
  getUserAgreementRecord,
  getWaffleFlags, updateUserAgreementRecord,
  waffleFlagDefaults,
} from './api';
import { RequestStatus, RequestStatusType } from './constants';

export const migrationQueryKeys = {
  all: ['contentLibrary'],
  /**
   * Base key for data specific to a migration task
   */
  migrationTask: (migrationId?: string | null) => [...migrationQueryKeys.all, migrationId],
  migrationPreview: (library_key: string, source_key?: string) => [...migrationQueryKeys.all, 'preview', source_key, library_key],
};

export const courseDetailsKey = {
  all: ['courseDetails'],
  /**
   * Base key for get course details data.
   */
  courseDetails: (courseId: string) => [...courseDetailsKey.all, courseId],
};

/**
 * Get the waffle flags (which enable/disable specific features). They may
 * depend on which course we're in.
 */
export const useWaffleFlags = (courseId?: string) => {
  const queryClient = useQueryClient();

  const { data, isPending: isLoading, isError } = useQuery({
    queryKey: ['waffleFlags', courseId],
    queryFn: () => getWaffleFlags(courseId),
    // Waffle flags change rarely, so never bother refetching them:
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  let globalDefaults: typeof waffleFlagDefaults | undefined;
  if (data === undefined && courseId) {
    // If course-specific waffle flags were requested, first default to the
    // global (studio-wide) flags until we've loaded the course-specific ones.
    globalDefaults = queryClient.getQueryData(['waffleFlags', undefined]);
  }
  return {
    ...waffleFlagDefaults,
    ...globalDefaults, // Only used if we're requesting course-specific flags.
    ...data, // the actual flag values loaded from the server
    id: courseId,
    isLoading,
    isError,
  };
};

/**
 * Use this mutation to migrate multiple sources to a library
 */
export const useBulkModulestoreMigrate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestData: BulkMigrateRequestData) => bulkModulestoreMigrate(requestData),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.courseImports(variables.target) });
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.allMigrationInfo() });
    },
  });
};

/**
 * Get the migration status
 */
export const useModulestoreMigrationStatus = (migrationId: string | null, refetchInterval: number | false = 1000) => (
  useQuery({
    queryKey: migrationQueryKeys.migrationTask(migrationId),
    queryFn: migrationId ? () => getModulestoreMigrationStatus(migrationId!) : skipToken,
    refetchInterval,
  })
);

/**
 * Get the preview migration given a library key and a source key
 */
export const usePreviewMigration = (libraryKey: string, sourceKey?: string) => (
  useQuery({
    queryKey: migrationQueryKeys.migrationPreview(libraryKey, sourceKey),
    queryFn: sourceKey ? () => getPreviewModulestoreMigration(libraryKey, sourceKey) : skipToken,
  })
);

/**
 * Get details of a course
 */
export const useCourseDetails = (courseId: string) => {
  const query = useQuery({
    queryKey: courseDetailsKey.courseDetails(courseId),
    queryFn: () => getCourseDetails(courseId, getAuthenticatedUser().username),
    retry: false,
  });

  /**
   * Include a status summary field for now, to better match the old redux data
   * loading status that other components expect. This could be changed/removed in the future.
   */
  let status: RequestStatusType = RequestStatus.PENDING;

  if (query.isLoading) {
    status = RequestStatus.IN_PROGRESS;
  } else if (query.isSuccess) {
    status = RequestStatus.SUCCESSFUL;
  } else if (query.error) {
    const errorStatus = (query.error as any)?.response?.status;
    if (errorStatus === 404) {
      status = RequestStatus.NOT_FOUND;
    } else {
      status = RequestStatus.FAILED;
    }
  }

  return {
    ...query,
    status,
  };
};

export const getGatingAgreementTypes = (gatingTypes: string[]): string[] => (
  [...new Set(
    gatingTypes
      .flatMap(gatingType => getConfig().AGREEMENT_GATING?.[gatingType])
      .filter(item => Boolean(item)),
  )]
);

export const useUserAgreementRecord = (agreementType:string) => (
  useQuery<UserAgreementRecord, Error>({
    queryKey: ['agreement-record', agreementType],
    queryFn: () => getUserAgreementRecord(agreementType),
    retry: false,
  })
);

export const useUserAgreementRecords = (agreementTypes:string[]) => (
  useQueries({
    queries: agreementTypes.map<UseQueryOptions<UserAgreementRecord, Error>>(agreementType => ({
      queryKey: ['agreement-record', agreementType],
      queryFn: () => getUserAgreementRecord(agreementType),
      retry: false,
    })),
  })
);

export const useUserAgreementRecordUpdater = (agreementType:string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => updateUserAgreementRecord(agreementType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreement-record', agreementType] });
    },
  });
};

export const useUserAgreement = (agreementType:string) => (
  useQuery<UserAgreement, Error>({
    queryKey: ['agreements', agreementType],
    queryFn: () => getUserAgreement(agreementType),
    retry: false,
  })
);
