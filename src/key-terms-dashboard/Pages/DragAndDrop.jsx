/* eslint-disable */

import React from 'react';
import { instanceOf, node } from 'prop-types';

class DragAndDrop extends React.Component {
  dropRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = { drag: false };
  }

  componentDidMount() {
    this.dragCounter = 0;
    const div = this.dropRef.current;
    div.addEventListener('dragenter', this.handleDragIn);
    div.addEventListener('dragleave', this.handleDragOut);
    div.addEventListener('dragover', this.handleDrag);
    div.addEventListener('drop', this.handleDrop);
  }

  componentWillUnmount() {
    const div = this.dropRef.current;
    div.removeEventListener('dragenter', this.handleDragIn);
    div.removeEventListener('dragleave', this.handleDragOut);
    div.removeEventListener('dragover', this.handleDrag);
    div.removeEventListener('drop', this.handleDrop);
  }

  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter++;

    // if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
    this.setState({ drag: true });
    console.log(this.state);
    console.log(e.dataTransfer);
    // }
  };

  handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter--;

    if (this.dragCounter > 0) {
      return;
    }
    this.setState({ drag: false });
    console.log(this.state);
  };

  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ drag: false });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.props.handleDrop(e.dataTransfer.files);
      console.log(e.dataTransfer, e.dataTransfer.files);
      e.dataTransfer.clearData();
      this.dragCounter = 0;
    }
  };

  render() {
    return (
      <div
        style={{
          display: 'inline-block',
          position: 'relative',
          border: 'dashed grey 1px',
          width: '85%',
        }}
        ref={this.dropRef}
      >
        {this.state.drag && (
          <div
            style={{
              // border: 'dashed grey 4px',
              backgroundColor: 'rgba(255,255,255,.8)',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
            }}
          >
            {/* <div
              style={{
                position: 'absolute',
                top: '50%',
                right: 0,
                left: 0,
                textAlign: 'center',
                color: 'grey',
                fontSize: 36,
              }}
            >
            </div> */}
          </div>
        )}
        {this.props.children}
      </div>
    );
  }
}

DragAndDrop.defaultProps = {
  children: null,
  handleDrop: null,
};

DragAndDrop.propTypes = {
  children: node,
  handleDrop: instanceOf(File),
};

export default DragAndDrop;
