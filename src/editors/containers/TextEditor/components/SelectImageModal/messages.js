export const messages = {
  nextButtonLabel: {
    id: 'authoring.texteditor.selectimagemodal.next.label',
    defaultMessage: 'Next',
    description: 'Label for Next button',
  },
  uploadButtonLabel: {
    id: 'authoring.texteditor.selectimagemodal.upload.label',
    defaultMessage: 'Upload a new image',
    description: 'Label for upload button',
  },
  titleLabel: {
    id: 'authoring.texteditor.selectimagemodal.title.label',
    defaultMessage: 'Add an image',
    description: 'Title for the select image modal',
  },
  searchPlaceholder: {
    id: 'authoring.texteditor.selectimagemodal.search.placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder text for search bar',
  },

  // Sort Dropdown
  sortByDateNewest: {
    id: 'authoring.texteditor.selectimagemodal.sort.datenewest.label',
    defaultMessage: 'By date added (newest)',
    description: 'Dropdown label for sorting by date (newest)',
  },
  sortByDateOldest: {
    id: 'authoring.texteditor.selectimagemodal.sort.dateoldest.label',
    defaultMessage: 'By date added (oldest)',
    description: 'Dropdown label for sorting by date (oldest)',
  },
  sortByNameAscending: {
    id: 'authoring.texteditor.selectimagemodal.sort.nameascending.label',
    defaultMessage: 'By name (ascending)',
    description: 'Dropdown label for sorting by name (ascending)',
  },
  sortByNameDescending: {
    id: 'authoring.texteditor.selectimagemodal.sort.namedescending.label',
    defaultMessage: 'By name (descending)',
    description: 'Dropdown label for sorting by name (descending)',
  },

  // Gallery
  addedDate: {
    id: 'authoring.texteditor.selectimagemodal.addedDate.label',
    defaultMessage: 'Added {date} at {time}',
    description: 'File date-added string',
  },
  loading: {
    id: 'authoring.texteditor.selectimagemodal.spinner.readertext',
    defaultMessage: 'loading...',
    description: 'Gallery loading spinner screen-reader text',
  },
  emptyGalleryLabel: {
    id: 'authoring.texteditor.selectimagemodal.emptyGalleryLabel',
    defaultMessage: 'No images found in your gallery. Please upload an image using the button below.',
    description: 'Label for when image gallery is empty.',
  },
  emptySearchLabel: {
    id: 'authoring.texteditor.selectimagemodal.emptySearchLabel',
    defaultMessage: 'No search results.',
    description: 'Label for when search returns nothing.',
  },

  // Errors
  errorTitle: {
    id: 'authoring.texteditor.selectimagemodal.error.errorTitle',
    defaultMessage: 'Error',
    description: 'Title of message presented to user when something goes wrong',
  },
  uploadImageError: {
    id: 'authoring.texteditor.selectimagemodal.error.uploadImageError',
    defaultMessage: 'Failed to Upload Image. Please Try again.',
    description: 'Message presented to user when image fails to upload',
  },
  fetchImagesError: {
    id: 'authoring.texteditor.selectimagemodal.error.fetchImagesError',
    defaultMessage: 'Failed to obtain course Images. Please Try again.',
    description: 'Message presented to user when images are not found',
  },
  selectImageError: {
    id: 'authoring.texteditor.selectimagemodal.error.selectImageError',
    defaultMessage: 'Select an image to continue.',
    description: 'Message presented to user when clicking Next without selecting an image',
  },
};

export default messages;
