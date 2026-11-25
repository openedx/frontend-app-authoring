import {
  Icon,
  Toast,
} from '@openedx/paragon';
import { Settings as IconSettings } from '@openedx/paragon/icons';
import classNames from 'classnames';

export interface ToastNotificationProps {
  isShow: boolean;
  title: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  close?: () => void;
  delay?: number;
  /** The toast icon. Defaults to a spinning gear. */
  icon?: React.ComponentProps<typeof Icon>['src'];
}

const ToastNotification = ({
  isShow,
  title,
  action,
  close,
  delay = 5000,
  icon,
}: ToastNotificationProps) => (
  // @ts-ignore - Toast has a poor definition of children
  <Toast
    className={classNames({ 'toast-notification-hide-close-button': !close })}
    show={isShow}
    aria-hidden={isShow}
    action={action && { ...action }}
    onClose={close || (() => {})}
    delay={delay}
  >
    {/* @ts-ignore - Toast has a poor definition of children */}
    <span className="d-flex align-items-center">
      <Icon
        className={classNames('mb-0 mr-2', { 'toast-notification-spinner': !icon })}
        src={icon ?? IconSettings}
      />
      <span className="font-weight-bold h4 mb-0 text-white">{title}</span>
    </span>
  </Toast>
);

export default ToastNotification;
