/* eslint-disable */

import React from 'react';
import { InputText, IconButton, Icon, Hyperlink } from '@edx/paragon';
import { Add, Remove } from '@edx/paragon/icons';
import { string, func, arrayOf, shape, object } from 'prop-types';

class EditKeyTermForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <InputText
          id='keyTerm'
          name='keyTerm'
          label='Key Term'
          value={this.props.keyTerm.key_name}
          // value={key_name}
          readOnly
        />
        <div className='modal-col-left float-left'>
          <h3>Definitions:</h3>
          {this.props.definitionList.map((x, i) => (
            <>
              <InputText
                id='definition'
                name='definition'
                label='Definition'
                value={this.props.definitionList[i].description}
                // initialValue={definitionList[i].description}
                onChange={(input) => {
                  const list = [...this.props.definitionList];
                  list[i].description = input;
                  this.props.setDefinitionList(list);
                  this.props.setSaveValue('default');
                }}
              />
              {this.props.definitionList.length !== 1 && (
                <IconButton
                  src={Remove}
                  iconAs={Icon}
                  size='sm'
                  alt='Remove'
                  variant='light'
                  onClick={() => {
                    const list = [...this.props.definitionList];
                    list.splice(i, 1);
                    this.props.setDefinitionList(list);
                    this.props.setSaveValue('default');
                  }}
                />
              )}

              {this.props.definitionList.length - 1 === i && (
                <IconButton
                  src={Add}
                  iconAs={Icon}
                  size='sm'
                  alt='Add'
                  variant='light'
                  onClick={() => {
                    this.props.setDefinitionList([
                      ...this.props.definitionList,
                      { description: '' },
                    ]);
                    this.props.setSaveValue('default');
                  }}
                />
              )}
            </>
          ))}
        </div>

        <div className='modal-col-right float-right'>
          <h3>Resources:</h3>
          {this.props.resourceList.map((x, i) => (
            <>
              <InputText
                id='resourceLink'
                name='resourceLink'
                label='Resource URL'
                value={this.props.resourceList[i].resource_link}
                // initialValue={definitionList[i].description}
                onChange={(input) => {
                  const list = [...this.props.resourceList];
                  list[i].resource_link = input;
                  this.props.setResourceList(list);
                  this.props.setSaveValue('default');
                }}
              />
              <InputText
                id='friendlyName'
                name='friendlyName'
                label='Resource Title'
                value={this.props.resourceList[i].friendly_name}
                // initialValue={definitionList[i].description}
                onChange={(input) => {
                  const list = [...this.props.resourceList];
                  list[i].friendly_name = input;
                  this.props.setResourceList(list);
                  this.props.setSaveValue('default');
                }}
              />
              <IconButton
                src={Remove}
                iconAs={Icon}
                size='sm'
                alt='Remove'
                variant='light'
                onClick={() => {
                  const list = [...this.props.resourceList];
                  list.splice(i, 1);
                  this.props.setResourceList(list);
                  this.props.setSaveValue('default');
                }}
              />

              {this.props.resourceList.length - 1 === i && (
                <IconButton
                  src={Add}
                  iconAs={Icon}
                  size='sm'
                  alt='Add'
                  variant='light'
                  onClick={() => {
                    this.props.setResourceList([
                      ...this.props.resourceList,
                      { resource_link: '', friendly_name: '' },
                    ]);
                    this.props.setSaveValue('default');
                  }}
                />
              )}
            </>
          ))}
          {this.props.resourceList.length === 0 && (
            <div>
              <Hyperlink
                variant='muted'
                onClick={() => {
                  this.props.setResourceList([
                    ...this.props.resourceList,
                    { resource_link: '', friendly_name: '' },
                  ]);
                  this.props.setSaveValue('default');
                }}
              >
                Add Resource Link
              </Hyperlink>
            </div>
          )}
        </div>
      </div>
    );
  }
}

EditKeyTermForm.defaultProps = {
  keyTerm: {
    key_name: '',
    course_id: '',
    definitions: [],
    textbooks: [],
    resources: [],
    lessons: [],
  },
  definitionList: [],
  setDefinitionList: [],
  resourceList: [],
  setResourceList: [],
  setSaveValue: 'default',
};

EditKeyTermForm.propTypes = {
  keyTerm: shape({
    key_name: string,
    course_id: string,
    definitions: arrayOf(object),
    textbooks: arrayOf(object),
    resources: arrayOf(object),
    lessons: arrayOf(object),
  }),
  definitionList: arrayOf(object),
  setDefinitionList: func,
  resourceList: arrayOf(object),
  setResourceList: func,
  setSaveValue: func,
};

export default EditKeyTermForm;
