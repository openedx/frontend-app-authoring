import { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { updateQueryPendingStatus } from '../../data/slice';
import AddComponentButton from '../add-component-btn';
import messages from '../messages';
import ModalContainer from './ModalContainer';

const ComponentModalView = ({
  component,
  modalParams,
  handleCreateNewXBlock,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [moduleTitle, setModuleTitle] = useState('');
  const { open, close, isOpen } = modalParams;
  const { type, displayName, templates } = component;

  const handleSubmit = () => {
    handleCreateNewXBlock(type, moduleTitle);
    dispatch(updateQueryPendingStatus(true));
    setModuleTitle('');
  };

  return (
    <>
      <li>
        <AddComponentButton
          onClick={open}
          type={type}
          displayName={displayName}
        />
      </li>
      <ModalContainer
        isOpen={isOpen}
        close={close}
        title={intl.formatMessage(messages.modalContainerTitle, { componentTitle: displayName.toLowerCase() })}
        btnText={intl.formatMessage(messages.modalBtnText)}
        onSubmit={handleSubmit}
        resetDisabled={() => setModuleTitle('')}
        hasValue={!moduleTitle.length}
      >
        <Form.Group>
          <Form.RadioSet
            name={displayName}
            onChange={(e) => setModuleTitle(e.target.value)}
          >
            {templates.map((componentTemplate) => {
              const value = componentTemplate.boilerplateName || componentTemplate.category;

              return (
                <Form.Radio
                  key={componentTemplate.displayName}
                  className="add-component-modal-radio mb-2.5"
                  value={value}
                >
                  {componentTemplate.displayName}
                </Form.Radio>
              );
            })}
          </Form.RadioSet>
        </Form.Group>
      </ModalContainer>
    </>
  );
};

ComponentModalView.propTypes = {
  modalParams: PropTypes.shape({
    open: PropTypes.func,
    close: PropTypes.func,
    isOpen: PropTypes.bool,
  }).isRequired,
  handleCreateNewXBlock: PropTypes.func.isRequired,
  component: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    category: PropTypes.string,
    type: PropTypes.string.isRequired,
    templates: PropTypes.arrayOf(
      PropTypes.shape({
        boilerplateName: PropTypes.string,
        category: PropTypes.string,
        displayName: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
};

export default ComponentModalView;
