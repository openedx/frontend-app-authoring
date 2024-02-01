import { breakpoints, useWindowSize } from '@openedx/paragon';

export default function useIsOnSmallScreen() {
  const windowSize = useWindowSize();
  return windowSize.width < breakpoints.medium.minWidth;
}
