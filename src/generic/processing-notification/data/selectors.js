// eslint-disable-next-line import/prefer-default-export
export const getProcessingNotification = (state) => ({
  isShow: state.processingNotification.isShow,
  title: state.processingNotification.title,
});
