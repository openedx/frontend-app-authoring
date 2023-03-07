/* eslint-disable */

import { ModalDialog, StatefulButton, ActionRow } from '@edx/paragon';
import React, { useContext, useState } from 'react';
import { func, bool, string } from 'prop-types';

import EditKeyTermForm from './EditKeyTermForm';

import { KeyTermContext, CourseContext } from '../KeyTermsDashboard';
import { getConfig } from '@edx/frontend-platform';

function EditKeyTerm({ modalOpen, setModalOpen, courseId }) {
  const { key_name, definitions, resources } = useContext(KeyTermContext);
  const { setUpdate } = useContext(CourseContext);
  const keyTerm = useContext(KeyTermContext);
  const [saveValue, setSaveValue] = useState('default');
  const [definitionList, setDefinitionList] = useState(definitions);
  const [resourceList, setResourceList] = useState(resources);

  const course = courseId.replaceAll('+', ' ');

  const props = {
    labels: {
      default: 'Save',
      pending: 'Saving',
      complete: 'Saved',
      error: 'Error',
    },
  };

  async function EditTerm() {
    const restUrl = `${process.env.KEYTERMS_API_BASE_URL}/api/v1/key_term/`;
    const editTerm = {
      key_name: key_name,
      course_id: course,
      definitions: definitionList,
      textbooks: [],
      lessons: [],
      resources: resourceList,
    };

    console.log(resourceList);
    console.log(editTerm);

    const response = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editTerm),
    })
      .then((data) => {
        console.log('Success:', data);
        console.log(JSON.stringify(editTerm));
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
    <>
      <ModalDialog
        title='Edit Key Term'
        isOpen={modalOpen}
        size='xl'
        variant='default'
        hasCloseButton={!modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSaveValue('default');
        }}
        isFullscreenOnMobile
      >
        <ModalDialog.Header>
          <ModalDialog.Title>Edit Key Term</ModalDialog.Title>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <EditKeyTermForm
            definitionList={definitionList}
            setDefinitionList={setDefinitionList}
            resourceList={resourceList}
            setResourceList={setResourceList}
            setSaveValue={setSaveValue}
            keyTerm={keyTerm}
          />
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant='tertiary'>
              Cancel
            </ModalDialog.CloseButton>
            <StatefulButton
              // variant='success'
              state={saveValue}
              {...props}
              // data-autofocus
              onClick={async () => {
                setSaveValue('pending');
                await EditTerm();
                setModalOpen(false);
              }}
            />
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
}

EditKeyTerm.defaultProps = {
  modalOpen: false,
  setModalOpen: false,
  courseId: '',
};

EditKeyTerm.propTypes = {
  modalOpen: bool,
  setModalOpen: func,
  courseId: string,
};

export default EditKeyTerm;
