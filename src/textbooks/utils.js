/**
 * Get textbook form initial values
 * @param {boolean} isEditForm - edit or add new form value
 * @param {object} textbook - value from api
 * @returns {object}
 */
const getTextbookFormInitialValues = (isEditForm = false, textbook = {}) => (isEditForm
  ? textbook
  : {
    tab_title: '',
    chapters: [
      {
        title: '',
        url: '',
      },
    ],
  });

export {
  getTextbookFormInitialValues,
};
