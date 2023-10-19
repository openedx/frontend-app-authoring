// @ts-check
import { useQuery, useMutation } from '@tanstack/react-query';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { downloadDataAsFile } from '../../../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomyListApiUrl = () => new URL('api/content_tagging/v1/taxonomies/?enabled=true', getApiBaseUrl()).href;
const getExportTaxonomyApiUrl = (pk, format) => new URL(
  `api/content_tagging/v1/taxonomies/${pk}/export/?output_format=${format}`,
  getApiBaseUrl(),
).href;

/**
 * @returns {import("../types.mjs").UseQueryResult}
 */
export const useTaxonomyListData = () => (
  useQuery({
    queryKey: ['taxonomyList'],
    queryFn: () => getAuthenticatedHttpClient().get(getTaxonomyListApiUrl())
      .then(camelCaseObject),
  })
);

export const useExportTaxonomy = () => {
  /**
   * Calls the export request and downloads the file.
   *
   * Extra logic is needed to download the exported file,
   * because it is not possible to download the file using the Content-Disposition header
   * Ref: https://medium.com/@drevets/you-cant-prompt-a-file-download-with-the-content-disposition-header-using-axios-xhr-sorry-56577aa706d6
   *
   * @param {import("../types.mjs").ExportRequestParams} params
   * @returns {Promise<void>}
   */
  const exportTaxonomy = async (params) => {
    const { pk, format, name } = params;
    const response = await getAuthenticatedHttpClient().get(getExportTaxonomyApiUrl(pk, format));
    const contentType = response.headers['content-type'];
    let fileExtension = '';
    let data;
    if (contentType === 'application/json') {
      fileExtension = 'json';
      data = JSON.stringify(response.data, null, 2);
    } else {
      fileExtension = 'csv';
      data = response.data;
    }
    downloadDataAsFile(data, contentType, `${name}.${fileExtension}`);
  };

  return useMutation(exportTaxonomy);
};
