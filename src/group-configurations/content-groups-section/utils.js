const isAlreadyExistsGroup = (groupNames, group) => groupNames.some((name) => name === group);

const initialContentGroupObject = (groupName) => ({
  name: groupName,
  version: 1,
  usage: [],
});

export { isAlreadyExistsGroup, initialContentGroupObject };
