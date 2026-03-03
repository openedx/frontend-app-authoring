/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
  CourseBestPracticesRequest,
  CourseLaunchData,
  CourseLaunchRequest,
  getCourseBestPractices,
  getCourseLaunch,
} from './api';

export const courseChecklistQueryKeys = {
  all: ['courseChecklist'],
  courseBestPractices: (params: CourseBestPracticesRequest) => [
    ...courseChecklistQueryKeys.all,
    'bestPractices',
    params,
  ],
  courseLaunch: (params: CourseLaunchRequest) => [
    ...courseChecklistQueryKeys.all,
    'launch',
    params,
  ],
};

/**
 * Hook to fetch course best practices.
 *
 * It is necessary to update on each mount, because it is not known
 * for sure whether the checklist has been updated or not.
 */
export const useCourseBestPractices = (params: CourseBestPracticesRequest) => (
  useQuery({
    queryKey: courseChecklistQueryKeys.courseBestPractices(params),
    queryFn: () => getCourseBestPractices(params),
    refetchOnMount: 'always',
  })
);

/**
 * Hook to fetch course launch validation.
 *
 * It is necessary to update on each mount, because it is not known
 * for sure whether the checklist has been updated or not.
 */
export const useCourseLaunch = (params: CourseLaunchRequest) => (
  useQuery<CourseLaunchData, AxiosError>({
    queryKey: courseChecklistQueryKeys.courseLaunch(params),
    queryFn: () => getCourseLaunch(params),
    refetchOnMount: 'always',
  })
);
