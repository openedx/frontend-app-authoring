const messages = {
  // Gallery
  emptyGalleryLabel: {
    id: 'authoring.selectvideomodal.emptyGalleryLabel',
    defaultMessage:
      'No results found.',
    description: 'Label for when video gallery is empty.',
  },
  selectVideoButtonlabel: {
    id: 'authoring.selectvideomodal.selectvideo.label',
    defaultMessage: 'Select video',
    description: 'Label for Select video button',
  },
  titleLabel: {
    id: 'authoring.selectvideomodal.title.label',
    defaultMessage: 'Add video to your course',
    description: 'Title for the select video modal',
  },
  uploadButtonLabel: {
    id: 'authoring.selectvideomodal.upload.label',
    defaultMessage: 'Upload or embed a new video',
    description: 'Label for upload button',
  },

  // Sort Dropdown
  sortByDateNewest: {
    id: 'authoring.selectvideomodal.sort.datenewest.label',
    defaultMessage: 'newest',
    description: 'Dropdown label for sorting by date (newest)',
  },
  sortByDateOldest: {
    id: 'authoring.selectvideomodal.sort.dateoldest.label',
    defaultMessage: 'oldest',
    description: 'Dropdown label for sorting by date (oldest)',
  },
  sortByNameAscending: {
    id: 'authoring.selectvideomodal.sort.nameascending.label',
    defaultMessage: 'name A-Z',
    description: 'Dropdown label for sorting by name (ascending)',
  },
  sortByNameDescending: {
    id: 'authoring.selectvideomodal.sort.namedescending.label',
    defaultMessage: 'name Z-A',
    description: 'Dropdown label for sorting by name (descending)',
  },
  sortByDurationShortest: {
    id: 'authoring.selectvideomodal.sort.durationshortest.label',
    defaultMessage: 'shortest',
    description: 'Dropdown label for sorting by duration (shortest)',
  },
  sortByDurationLongest: {
    id: 'authoring.selectvideomodal.sort.durationlongest.label',
    defaultMessage: 'longest',
    description: 'Dropdown label for sorting by duration (longest)',
  },

  // Video status labels
  videoStatusAny: {
    id: 'authoring.selectvideomodal.videostatusnone.label',
    defaultMessage: 'Any status',
    description: 'Label for video status (any status)',
  },
  videoStatusUploading: {
    id: 'authoring.selectvideomodal.videostatusuploading.label',
    defaultMessage: 'Uploading',
    description: 'Label for video status (uploading)',
  },
  videoStatusProcessing: {
    id: 'authoring.selectvideomodal.videostatusprocessing.label',
    defaultMessage: 'In Progress',
    description: 'Label for video status (processing)',
  },
  videoStatusReady: {
    id: 'authoring.selectvideomodal.videostatusready.label',
    defaultMessage: 'Ready',
    description: 'Label for video status (ready)',
  },
  videoStatusFailed: {
    id: 'authoring.selectvideomodal.videostatusfailed.label',
    defaultMessage: 'Failed',
    description: 'Label for video status (failed)',
  },

  // Hide switch
  hideSelectedCourseVideosSwitchLabel: {
    id: 'authoring.selectvideomodal.switch.hideselectedcoursevideos.label',
    defaultMessage: 'Hide selected course videos',
    description: 'Switch label for hide selected course videos',
  },

  // Errors
  selectVideoError: {
    id: 'authoring.selectvideomodal.error.selectVideoError',
    defaultMessage: 'Select a video to continue.',
    description:
      'Message presented to user when clicking Next without selecting a video',
  },
  fileSizeError: {
    id: 'authoring.selectvideomodal.error.fileSizeError',
    defaultMessage:
      'Video must be 10 MB or less. Please resize image and try again.',
    description:
      'Message presented to user when file size of video is larger than 10 MB',
  },
  uploadVideoError: {
    id: 'authoring.selectvideomodal.error.uploadVideoError',
    defaultMessage: 'Failed to upload video. Please try again.',
    description: 'Message presented to user when video fails to upload',
  },
  fetchVideosError: {
    id: 'authoring.selectvideomodal.error.fetchVideosError',
    defaultMessage: 'Failed to obtain course videos. Please try again.',
    description: 'Message presented to user when videos are not found',
  },
};

export default messages;
