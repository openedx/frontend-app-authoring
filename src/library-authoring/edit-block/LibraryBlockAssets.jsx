import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { fetchable } from '../common';
import { LoadingPage } from '../../generic';

/**
 * Display the static assets associated with an XBlock
 */
const LibraryBlockAssets = (props) => {
  const onDrop = useCallback(props.onDropFiles, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  if (props.assets.value === null) {
    return <LoadingPage loadingMessage="Loading..." />;
  }
  const assets = props.assets.value || [];

  return (
    <>
      <h1 className="float-right"><span className="sr-only">Static Assets</span></h1>
      <p>There are {assets.length} static asset files for this XBlock:</p>
      <ul>
        {
          assets.map(assetFile => (
            <li key={assetFile.path}>
              <a href={assetFile.url}>/static/{assetFile.path}</a> {' '}
              ({Math.round(assetFile.size / 1024.0)} KB)
              (<Button variant="link" onClick={() => props.onDeleteFile(assetFile.path)} className="p-0" title="Delete this file">x</Button>)
            </li>
          ))
        }
      </ul>
      <div
        {...getRootProps()}
        style={{
          lineHeight: '150px',
          border: '3px solid #ddd',
          textAlign: 'center',
          backgroundColor: isDragActive ? '#90ee90' : '#fbfbfb',
          marginBottom: '1em',
        }}
      >
        <input {...getInputProps()} />
        {
          isDragActive
            ? <span> Drop the files here ...</span>
            : <span> Drag and drop some files here to upload them, or click here to select files.</span>
        }
      </div>
      <p>Tip: set the filenames carefully <em>before</em> uploading, as there is no rename tool.</p>
      <p>
        Within OLX or when using the &quot;Edit&quot; tab, always reference assets using /static/filename, e.g.
        <code>&lt;img src=&quot;/static/jamie.jpg&quot; alt=&quot;Picture of Jamie&quot;/&gt;</code>
      </p>
    </>
  );
};

LibraryBlockAssets.propTypes = {
  assets: fetchable(PropTypes.arrayOf(PropTypes.object)).isRequired,
  onDropFiles: PropTypes.func.isRequired,
  onDeleteFile: PropTypes.func.isRequired,
};

export default LibraryBlockAssets;
