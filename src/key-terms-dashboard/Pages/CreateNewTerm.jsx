/* eslint-disable */

import { Modal, StatefulButton } from '@edx/paragon';
import React, { useState, useContext } from 'react';
import { func, bool } from 'prop-types';

import KeyTermForm from './KeyTermForm';
import { CourseContext } from '../KeyTermsDashboard';
import { getConfig } from '@edx/frontend-platform';

function CreateNewTerm({ modalOpen, setModalOpen }) {
  const { setUpdate } = useContext(CourseContext);
  const [termValue, setTermValue] = useState('');
  const [defValue, setDefValue] = useState('');
  const [saveValue, setSaveValue] = useState('default');
  const [inputError, setInputError] = useState({
    keyTerm: false,
    definition: false,
  });

  const { courseId } = useContext(CourseContext);

  const course = courseId.replaceAll('+', ' ');

  const props = {
    labels: {
      default: 'Save',
      pending: 'Saving',
      complete: 'Saved',
      error: 'Error',
    },
  };

  async function AddKeyTerm() {
    const restUrl = `${process.env.KEYTERMS_API_BASE_URL}/api/v1/key_term/`;

    // if (termValue === '') {
    //     setTermValue(null);
    //     setInputError((prevState) => ({
    //       ...prevState,
    //       KeyTerm: 'Key Term cannot be left blank',
    //     }));
    // }
    // if (defValue === '') {
    //     setDefValue(null);
    // }

    const newTerm = {
      key_name: termValue,
      course_id: course,
      definitions: [{ description: defValue }],
      textbooks: [],
      resources: [],
      lessons: [],
    };

    console.log(newTerm);

    const response = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTerm),
    })
      .then((data) => {
        console.log('Success:', data);
        if (data.status === 200) {
          setSaveValue('complete');
        } else {
          setSaveValue('error');
        }
        setUpdate(data);
      })
      .catch((error) => {
        console.error('Error:', error);
        setSaveValue('error');
      });

    return response;
  }

  return (
    <div>
      <Modal
        open={modalOpen}
        title='Add New Key Term'
        body={
          <KeyTermForm
            setTermValue={setTermValue}
            setDefValue={setDefValue}
            setSaveValue={setSaveValue}
            inputError={inputError}
            setInputError={setInputError}
          />
        }
        onClose={() => {
          setModalOpen(false);
          setSaveValue('default');
        }}
        buttons={[
          <StatefulButton
            // variant='success'
            state={saveValue}
            {...props}
            // data-autofocus
            onClick={async () => {
              if (termValue !== '' || defValue !== '') {
                setSaveValue('pending');
                await AddKeyTerm();
                setModalOpen(false);
              } else {
                if (termValue === '') {
                  setSaveValue('error');
                  setInputError((prevState) => ({
                    ...prevState,
                    keyTerm: true,
                  }));
                }
                if (defValue === '') {
                  setSaveValue('error');
                  setInputError((prevState) => ({
                    ...prevState,
                    definition: true,
                  }));
                  console.log(inputError);
                }
              }
              //   setModalOpen(false);
            }}
          />,
        ]}
      />
    </div>
  );
}

CreateNewTerm.defaultProps = {
  modalOpen: false,
  setModalOpen: false,
};

CreateNewTerm.propTypes = {
  modalOpen: bool,
  setModalOpen: func,
};

export default CreateNewTerm;
