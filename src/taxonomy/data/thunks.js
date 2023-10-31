// @ts-check
import { getTaxonomyExportFile } from './api';

/**
 * Downloads the file of the exported taxonomy
 * @param {number} pk
 * @param {string} format
 * @returns {void}
 */
const exportTaxonomy = (pk, format) => (
  getTaxonomyExportFile(pk, format)
);

export default exportTaxonomy;
