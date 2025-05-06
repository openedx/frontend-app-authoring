import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button,
  ButtonGroup,
  Container,
  Stack,
  Form,
} from '@openedx/paragon';
import messages from './messages';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useContainer, useUpdateContainer } from '../data/apiHooks';
import Loading from '../../generic/Loading';
import { ToastContext } from '../../generic/toast-context';

const UnitSettings = () => {
  const intl = useIntl();

  const {
    unitId,
    readOnly,
  } = useLibraryContext();

  // istanbul ignore if: this should never happen
  if (!unitId) {
    throw new Error('unitId is required');
  }

  const [isCheckedDiscussion, setCheckedDiscussion] = useState(false);
  const [isHideForLearners, setHideForLearners] = useState(false);
  const { data: container } = useContainer(unitId);
  const updateMutation = useUpdateContainer(unitId);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    if (!container) {
      return;
    }
    setCheckedDiscussion(container.enableDiscussion);
    setHideForLearners(container.hideFromLearners);
  }, [container]);

  const onClickDiscussionCheck = useCallback((event) => {
    const value: boolean = event.target.checked;
    setCheckedDiscussion(value);
    updateMutation.mutateAsync({
      metadata: {
        enableDiscussion: value,
      },
    }).then(() => {
      showToast(intl.formatMessage(messages.updateContainerSuccessMsg));
    }).catch(() => {
      showToast(intl.formatMessage(messages.updateContainerErrorMsg));
      setCheckedDiscussion(!value);
    });
  }, []);

  const onHandleVisibility = useCallback((value: boolean) => {
    if (container?.hideFromLearners === value) {
      return;
    }

    setHideForLearners(value);
    updateMutation.mutateAsync({
      metadata: {
        hideFromLearners: value,
      },
    }).then(() => {
      showToast(intl.formatMessage(messages.updateContainerSuccessMsg));
    }).catch(() => {
      showToast(intl.formatMessage(messages.updateContainerErrorMsg));
      setHideForLearners(!value);
    });
  }, [container]);

  if (!container) {
    return <Loading />;
  }

  return (
    <Stack>
      <Container>
        <h3 className="h5 mb-3">
          <FormattedMessage {...messages.unitVisibilityTitle} />
        </h3>
        <ButtonGroup toggle>
          <Button
            variant={isHideForLearners ? 'outline-primary' : 'primary'}
            disabled={readOnly}
            onClick={() => onHandleVisibility(false)}
          >
            <FormattedMessage {...messages.unitVisibilityStudentLabel} />
          </Button>
          <Button
            variant={isHideForLearners ? 'primary' : 'outline-primary'}
            disabled={readOnly}
            onClick={() => onHandleVisibility(true)}
          >
            <FormattedMessage {...messages.unitVisibilityStaffLabel} />
          </Button>
        </ButtonGroup>
      </Container>
      <hr className="w-100" />
      <Container>
        <h3 className="h5 mb-3">
          <FormattedMessage {...messages.unitDiscussionTitle} />
        </h3>
        <Form.Checkbox
          checked={isCheckedDiscussion}
          description={intl.formatMessage(messages.unitEnableDiscussionDescription)}
          disabled={readOnly}
          onChange={onClickDiscussionCheck}
        >
          <FormattedMessage {...messages.unitEnableDiscussionLabel} />
        </Form.Checkbox>
      </Container>
    </Stack>
  );
};

export default UnitSettings;
