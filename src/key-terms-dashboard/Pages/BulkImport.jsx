/* eslint-disable */

import { Modal, StatefulButton } from '@edx/paragon';
import { bool, func } from 'prop-types';
import React, { useState } from 'react';

import BulkImportForm from './BulkImportForm';

import BulkImportValidator from './BulkImportValidator';

function BulkImport({ modalOpen, setModalOpen }) {
  const [saveValue, setSaveValue] = useState('default');
  const [excelFile, setExcelFile] = useState('');
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [validateModal, setValidateModal] = useState(false);
  const [fileError, setFileError] = useState('');

  const props = {
    labels: {
      default: 'Upload',
      pending: 'Processing',
      complete: 'Sucess',
      error: 'Error',
    },
  };

  return (
    <div>
      <Modal
        open={modalOpen}
        title='Bulk Import Key Terms'
        body={
          <BulkImportForm
            setExcelFile={setExcelFile}
            isFilePicked={isFilePicked}
            setIsFilePicked={setIsFilePicked}
            setFileError={setFileError}
            fileError={fileError}
            setSaveValue={setSaveValue}
          />
        }
        onClose={() => {
          setModalOpen(false);
          setSaveValue('default');
          setFileError('');
        }}
        buttons={[
          <StatefulButton
            // variant='success'
            state={saveValue}
            label='Upload'
            {...props}
            // data-autofocus
            onClick={() => {
              setSaveValue('default');
              setModalOpen(false);
              setValidateModal(true);
              setFileError('');
              //   setModalOpen(false);
            }}
          />,
        ]}
      />

      {validateModal === true ? (
        <BulkImportValidator
          modalOpen={validateModal}
          setModalOpen={setValidateModal}
          excelFile={excelFile}
          saveValue={saveValue}
          setSaveValue={setSaveValue}
        />
      ) : null}
    </div>
  );
}

BulkImport.defaultProps = {
  modalOpen: 'false',
  setModalOpen: 'false',
};

BulkImport.propTypes = {
  modalOpen: bool,
  setModalOpen: func,
};

export default BulkImport;
