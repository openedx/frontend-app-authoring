import React from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import {
  Card, Form, Col, Button,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import CourseUploadImage from '../../../generic/course-upload-image';
import messages from './messages';

const InstructorContainer = ({
  instructor, idx, onDelete, onChange,
}) => {
  const intl = useIntl();
  return (
    <Card className="p-3.5" key={idx}>
      <Card.Body>
        <Form>
          <Form.Row>
            <Form.Group as={Col} className="form-group-custom">
              <Form.Label>
                {intl.formatMessage(messages.instructorNameLabel)}
              </Form.Label>
              <Form.Control
                value={instructor?.name}
                placeholder={intl.formatMessage(messages.instructorNameInputPlaceholder)}
                onChange={(e) => onChange(e.target.value, idx, 'name')}
              />
              <Form.Text>
                {intl.formatMessage(messages.instructorNameHelpText)}
              </Form.Text>
            </Form.Group>

            <Form.Group as={Col} className="form-group-custom">
              <Form.Label>
                {intl.formatMessage(messages.instructorTitleLabel)}
              </Form.Label>
              <Form.Control
                value={instructor?.title}
                placeholder={intl.formatMessage(messages.instructorTitleInputPlaceholder)}
                onChange={(e) => onChange(e.target.value, idx, 'title')}
              />
              <Form.Text>
                {intl.formatMessage(messages.instructorTitleHelpText)}
              </Form.Text>
            </Form.Group>

            <Form.Group as={Col} className="form-group-custom">
              <Form.Label>
                {intl.formatMessage(messages.instructorOrganizationLabel)}
              </Form.Label>
              <Form.Control
                value={instructor?.organization}
                placeholder={intl.formatMessage(messages.instructorOrganizationInputPlaceholder)}
                onChange={(e) => onChange(e.target.value, idx, 'organization')}
              />
              <Form.Text>
                {intl.formatMessage(messages.instructorOrganizationHelpText)}
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} className="form-group-custom">
              <Form.Label>
                {intl.formatMessage(messages.instructorBioLabel)}
              </Form.Label>
              <Form.Control
                as={TextareaAutosize}
                value={instructor?.bio}
                placeholder={intl.formatMessage(messages.instructorBioInputPlaceholder)}
                onChange={(e) => onChange(e.target.value, idx, 'bio')}
              />
              <Form.Text>
                {intl.formatMessage(messages.instructorBioHelpText)}
              </Form.Text>
            </Form.Group>
          </Form.Row>
          <Form.Row className="pl-1 pr-2.5">
            <CourseUploadImage
              label={intl.formatMessage(messages.instructorPhotoLabel)}
              assetImagePath={instructor?.image}
              assetImageField="image"
              customInputPlaceholder={intl.formatMessage(
                messages.instructorPhotoInputPlaceholder,
              )}
              customHelpText={intl.formatMessage(messages.instructorPhotoHelpText)}
              onChange={(value, field) => onChange(value, idx, field)}
            />
          </Form.Row>
        </Form>
      </Card.Body>
      <Card.Divider />
      <Card.Footer className="p-0 mt-2.5">
        <Button variant="outline-primary" onClick={() => onDelete(idx)}>
          {intl.formatMessage(messages.instructorDelete)}
        </Button>
      </Card.Footer>
    </Card>
  );
};

InstructorContainer.defaultProps = {
  instructor: {},
};

InstructorContainer.propTypes = {
  instructor: PropTypes.shape({
    bio: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string,
    organization: PropTypes.string,
    title: PropTypes.string,
  }),
  idx: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InstructorContainer;
