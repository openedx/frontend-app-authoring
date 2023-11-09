import messages from '../messages';
import { importNewTaxonomy } from './api';

const importTaxonomy = async (intl) => {
  /*
    * This function is a temporary "Barebones" implementation of the import
    * functionality with `prompt` and `alert`. It is intended to be replaced
    * with a component that shows a `ModalDialog` in the future.
    * See: https://github.com/openedx/modular-learning/issues/116
    */
  /* eslint-disable no-alert */
  /* eslint-disable no-console */

  const selectFile = async () => new Promise((resolve) => {
  /*
   * This function get a file from the user. It does this by creating a
   * file input element, and then clicking it. This allows us to get a file
   * from the user without using a form. The file input element is created
   * and appended to the DOM, then clicked. When the user selects a file,
   * the change event is fired, and the file is resolved.
   * The file input element is then removed from the DOM.
  */
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.csv';
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) {
        resolve(null);
      }
      resolve(file);
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  });

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

  const taxonomyName = getTaxonomyName();
  if (taxonomyName == null) {
    return;
  }

  const taxonomyDescription = getTaxonomyDescription();
  if (taxonomyDescription == null) {
    return;
  }

  importNewTaxonomy(taxonomyName, taxonomyDescription, file)
    .then(() => {
      alert(intl.formatMessage(messages.importTaxonomySuccess));
    })
    .catch((error) => {
      alert(intl.formatMessage(messages.importTaxonomyError));
      console.error(error.response);
    });
};

export default {
  importTaxonomy,
};
