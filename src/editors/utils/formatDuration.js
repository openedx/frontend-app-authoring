import * as moment from 'moment-shortformat';

const formatDuration = (duration) => {
  const d = moment.duration(duration, 'seconds');
  if (d.hours() > 0) {
    return (
      `${d.hours().toString().padStart(2, '0')}:`
      + `${d.minutes().toString().padStart(2, '0')}:`
      + `${d.seconds().toString().padStart(2, '0')}`
    );
  }
  return (
    `${d.minutes().toString().padStart(2, '0')}:`
    + `${d.seconds().toString().padStart(2, '0')}`
  );
};

export default formatDuration;
