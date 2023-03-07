/* eslint-disable */

import {
  ModalDialog,
  ActionRow,
  Collapsible,
  StatefulButton,
  Form,
  Icon,
} from '@edx/paragon';
import React, { useState, useEffect, useContext } from 'react';

import readXlsxFile from 'read-excel-file';

import { ExpandLess, ExpandMore } from '@edx/paragon/icons';
import {
  bool,
  func,
  string,
  arrayOf,
  shape,
  object,
  instanceOf,
} from 'prop-types';
import { CourseContext } from '../KeyTermsDashboard';
import { getConfig } from '@edx/frontend-platform';

function ImportedData({ keyTerm }) {
  const { key_name, definitions, resources } = keyTerm;

  return (
    <div>
      <h3>{key_name}</h3>
      <p>
        <ul>
          {definitions.map((descr) => (
            <li>{descr.description}</li>
          ))}
        </ul>

        <b>Resources:</b>
        <ul>
          {resources.map((resource) => (
            <li>
              {resource.friendly_name} -- {resource.resource_link}
            </li>
          ))}
        </ul>
      </p>

      <hr />
    </div>
  );
}

function ModifiedData({ keyTerm, termData }) {
  const { key_name, definitions, resources } = keyTerm;

  const TermToBeModified = termData.find((term) => term.key_name === key_name);
  const oldDefinitions = TermToBeModified.definitions;
  const oldResources = TermToBeModified.resources;

  console.log(keyTerm);

  return (
    <div>
      <h3>{key_name}</h3>
      <div className='flex-row'>
        <div className='modal-col-left flex-row'>
          <p>
            <b>Imported Definitions:</b>
            <ul>
              {definitions.map((descr) => (
                <li>
                  {descr.flagged === true ? (
                    <mark>{descr.description}</mark>
                  ) : (
                    descr.description
                  )}
                </li>
              ))}
            </ul>
          </p>
        </div>
        <div className='modal-col-right flex-row'>
          <p>
            <b>Existing Definitions:</b>
            <ul>
              {oldDefinitions.map((descr) => (
                <li>{descr.description}</li>
              ))}
            </ul>
          </p>
        </div>
      </div>
      <div className='flex-row'>
        <div className='modal-col-left flex-row'>
          <p>
            <b>Imported Resources:</b>
            <ul>
              {resources.map((resource) => (
                <li>
                  {resource.flagged === true ? (
                    <mark>
                      {resource.friendly_name} -- {resource.resource_link}
                    </mark>
                  ) : (
                    <>
                      {resource.friendly_name} -- {resource.resource_link}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </p>
        </div>
        <div className='modal-col-right flex-row'>
          <p>
            <b>Existing Resources:</b>
            <ul>
              {oldResources.map((resource) => (
                <li>
                  {resource.friendly_name} -- {resource.resource_link}
                </li>
              ))}
            </ul>
          </p>
        </div>
      </div>
      <hr />
    </div>
  );
}

function TermsToBeRemoved({ fileData, termData }) {
  const removeTermData = [...termData];
  for (let i = 0; i < fileData.length; i++) {
    for (let j = 0; j < removeTermData.length; j++) {
      if (fileData[i].key_name === removeTermData[j].key_name) {
        removeTermData.splice(j, 1);
      }
    }
  }

  return (
    <Collapsible
      title={`Terms to be Removed (${removeTermData.length})`}
      defaultOpen
      iconWhenOpen={<Icon src={ExpandLess} />}
      iconWhenClosed={<Icon src={ExpandMore} />}
    >
      {removeTermData.length === 0 ? (
        <p>No Terms To Remove</p>
      ) : (
        removeTermData
          .sort((a, b) => {
            if (a.key_name < b.key_name) {
              return -1;
            }
            if (a.key_name > b.key_name) {
              return 1;
            }
            return 0;
          })
          .map((keyTerm) => (
            <ImportedData
              key={keyTerm.id}
              keyTerm={keyTerm}
              termData={termData}
            />
          ))
      )}
    </Collapsible>
  );
}

function ViewAllChanges({ fileData, termData }) {
  const modifiedTerms = [];

  for (let i = 0; i < fileData.length; i++) {
    for (let e = 0; e < termData.length; e++) {
      if (fileData[i].key_name === termData[e].key_name) {
        const flagTermEdit = fileData[i];
        // flag definition edits
        if (flagTermEdit.definitions.length > termData[e].definitions.length) {
          for (
            var k = termData[e].definitions.length;
            k < flagTermEdit.definitions.length;
            k++
          ) {
            flagTermEdit.definitions[k].flagged = true;
          }
          flagTermEdit.flagged = true;
        } else if (
          flagTermEdit.definitions.length < termData[e].definitions.length
        ) {
          flagTermEdit.flagged = true;
        } else {
          for (let j = 0; j < flagTermEdit.definitions.length; j++) {
            if (
              flagTermEdit.definitions[j].description !==
              termData[e].definitions[j].description
            ) {
              // assumes definitions will always be in the same order.
              flagTermEdit.definitions[j].flagged = true;
              flagTermEdit.flagged = true;
            }
          }
        }

        // flag resource edits
        if (flagTermEdit.resources.length > termData[e].resources.length) {
          for (
            let k = termData[e].resources.length;
            k < flagTermEdit.resources.length;
            k++
          ) {
            flagTermEdit.resources[k].flagged = true;
          }
          flagTermEdit.flagged = true;
        } else if (
          flagTermEdit.resources.length < termData[e].resources.length
        ) {
          flagTermEdit.flagged = true;
        } else if (flagTermEdit.resources.length !== 0) {
          for (let h = 0; h < flagTermEdit.resources.length; h++) {
            if (
              flagTermEdit.resources[h].resource_link
                !== termData[e].resources[h].resource_link
              || flagTermEdit.resources[h].friendly_name
                !== termData[e].resources[h].friendly_name
            ) {
              // assumes resources will always be in the same order.
              flagTermEdit.resources[h].flagged = true;
              flagTermEdit.flagged = true;
            }
          }
        }

        if (flagTermEdit.flagged === true) {
          modifiedTerms.push(flagTermEdit);
        }

        break;
      }
    }
  }

  return (
    <Collapsible
      title={`View All Changes (${modifiedTerms.length})`}
      defaultOpen
      iconWhenOpen={<Icon src={ExpandLess} />}
      iconWhenClosed={<Icon src={ExpandMore} />}
    >
      {modifiedTerms.length === 0 ? (
        <p>No Changes to Existing Terms</p>
      ) : (
        modifiedTerms
          .sort((a, b) => {
            if (a.key_name < b.key_name) {
              return -1;
            }
            if (a.key_name > b.key_name) {
              return 1;
            }
            return 0;
          })
          .map((keyTerm) => (
            <ModifiedData
              key={keyTerm.id}
              keyTerm={keyTerm}
              termData={termData}
            />
          ))
      )}
    </Collapsible>
  );
}

function BulkImportValidator({
  modalOpen,
  setModalOpen,
  excelFile,
  saveValue,
  setSaveValue,
}) {
  const [fileData, setFileData] = useState([]);
  const [overrideAllTerms, setOverrideAllTerms] = useState(false);
  const [mergeAllTerms, setMergeAllTerms] = useState(false);
  const [disableCheckbox, setDisableCheckbox] = useState({
    override: false,
    mergeAll: false,
  });

  const { courseId, termData, setUpdate } = useContext(CourseContext);

  const props = {
    labels: {
      default: 'Save',
      pending: 'Saving',
      complete: 'Saved',
      error: 'Error',
    },
  };

  async function RemoveOldTerms() {
    const termPayload = {
      terms_payload: termData,
    };

    const restUrl = `${process.env.KEYTERMS_API_BASE_URL}/api/v1/bulk_key_term_import/`;
    const response = await fetch(restUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(termPayload),
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

    console.log('TERMS DELETED:');
    console.log(termPayload);
    console.log(response);
  }

  async function SubmitNewTerms() {
    console.log(overrideAllTerms);

    const submittedData = [...fileData];

    if (overrideAllTerms) {
      await RemoveOldTerms();
    }

    const termPayload = {
      terms_payload: submittedData,
    };

    const restUrl = `${process.env.KEYTERMS_API_BASE_URL}/api/v1/bulk_key_term_import/`;
    const response = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(termPayload),
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
    const strJSON = JSON.stringify(termPayload);

    console.log('TERMS UPLOADED:');
    console.log(strJSON);
    setSaveValue('complete');

    return response;
  }

  const map = {
    'KEY TERM': 'key_name',
    'REFERENCE LINK AND TITLE': 'resources',
    DEFINITIONS: {
      definitions: {
        DEFINITION: 'description',
      },
    },
  };

  useEffect(() => {
    const reader = new FileReader();
    const course = courseId.replaceAll('+', ' ');

    reader.readAsText(excelFile);

    readXlsxFile(excelFile, { map }).then(({ rows }) => {
      const newData = [];

      for (let i = 0; i < rows.length; i++) {
        const newRow = rows[i];
        const definitionList = [];
        const resourceList = [];
        const definitions = newRow.definitions.description.split('][');

        definitions.map((descr) => {
          let newdescription = descr;
          newdescription = newdescription.replaceAll('[', '');
          newdescription = newdescription.replaceAll(']', '');
          return definitionList.push({ description: newdescription });
        });

        if (newRow.resources) {
          const resources = newRow.resources.split('][');

          resources.map((resource) => {
            let newresource = resource;
            newresource = newresource.replaceAll('[', '');
            newresource = newresource.replaceAll(']', '');
            const resourceData = newresource.split(';');

            return resourceList.push({
              resource_link: resourceData[0],
              friendly_name: resourceData[1],
            });
          });
        }

        newRow['course_id'] = course;
        newRow['definitions'] = definitionList;
        newRow['resources'] = resourceList;
        newRow['textbooks'] = [];
        newRow['lessons'] = [];
        newData.push(newRow);
      }

      console.log(newData);
      setFileData(newData);
    });
  }, []);

  return (
    <div>
      <ModalDialog
        isOpen={modalOpen}
        title='Bulk Import Key Terms'
        size='xl'
        hasCloseButton={!modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSaveValue('default');
        }}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            <h2>Confirm Bulk Import</h2>
          </ModalDialog.Title>
          <ActionRow>
            <b>
              {fileData.length} Terms Imported from {excelFile.name}
            </b>
            <ActionRow.Spacer />
          </ActionRow>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <ViewAllChanges fileData={fileData} termData={termData} />

          {overrideAllTerms ? (
            <TermsToBeRemoved fileData={fileData} termData={termData} />
          ) : null}

          <Collapsible
            title={`View All Imported Terms (${fileData.length})`}
            iconWhenOpen={<Icon src={ExpandLess} />}
            iconWhenClosed={<Icon src={ExpandMore} />}
          >
            {fileData
              .sort((a, b) => {
                if (a.key_name < b.key_name) {
                  return -1;
                }
                if (a.key_name > b.key_name) {
                  return 1;
                }
                return 0;
              })
              .map((keyTerm) => (
                <ImportedData key={keyTerm.id} keyTerm={keyTerm} />
              ))}
          </Collapsible>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <ActionRow>
            <Form>
              <Form.Row>
                <Form.Group controlId='keepAllCheckboxes'>
                  <Form.Check
                    type='checkbox'
                    id='overrideAllTerms'
                    label='Override All'
                    disabled={disableCheckbox.override}
                    onChange={() => {
                      setOverrideAllTerms(!overrideAllTerms);
                      setDisableCheckbox({
                        mergeAll: !disableCheckbox.mergeAll,
                      });
                    }}
                  />
                  <p className='action-row'>
                    <i>
                      Will remove {termData.length > fileData.length ? termData.length - fileData.length : 0} existing
                      terms <br />
                      that do not appear in {excelFile.name}
                    </i>
                  </p>
                </Form.Group>
                <Form.Group controlId='keepAllCheckboxes'>
                  <Form.Check
                    type='checkbox'
                    id='mergeAllTerms'
                    label='Merge All'
                    disabled={disableCheckbox.mergeAll}
                    onChange={() => {
                      setMergeAllTerms(!mergeAllTerms);
                      setDisableCheckbox({
                        override: !disableCheckbox.override,
                      });
                    }}
                  />
                  <p className='action-row'>
                    <i>
                      Save all changes and keep any existing terms <br />
                      that do not appear in {excelFile.name}
                    </i>
                  </p>
                </Form.Group>
              </Form.Row>
            </Form>
            <ActionRow.Spacer />
            <ModalDialog.CloseButton variant='tertiary'>
              Cancel
            </ModalDialog.CloseButton>
            <StatefulButton
              state={saveValue}
              {...props}
              onClick={async () => {
                setSaveValue('pending');
                await SubmitNewTerms();
                setModalOpen(false);
                setSaveValue('default');
              }}
            >
              Save Changes
            </StatefulButton>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </div>
  );
}

BulkImportValidator.defaultProps = {
  keyTerm: {
    key_name: '',
    course_id: '',
    definitions: [],
    textbooks: [],
    resources: [],
    lessons: [],
  },
  fileData: [],
  termData: [],
  saveValue: 'default',
  setSaveValue: 'default',
  modalOpen: false,
  setModalOpen: false,
  excelFile: null,
};

BulkImportValidator.propTypes = {
  keyTerm: shape({
    key_name: string,
    course_id: string,
    definitions: arrayOf(object),
    textbooks: arrayOf(object),
    resources: arrayOf(object),
    lessons: arrayOf(object),
  }),
  fileData: arrayOf(
    shape({
      key_name: string,
      course_id: string,
      definitions: arrayOf(object),
      textbooks: arrayOf(object),
      resources: arrayOf(object),
      lessons: arrayOf(object),
    })
  ),
  termData: arrayOf(
    shape({
      key_name: string,
      course_id: string,
      definitions: arrayOf(object),
      textbooks: arrayOf(object),
      resources: arrayOf(object),
      lessons: arrayOf(object),
    })
  ),
  saveValue: string,
  setSaveValue: func,
  modalOpen: bool,
  setModalOpen: func,
  excelFile: instanceOf(File),
};

export default BulkImportValidator;
