// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useQueryClient, useMutation } from '@tanstack/react-query';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/**
 * @param {number} taxonomyId
 * @returns {string}
 */
export const getManageOrgsApiUrl = (taxonomyId) => new URL(
  `api/content_tagging/v1/taxonomies/${taxonomyId}/orgs/`,
  getApiBaseUrl(),
).href;

/**
 * Build the mutation to assign organizations to a taxonomy.
 */
export const useManageOrgs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /**
    * @type {import("@tanstack/react-query").MutateFunction<
    *   any,
    *   any,
    *   {
    *     taxonomyId: number,
    *     orgs?: string[],
    *     allOrgs: boolean,
    *   }
    * >}
    */
    mutationFn: async ({ taxonomyId, orgs, allOrgs }) => {
      const { data } = await getAuthenticatedHttpClient().put(
        getManageOrgsApiUrl(taxonomyId),
        {
          all_orgs: allOrgs,
          orgs: allOrgs ? undefined : orgs,
        },
      );

      return camelCaseObject(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['taxonomyList'],
      });
      queryClient.invalidateQueries({
        queryKey: ['taxonomyDetail', variables.taxonomyId],
      });
    },
  });
};
