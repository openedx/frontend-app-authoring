import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import moment from 'moment';
import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { useIntl } from '@edx/frontend-platform/i18n';
import { useExportStatus, useInvalidateExportStatus, useStartCourseExporting } from './data/apiHooks';
import { EXPORT_STAGES, LAST_EXPORT_COOKIE_NAME } from './data/constants';
import messages from './messages';
import { setExportCookie } from './utils';

export type CourseExportContextData = {
  currentStage: number;
  exportTriggered: boolean;
  fetchExportErrorMessage?: string;
  errorUnitUrl?: string;
  anyRequestInProgress: boolean;
  anyRequestFailed: boolean;
  isLoadingDenied: boolean;
  successDate?: number;
  handleStartExportingCourse: () => void;
  downloadPath?: string;
};

/**
 * Course Export Context.
 * Always available when we're in the context of the Course Export Page.
 *
 * Get this using `useCourseExportContext()`
 */
const CourseExportContext = createContext<CourseExportContextData | undefined>(undefined);

type CourseExportProviderProps = {
  children?: React.ReactNode;
};

export const CourseExportProvider = ({ children }: CourseExportProviderProps) => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const cookies = new Cookies();

  const [isStopFetching, setStopFetching] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);
  const [successDate, setSuccessDate] = useState<number>();

  const reset = () => {
    setStopFetching(false);
    setExportTriggered(false);
    setSuccessDate(undefined);
  };

  const {
    data: exportStatus,
    isPending: isPendingExportStatus,
    isError: isErrorExportStatus,
    failureReason: exportStatusError,
  } = useExportStatus(courseId, isStopFetching, exportTriggered);
  const exportMutation = useStartCourseExporting(courseId);
  const invalidateExportStatus = useInvalidateExportStatus(courseId);

  const currentStage = exportStatus?.exportStatus ?? 0;
  const anyRequestInProgress = exportMutation.isPending || isPendingExportStatus;
  const anyRequestFailed = exportMutation.isError || isErrorExportStatus;
  const isLoadingDenied = exportStatusError?.response?.status === 403;

  let fetchExportErrorMessage: string | undefined;
  let errorUnitUrl;
  if (exportStatus?.exportError) {
    fetchExportErrorMessage = exportStatus.exportError.rawErrorMsg ?? intl.formatMessage(messages.unknownError);
    errorUnitUrl = exportStatus.exportError.editUnitUrl;
  }

  let downloadPath;
  if (exportStatus?.exportOutput) {
    downloadPath = exportStatus.exportOutput;
    if (downloadPath.startsWith('/')) {
      downloadPath = `${getConfig().STUDIO_BASE_URL}${downloadPath}`;
    }
  }

  // On mount, restore export state from the cookie set by a previous session,
  // so the stepper remains visible if the user navigates away and comes back.
  useEffect(() => {
    const cookieData = cookies.get(LAST_EXPORT_COOKIE_NAME);
    if (cookieData) {
      setExportTriggered(true);
      setSuccessDate(cookieData.date);
    }
  }, []);

  // Stop fetching the export status once the process has reached a terminal state:
  // successful completion, a network/request failure, or an application-level export error.
  useEffect(() => {
    if (currentStage === EXPORT_STAGES.SUCCESS || anyRequestFailed || fetchExportErrorMessage) {
      setStopFetching(true);
    }
  }, [currentStage, anyRequestFailed, fetchExportErrorMessage]);

  const handleStartExportingCourse = async () => {
    reset();
    invalidateExportStatus();
    setExportTriggered(true);
    await exportMutation.mutateAsync();
    const momentDate = moment().valueOf();
    setExportCookie(momentDate);
    setSuccessDate(momentDate);
  };

  const context = useMemo<CourseExportContextData>(() => ({
    currentStage,
    exportTriggered,
    fetchExportErrorMessage,
    errorUnitUrl,
    anyRequestFailed,
    isLoadingDenied,
    anyRequestInProgress,
    successDate,
    handleStartExportingCourse,
    downloadPath,
  }), [
    currentStage,
    exportTriggered,
    fetchExportErrorMessage,
    errorUnitUrl,
    anyRequestFailed,
    isLoadingDenied,
    anyRequestInProgress,
    successDate,
    handleStartExportingCourse,
    downloadPath,
  ]);

  return (
    <CourseExportContext.Provider value={context}>
      {children}
    </CourseExportContext.Provider>
  );
};

export function useCourseExportContext(): CourseExportContextData {
  const ctx = useContext(CourseExportContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useCourseExportContext() was used in a component without a <CourseExportProvider> ancestor.');
  }
  return ctx;
}
