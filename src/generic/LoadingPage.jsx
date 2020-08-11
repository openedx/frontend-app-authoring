import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class LoadingPage extends Component {
  renderLoadingMessage() {
    if (!this.props.loadingMessage) {
      return null;
    }

    return (
      <span className="sr-only">
        {this.props.loadingMessage}
      </span>
    );
  }

  render() {
    return (
      <div>
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{
            height: '50vh',
          }}
        >
          <div className="spinner-border text-primary" role="status">
            {this.renderLoadingMessage()}
          </div>
        </div>
      </div>
    );
  }
}

LoadingPage.propTypes = {
  loadingMessage: PropTypes.string.isRequired,
};
