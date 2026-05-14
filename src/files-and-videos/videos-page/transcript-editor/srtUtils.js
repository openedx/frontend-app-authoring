export const parseSrt = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.split('\n'))
    .map((lines) => {
      if (lines.length < 2) {
        return null;
      }

      const hasIndex = /^\d+$/.test(lines[0].trim());
      const timeLine = hasIndex ? lines[1] : lines[0];
      const textLines = hasIndex ? lines.slice(2) : lines.slice(1);

      const match = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
      if (!match) {
        return null;
      }

      return {
        startTime: match[1],
        endTime: match[2],
        text: textLines.join('\n').trim(),
      };
    })
    .filter(Boolean);
};

export const serializeSrt = (cues) => cues
  .map((cue, index) => `${index + 1}\n${cue.startTime} --> ${cue.endTime}\n${cue.text}`)
  .join('\n\n');

export const parseTimestamp = (timestamp) => {
  const [hms, ms] = timestamp.split(',');
  const [hours, minutes, seconds] = hms.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds + (Number(ms || 0) / 1000);
};

export const formatTimestamp = (totalSeconds) => {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const milliseconds = Math.round((safeSeconds - Math.floor(safeSeconds)) * 1000);

  const pad2 = (value) => String(value).padStart(2, '0');
  const pad3 = (value) => String(value).padStart(3, '0');

  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)},${pad3(milliseconds)}`;
};

/**
 * Strictly validates SRT content.
 * Returns true for empty/blank files (valid empty transcript).
 * Returns false if the file has cue blocks where ANY block has a malformed
 * timestamp line (partial corruption is not allowed).
 */
export const isValidSrt = (text) => {
  if (!text || typeof text !== 'string') {
    return true;
  }

  const blocks = text.trim().split(/\n\s*\n/).filter((b) => b.trim().length > 0);
  if (blocks.length === 0) {
    return true;
  }

  const TIMESTAMP_LINE = /^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/;

  return blocks.every((block) => {
    const lines = block.trim().split('\n').map((l) => l.trim());
    if (lines.length < 2) {
      return false;
    }
    const hasIndex = /^\d+$/.test(lines[0]);
    const timeLine = hasIndex ? lines[1] : lines[0];
    return TIMESTAMP_LINE.test(timeLine);
  });
};
