export const getFileSizeToClosestByte = (fileSize, numberOfDivides = 0) => {
  if (fileSize > 1000) {
    const updatedSize = fileSize / 1000;
    const incrementNumberOfDivides = numberOfDivides + 1;
    return getFileSizeToClosestByte(updatedSize, incrementNumberOfDivides);
  }
  const fileSizeFixedDecimal = Number.parseFloat(fileSize).toFixed(2);
  switch (numberOfDivides) {
  case 1:
    return `${fileSizeFixedDecimal} KB`;
  case 2:
    return `${fileSizeFixedDecimal} MB`;
  case 3:
    return `${fileSizeFixedDecimal} GB`;
  default:
    return `${fileSizeFixedDecimal} B`;
  }
};

export const sortFiles = (files, sortType) => {
  const [sort, direction] = sortType.split(',');
  let sortedFiles;
  if (sort === 'displayName') {
    sortedFiles = files.sort((f1, f2) => {
      const lowerCaseF1 = f1[sort].toLowerCase();
      const lowerCaseF2 = f2[sort].toLowerCase();
      if (lowerCaseF1 < lowerCaseF2) {
        return 1;
      }
      if (lowerCaseF1 > lowerCaseF2) {
        return -1;
      }
      return 0;
    });
  } else {
    sortedFiles = files.sort((f1, f2) => {
      if (f1[sort] < f2[sort]) {
        return 1;
      }
      if (f1[sort] > f2[sort]) {
        return -1;
      }
      return 0;
    });
  }
  const sortedIds = sortedFiles.map(file => file.id);
  if (direction === 'asc') {
    return sortedIds.reverse();
  }
  return sortedIds;
};
