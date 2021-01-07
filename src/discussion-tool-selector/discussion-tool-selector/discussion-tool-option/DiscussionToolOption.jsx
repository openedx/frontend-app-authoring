import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckBox, Image, Col } from '@edx/paragon';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export default function DiscussionToolOption({
  forum, selected, onSelect,
}) {
  return (
    <Col className="mb-4" xs={12} sm={6} lg={4} xl={3}>
      <div
        className="d-flex discussion-tool flex-column p-3 h-100 shadow border border-white"
        style={{
          cursor: 'pointer',
        }}
        tabIndex={forum.isAvailable ? '-1' : ''}
        onClick={() => { if (forum.isAvailable) { onSelect(forum.forumId); } }}
        onKeyPress={() => { if (forum.isAvailable) { onSelect(forum.forumId); } }}
        role="radio"
        aria-checked={selected}
      >
        <div className="d-flex flex-row justify-content-between">
          <div className="d-flex justify-content-center">
            <Image height={100} src={forum.logo} alt="Logo" />
          </div>
          <div className="d-flex">
            {forum.isAvailable ? (
              <CheckBox checked={selected} />
            ) : (
              <FontAwesomeIcon icon={faLock} />
            )}
          </div>
        </div>
        <br />
        <div className="py-4">{forum.description}</div>
        <br />
        <div className="mt-auto font-weight-bold">{forum.supportLevel}</div>
      </div>
    </Col>
  );
}

DiscussionToolOption.propTypes = {
  forum: PropTypes.objectOf(PropTypes.any).isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};
