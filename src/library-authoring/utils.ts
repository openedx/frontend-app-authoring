/**
 * Utilities functions for library authoring
 */
export enum ContainerType {
  Unit = 'unit',
}

export function getContainerTypeFromId(containerId: string): ContainerType | undefined {
  const parts = containerId.split(':');
  if (parts.length < 2) {
    return undefined;
  }

  const maybeType = parts[parts.length - 2];

  if (Object.values(ContainerType).includes(maybeType as ContainerType)) {
    return maybeType as ContainerType;
  }

  return undefined;
}
