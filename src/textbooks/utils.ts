export interface TextbookFromValues {
  id?: string;
  chapters: {
    title: string;
    url: string;
  }[];
  tab_title?: string;
}

/**
 * Get textbook form initial values
 */
export const getTextbookFormInitialValues = (
  isEditForm: boolean = false,
  textbook: TextbookFromValues = {
    chapters: [],
  },
): TextbookFromValues => (isEditForm
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
