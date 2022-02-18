import React from 'react';
import PropTypes from 'prop-types';
import { ModalDialog, ActionRow, Button } from '@edx/paragon';

const ImageUploadModal = ({ isOpen, close }) => (
  <ModalDialog
    title="My dialog"
    isOpen={isOpen}
    onClose={close}
    size="lg"
    variant="default"
    hasCloseButton
    isFullscreenOnMobile
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        Im a dialog box
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      <p>
        Im baby palo santo ugh celiac fashion axe.
        La croix lo-fi venmo whatever.
        Beard man braid migas single-origin coffee forage ramps.
        Tumeric messenger bag bicycle rights wayfarers, try-hard cronut blue bottle health goth.
        Sriracha tumblr cardigan, cloud bread succulents tumeric copper mug marfa semiotics woke next
        level organic roof party +1 try-hard.
      </p>
    </ModalDialog.Body>
    <ModalDialog.Footer>
      <ActionRow>
        <ModalDialog.CloseButton variant="tertiary">
          Cancel
        </ModalDialog.CloseButton>
        <Button variant="primary">
          A button
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </ModalDialog>
);

ImageUploadModal.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
};
ImageUploadModal.defaultProps = {
  isOpen: false,
  close: () => {},
};
export default ImageUploadModal;
