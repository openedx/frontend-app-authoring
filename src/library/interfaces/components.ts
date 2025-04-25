/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TextComponentProps {
  text: string;
  iconName?: React.ReactNode;
  iconPlacement?: 'before' | 'after';
  fontClass?: string;
  className?: string;
}

export interface ButtonComponentProps {
  label: string;
  variant?: 'text' | 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  onClick?: any;
  type?: 'button' | 'submit' | 'reset';
}

export interface AlertComponentProps {
  open: boolean;
  onClose: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  autoHideDuration?: number;
}

export interface Menu {
  label: string;
  subMenu?: { label: string; value: string }[];
}

export interface TemplateData {
  logoUrl?: string;
  menu?: {
    align?: 'right' | 'left' | 'center';
    menuList: Menu[];
    loginSignupButtons?: boolean;
  };
}

export interface MainHeaderProps {
  logoUrl: string;
  menuAlignment: 'right' | 'left' | 'center';
  menuList: { label: string; subMenu?: { label: string; value: string; }[] }[];
  loginSignupButtons: boolean;
}

export interface HeaderMenuProps {
  menu: {
    label: string;
    subMenu?: { label: string; value: string }[];
  };
}

export interface MenuComponentProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  menuItems: { label: string; value: string }[];
  onSelect?: (value: string) => void;
}

type TextAlign = 'right' | 'left' | 'center';

export interface FooterProps {
  contactInfo: {
    align: TextAlign;
    content: {
      shortdesc: string;
      address1: string;
      address2: string;
      pincode: string;
      location: { label: string; value: string };
      phonenumber: string;
      facebook: string;
      instagram: string;
      twitter: string;
      linkedIn: string;
    };
  };
  quickLinks: {
    align: TextAlign;
    content: { label: string; link: string }[];
  };
  exploreLinks: {
    align: TextAlign;
    content: { label: string; link: string }[];
  };
  logoUrl: string;
  copyrights: string;
}
