const useCourseOutline = () => {
  const handleNewSection = () => {
    // TODO add handler
    console.log('onNewSections');
  };

  const handleReindex = () => {
    // TODO add handler
    console.log('onReindex');
  };

  const handleExpandAll = () => {
    // TODO add handler
    console.log('onExpandAll');
  };

  const handleViewLive = () => {
    // TODO add handler
    console.log('onViewLive');
  };

  return {
    handleReindex,
    handleViewLive,
    handleExpandAll,
    handleNewSection,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseOutline };
