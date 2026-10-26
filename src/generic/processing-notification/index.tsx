import {
  Icon,
  Toast,
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
  delay?: number;
  icon?: React.ComponentProps<typeof Icon>['src'];
}

const ProcessingNotification = ({
  isShow,
  title,
  action,
  close,
  delay = 5000,
  icon,
}: ProcessingNotificationProps) => (
  // @ts-ignore - Toast has a poor definition of children
  <Toast
    className={classNames({ 'processing-notification-hide-close-button': !close })}
    show={isShow}
    aria-hidden={isShow}
    action={action && { ...action }}
    onClose={close || (() => {})}
    delay={delay}
  >
    {/* @ts-ignore - Toast has a poor definition of children */}
    <span className="d-flex align-items-center">
      <Icon
        className={classNames('mb-0 mr-2', { 'processing-notification-icon': !icon })}
        src={icon ?? IconSettings}
      />
      <span className="font-weight-bold h4 mb-0 text-white">{title}</span>
    </span>
  </Toast>
);

export default ProcessingNotification;
