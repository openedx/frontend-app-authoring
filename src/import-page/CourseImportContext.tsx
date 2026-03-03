import {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import moment from 'moment';
import Cookies from 'universal-cookie';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { useImportStatus, useStartCourseImporting } from './data/apiHooks';
import { setImportCookie } from './utils';
import { IMPORT_STAGES, LAST_IMPORT_COOKIE_NAME } from './data/constants';
import messages from './messages';

export type CourseImportContextData = {
  importTriggered: boolean;
  progress?: number;
  fileName?: string;
  currentStage: number;
  anyRequestFailed: boolean;
  anyRequestInProgress: boolean;
  isLoadingDenied: boolean;
  handleOnProcessUpload: (props: OnProcessUploadProps) => Promise<void>;
  formattedErrorMessage: string;
  successDate?: number;
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
  const [successDate, setSuccessDate] = useState<number>();

  const cookies = new Cookies();

  useEffect(() => {
    const cookieData = cookies.get(LAST_IMPORT_COOKIE_NAME);
    if (cookieData) {
      setImportTriggered(true);
      setFileName(cookieData.fileName);
      setSuccessDate(cookieData.date);
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
      const momentData = moment().valueOf();
      setImportCookie(momentData, file.name);
      setSuccessDate(momentData);
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
      progress,
      fileName,
      currentStage,
      anyRequestFailed,
      anyRequestInProgress,
      isLoadingDenied,
      handleOnProcessUpload,
      formattedErrorMessage,
      successDate,
    };

    return contextValue;
  }, [
    importTriggered,
    progress,
    fileName,
    currentStage,
    anyRequestFailed,
    anyRequestInProgress,
    isLoadingDenied,
    handleOnProcessUpload,
    formattedErrorMessage,
    successDate,
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
