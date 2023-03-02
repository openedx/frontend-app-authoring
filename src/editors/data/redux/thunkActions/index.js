import { StrictDict } from '../../../utils';

/* eslint-disable import/no-cycle */
import app from './app';
import video from './video';
import problem from './problem';

export default StrictDict({
  app,
  video,
  problem,
});
