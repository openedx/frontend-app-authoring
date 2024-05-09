// @ts-check
import messages from './messages';

/*
 * This function get a file from the user. It does this by creating a
 * file input element, and then clicking it. This allows us to get a file
 * from the user without using a form. The file input element is created
 * and appended to the DOM, then clicked. When the user selects a file,
 * the change event is fired, and the file is resolved.
 * The file input element is then removed from the DOM.
*/
/* istanbul ignore next */
const selectFile = async () => new Promise((resolve) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,.csv';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', (/** @type { Event & { target: HTMLInputElement} } */ event) => {
    const file = event.target.files?.[0];
    if (!file) {
      resolve(null);
    }
    resolve(file);
    document.body.removeChild(fileInput);
  }, false);

  fileInput.addEventListener('cancel', () => {
    resolve(null);
    document.body.removeChild(fileInput);
  }, false);

  document.body.appendChild(fileInput);

  // Calling click() directly was not working as expected, so we use setTimeout
  // to ensure the file input is added to the DOM before clicking it.
  setTimeout(() => fileInput.click(), 0);
});

/* istanbul ignore next */
/**
 * @param {*} intl The react-intl object returned by the useIntl() hook
 * @param {ReturnType<typeof import('../data/apiHooks').useImportNewTaxonomy>} importMutation The import mutation
 *        returned by the useImportNewTaxonomy() hook.
 * @param {() => void} showImportInProgressAlert Function to show `In progress` alert.
 * @param {() => void} closeImportInProgressAlert Function to close `In progress` alert.
 */
export const importTaxonomy = async ( // eslint-disable-line import/prefer-default-export
  intl,
  importMutation,
  showImportInProgressAlert,
  closeImportInProgressAlert,
) => {
  /*
    * This function is a temporary "Barebones" implementation of the import
    * functionality with `prompt` and `alert`. It is intended to be replaced
    * with a component that shows a `ModalDialog` in the future.
    * See: https://github.com/openedx/modular-learning/issues/116
    */
  /* eslint-disable no-alert */
  /* eslint-disable no-console */

  const getTaxonomyName = () => {
    let taxonomyName = null;
    while (!taxonomyName) {
      taxonomyName = prompt(intl.formatMessage(messages.promptTaxonomyName));

      if (taxonomyName == null) {
        break;
      }

      if (!taxonomyName) {
        alert(intl.formatMessage(messages.promptTaxonomyNameRequired));
      }
    }
    return taxonomyName;
  };

  const getTaxonomyDescription = () => prompt(intl.formatMessage(messages.promptTaxonomyDescription));

  const file = await selectFile();

  if (!file) {
    return;
  }

  const name = getTaxonomyName();
  if (name == null) {
    return;
  }

  const description = getTaxonomyDescription();
  if (description == null) {
    return;
  }

  showImportInProgressAlert();

  importMutation.mutateAsync({
    name,
    description,
    file,
  }).then(() => {
    closeImportInProgressAlert();
    alert(intl.formatMessage(messages.importTaxonomySuccess));
  }).catch((error) => {
    closeImportInProgressAlert();
    alert(intl.formatMessage(messages.importTaxonomyError));
    console.error(error.response);
  });
};
