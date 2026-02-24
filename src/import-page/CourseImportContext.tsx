import {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import moment from 'moment';
import Cookies from 'universal-cookie';
import { UseMutationResult } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { useImportStatus, useStartCourseImporting } from './data/apiHooks';
import { setImportCookie } from './utils';
import { IMPORT_STAGES, LAST_IMPORT_COOKIE_NAME } from './data/constants';
import messages from './messages';

export type CourseImportContextData = {
  importTriggered: boolean;
  setImportTriggered: React.Dispatch<React.SetStateAction<boolean>>;
  importMutation: UseMutationResult;
  progress?: number;
  updateProgress: React.Dispatch<React.SetStateAction<number | undefined>>;
  fileName?: string;
  setFileName: React.Dispatch<React.SetStateAction<string | undefined>>;
  currentStage: number;
  setCurrentStage: React.Dispatch<React.SetStateAction<number>>;
  anyRequestFailed: boolean;
  anyRequestInProgress: boolean;
  isLoadingDenied: boolean;
  handleOnProcessUpload: (props: OnProcessUploadProps) => Promise<void>;
  formattedErrorMessage: string;
};

/**
 * Course Import Context.
 * Always available when we're in the context of the Course Import Page.
 *
 * Get this using `useCourseImportContext()`
 */
const CourseImportContext = createContext<CourseImportContextData | undefined>(undefined);

type CourseImportProviderProps = {
  children?: React.ReactNode;
};

type OnProcessUploadProps = {
  fileData: any;
  requestConfig: Record<string, any>;
  handleError: (error: any) => void;
};

export const CourseImportProvider = ({ children }: CourseImportProviderProps) => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const [isStopFetching, setStopFetching] = useState(false);
  const [importTriggered, setImportTriggered] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [fileName, setFileName] = useState<string>();
  const importMutation = useStartCourseImporting(courseId);
  const [progress, updateProgress] = useState<number>(0);

  const cookies = new Cookies();

  useEffect(() => {
    const cookieData = cookies.get(LAST_IMPORT_COOKIE_NAME);
    // TODO verificar si es necesario setear el saving status por algo
    // dispatch(updateSavingStatus(RequestStatus.SUCCESSFUL));
    if (cookieData) {
      setImportTriggered(true);
      setFileName(cookieData.fileName);
    }
  }, []);

  const reset = () => {
    setCurrentStage(0);
    updateProgress(0);
    setImportTriggered(false);
    setStopFetching(false);
    setFileName(undefined);
  };

  const handleOnProcessUpload = async ({
    fileData,
    requestConfig,
    handleError,
  }: OnProcessUploadProps) => {
    reset();
    const file = fileData.get('file');
    setFileName(file.name);
    setImportTriggered(true);
    importMutation.mutateAsync({
      fileData: file,
      requestConfig,
      handleError,
      updateProgress,
    }).then(() => {
      setImportCookie(moment().valueOf(), file.name);
    }).catch((error) => {
      handleError(error);
    });
  };

  const {
    data: importStatusData,
    isError: isErrorImportStatus,
    isPending: isPendingImportStatus,
    failureReason: importStatusError,
  } = useImportStatus(courseId, isStopFetching, fileName);

  const errorMessage = importStatusData?.message;
  const anyRequestFailed = isErrorImportStatus || importMutation.isError || Boolean(errorMessage);
  const anyRequestInProgress = isPendingImportStatus || importMutation.isPending;
  const formattedErrorMessage = anyRequestFailed ? errorMessage || intl.formatMessage(messages.defaultErrorMessage) : '';
  const isLoadingDenied = importStatusError?.response?.status === 403;

  useEffect(() => {
    const polledStage = importStatusData?.importStatus;
    if (polledStage !== undefined && polledStage >= 0) {
      setCurrentStage(polledStage);
    }
  }, [importStatusData?.importStatus]);

  useEffect(() => {
    if (currentStage === IMPORT_STAGES.SUCCESS || anyRequestFailed) {
      setStopFetching(true);
    }
  }, [currentStage, anyRequestFailed]);

  const context = useMemo<CourseImportContextData>(() => {
    const contextValue = {
      importTriggered,
      setImportTriggered,
      importMutation,
      progress,
      updateProgress,
      fileName,
      setFileName,
      currentStage,
      setCurrentStage,
      anyRequestFailed,
      anyRequestInProgress,
      isLoadingDenied,
      handleOnProcessUpload,
      formattedErrorMessage,
    };

    return contextValue;
  }, [
    importTriggered,
    setImportTriggered,
    importMutation,
    progress,
    updateProgress,
    fileName,
    setFileName,
    currentStage,
    setCurrentStage,
    anyRequestFailed,
    anyRequestInProgress,
    isLoadingDenied,
    handleOnProcessUpload,
    formattedErrorMessage,
  ]);

  return (
    <CourseImportContext.Provider value={context}>
      {children}
    </CourseImportContext.Provider>
  );
};

export function useCourseImportContext(): CourseImportContextData {
  const ctx = useContext(CourseImportContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useCourseImportContext() was used in a component without a <CourseImportProvider> ancestor.');
  }
  return ctx;
}
