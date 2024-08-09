import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  logError,
} from '@edx/frontend-platform/logging';

import ErrorPage from './ErrorPage';

/**
 * Error boundary component used to log caught errors and display the error page.
 *
 * @memberof module:React
 * @extends {Component}
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(error, { stack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          learningContextId={this.props.learningContextId}
          studioEndpointUrl={this.props.studioEndpointUrl}
        />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  learningContextId: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
};

ErrorBoundary.defaultProps = {
  children: null,
  learningContextId: null,
  studioEndpointUrl: null,
};
