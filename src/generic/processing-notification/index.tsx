import {
  Icon, Toast,
} from '@openedx/paragon';
import { Settings as IconSettings } from '@openedx/paragon/icons';
import classNames from 'classnames';

export interface ProcessingNotificationProps {
  isShow: boolean;
  title: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  close?: () => void;
}

const ProcessingNotification = ({
  isShow, title, action, close,
}: ProcessingNotificationProps) => (
  // @ts-ignore - Toast has a poor definition of children
  <Toast
    className={classNames({ 'processing-notification-hide-close-button': !close })}
    show={isShow}
    aria-hidden={isShow}
    action={action && { ...action }}
    onClose={close || (() => {})}
  >
    { /* @ts-ignore - Toast has a poor definition of children */ }
    <span className="d-flex align-items-center">
      <Icon className="processing-notification-icon mb-0 mr-2" src={IconSettings} />
      <span className="font-weight-bold h4 mb-0 text-white">{title}</span>
    </span>
  </Toast>
);

export default ProcessingNotification;
