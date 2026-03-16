import { StrictDict } from '../../../../../../utils';

export const acceptedImgKeys = StrictDict({
  gif: '.gif',
  jpg: '.jpg',
  jpeg: '.jpeg',
  png: '.png',
  bmp: '.bmp',
  bmp2: '.bmp2',
});
export const MAX_FILE_SIZE_MB = 2000000;
export const MIN_FILE_SIZE_KB = 2000;
export const MAX_WIDTH = 1280;
export const MAX_HEIGHT = 720;
export const MIN_WIDTH = 640;
export const MIN_HEIGHT = 360;
// eslint-disable-next-line no-loss-of-precision, @typescript-eslint/no-loss-of-precision
export const ASPECT_RATIO = 1.7777777777777777777;
export const ASPECT_RATIO_ERROR_MARGIN = 0.1;
export default {
  acceptedImgKeys,
  MAX_FILE_SIZE_MB,
  MIN_FILE_SIZE_KB,
  MAX_WIDTH,
  MAX_HEIGHT,
  MIN_WIDTH,
  MIN_HEIGHT,
  ASPECT_RATIO,
  ASPECT_RATIO_ERROR_MARGIN,
};
