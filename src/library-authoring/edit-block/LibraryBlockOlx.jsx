import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { fetchable } from '../common';

/**
 * Display the OLX source of an XBlock.
 *
 * When in "edit mode", the OLX is editable.
 */
class LibraryBlockOlx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      olx: '',
      isEditing: false,
    };
  }

  saveOlx = () => {
    this.props.onSaveOlx(this.state.olx);
  }

  showEditMode = () => {
    this.setState({
      isEditing: true,
      olx: this.props.olx.value,
    });
  }

  cancelEditMode = () => {
    this.setState({
      isEditing: false,
      olx: this.props.olx.value,
    });
  }

  updateOlx = (event) => {
    this.setState({
      olx: event.target.value,
    });
  }

  render() {
    if (this.state.isEditing) {
      return (
        <>
          <textarea
            value={this.state.olx}
            onChange={this.updateOlx}
            style={{
              display: 'block', fontFamily: 'monospace', width: '100%', height: '400px',
            }}
          />
          <br />
          <Button variant="outline-secondary" onClick={this.cancelEditMode}>Cancel</Button>
          <Button variant="primary" onClick={this.saveOlx}>Save Changes</Button>
        </>
      );
    }
    return (
      <>
        <pre>{this.props.olx.value}</pre><br />
        <Button variant="outline-secondary" onClick={this.showEditMode}>Edit OLX</Button>
      </>
    );
  }
}

LibraryBlockOlx.propTypes = {
  olx: fetchable(PropTypes.string).isRequired,
  onSaveOlx: PropTypes.func.isRequired,
};

export default LibraryBlockOlx;
