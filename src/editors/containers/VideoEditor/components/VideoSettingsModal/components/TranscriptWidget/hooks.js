import React from 'react';

export const transcriptLanguages = (transcripts) => {
  const languages = [];
  if (transcripts) {
    Object.keys(transcripts).forEach(transcript => {
      languages.push(transcript);
    });
    return languages.join(', ');
  }
  return 'None';
};

export const fileInput = () => {
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const selectedFile = e.target.files[0];
    console.log(selectedFile);
  };

  return {
    click,
    addFile,
    ref,
  };
};

export default { transcriptLanguages, fileInput };
