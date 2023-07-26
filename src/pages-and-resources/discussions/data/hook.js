import { breakpoints, useWindowSize } from '@edx/paragon';

export default function useIsOnSmallScreen() {
  const windowSize = useWindowSize();
  return windowSize.width < breakpoints.medium.minWidth;
}
