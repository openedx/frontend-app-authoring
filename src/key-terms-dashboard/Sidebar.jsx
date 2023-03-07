/* eslint-disable */

import React, { useState } from 'react';
import './KeyTermsDashboard.scss';

import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@edx/paragon/node_modules/@fortawesome/react-fontawesome';
import {
  faCloudUploadAlt,
  faFileDownload,
} from '@edx/paragon/node_modules/@fortawesome/free-solid-svg-icons';

import BulkImport from './Pages/BulkImport';
import DragAndDrop from './Pages/DragAndDrop';
import BulkImportValidator from './Pages/BulkImportValidator';
import CreateNewTerm from './Pages/CreateNewTerm';

function BulkUploadDrop() {
  const [fileDrop, setFileDrop] = useState('');
  const [validateModal, setValidateModal] = useState(false);
  const [saveValue, setSaveValue] = useState('default');
  const [bulkImportModal, setBulkImportModal] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleDrop = (files) => {
    if (!files[0].name) {
      return;
    }
    if (
      files[0].type !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      setFileError('File must be .xlsx format');
      return;
    }
    if (files[0].size > 10000000) {
      setFileError('File size cannot exceed 10MB');
      return;
    }
    setFileDrop(files[0]);
    console.log(files[0]);
    setValidateModal(true);
    setFileError('');
  };

  return (
    <DragAndDrop handleDrop={handleDrop}>
      <br />
      <FontAwesomeIcon icon={faCloudUploadAlt} size='3x' />
      <br />
      <b>
        Drag and Drop
        <br />
        Bulk Import
        <br />
      </b>

      <Button
        variant='outline-primary'
        size='sm'
        onClick={() => {
          setBulkImportModal(true);
        }}
      >
        Browse Your <br /> Computer
      </Button>

      <p className='drag-n-drop'>
        <i>
          Maximum file size:
          <br />
          10 MB
        </i>
      </p>

      {fileError !== '' ? <p className='error-message'>{fileError}</p> : null}

      {validateModal === true ? (
        <BulkImportValidator
          modalOpen={validateModal}
          setModalOpen={setValidateModal}
          excelFile={fileDrop}
          saveValue={saveValue}
          setSaveValue={setSaveValue}
        />
      ) : null}

      <BulkImport
        modalOpen={bulkImportModal}
        setModalOpen={setBulkImportModal}
      />
    </DragAndDrop>
  );
}

function Sidebar() {
  const [newTermModal, setNewTermModal] = useState(false);

  return (
    <div className='sidebar'>
      <div className='create-key-term'>
        <Button
          className='mb-3'
          onClick={() => {
            setNewTermModal(true);
          }}
        >
          Create New Term
        </Button>
        {newTermModal === true ? (
          <CreateNewTerm
            modalOpen={newTermModal}
            setModalOpen={setNewTermModal}
          />
        ) : null}
      </div>
      <div className='bulk-insert-container'>
        <div className='drag-n-drop'>
          <BulkUploadDrop />
        </div>
        <div className='terms-template'>
          <a
            href='http://localhost:18500/static/KEYTERM-TEMPLATE.xlsx'
            download
          >
            <FontAwesomeIcon icon={faFileDownload} size='sm' />
            &nbsp;&nbsp; Download Template{' '}
          </a>
          <p>
            Use this Excel template to insert terms and additional meta
            information needed for bulk insert.
          </p>
        </div>
      </div>
      {/* <div className='filter-container'>
        <h4>Filter Terms by Module</h4>
        <ul>
          <li>Module 1</li>
          <li>Module 2</li>
          <li>Module 3</li>
        </ul>
      </div> */}
    </div>
  );
}

export default Sidebar;
