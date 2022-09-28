import React from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Form,
  IconButton,
  Icon,
  OverlayTrigger,
  Tooltip,
  Button,
} from '@edx/paragon';
import { Delete, Info, Add } from '@edx/paragon/icons';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';

import * as widgetHooks from '../hooks';
import * as module from './hooks';
import messages from './messages';
import { actions } from '../../../../../../data/redux';

import CollapsibleFormWidget from '../CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling video source as well as fallback sources
 */
export const VideoSourceWidget = ({
  // error,
  // injected
  intl,
  // redux
  updateField,
}) => {
  const dispatch = useDispatch();
  const {
    videoSource: source,
    fallbackVideos,
    allowVideoDownloads: allowDownload,
  } = widgetHooks.widgetValues({
    dispatch,
    fields: {
      [widgetHooks.selectorKeys.videoSource]: widgetHooks.genericWidget,
      [widgetHooks.selectorKeys.fallbackVideos]: widgetHooks.arrayWidget,
      [widgetHooks.selectorKeys.allowVideoDownloads]: widgetHooks.genericWidget,
    },
  });
  const deleteFallbackVideo = module.deleteFallbackVideo({ fallbackVideos: fallbackVideos.formValue, dispatch });

  return (
    <CollapsibleFormWidget
      title={intl.formatMessage(messages.titleLabel)}
    >
      <Form.Group>
        <div className="border-primary-100 border-bottom pb-4">
          <Form.Control
            floatingLabel={intl.formatMessage(messages.videoIdOrUrlLabel)}
            onChange={source.onChange}
            onBlur={source.onBlur}
            value={source.local}
          />
        </div>
        <Form.Label className="mt-3">
          <FormattedMessage {...messages.fallbackVideoTitle} />
        </Form.Label>
        <Form.Text>
          <FormattedMessage {...messages.fallbackVideoMessage} />
        </Form.Text>
        {fallbackVideos.formValue.map((videoUrl, index) => (
          <Form.Row className="mt-4.5">
            <Form.Control
              floatingLabel={intl.formatMessage(messages.fallbackVideoLabel)}
              onChange={fallbackVideos.onChange(index)}
              value={fallbackVideos.local[index]}
              onBlur={fallbackVideos.onBlur(index)}
            />
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={(
                <Tooltip>
                  <FormattedMessage {...messages.deleteFallbackVideo} />
                </Tooltip>
              )}
            >
              <IconButton
                className="d-inline-block"
                iconAs={Icon}
                src={Delete}
                onClick={() => deleteFallbackVideo(videoUrl)}
              />
            </OverlayTrigger>
          </Form.Row>
        ))}
        <Form.Row className="mt-4">
          <Form.Checkbox
            checked={allowDownload.local}
            className="decorative-control-label"
            onChange={allowDownload.onCheckedChange}
          >
            <Form.Label>
              <FormattedMessage {...messages.allowDownloadCheckboxLabel} />
            </Form.Label>
          </Form.Checkbox>
          <OverlayTrigger
            key="top"
            placement="top"
            overlay={(
              <Tooltip>
                <FormattedMessage {...messages.tooltipMessage} />
              </Tooltip>
            )}
          >
            <Icon className="d-inline-block mx-3" src={Info} />
          </OverlayTrigger>
        </Form.Row>
      </Form.Group>
      <Button
        iconBefore={Add}
        variant="link"
        onClick={() => updateField({ fallbackVideos: [...fallbackVideos.formValue, ''] })}
      >
        <FormattedMessage {...messages.addButtonLabel} />
      </Button>
    </CollapsibleFormWidget>
  );
};
VideoSourceWidget.defaultProps = {
  // error: {},
};
VideoSourceWidget.propTypes = {
  // error: PropTypes.node,
  // injected
  intl: intlShape.isRequired,
  // redux
  updateField: PropTypes.func.isRequired,
};
export const mapStateToProps = () => ({});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(VideoSourceWidget));
