import React from 'react';

interface Props {
  children: React.ReactNode;
  title: string;
  actions: React.ReactNode;
}

const FeaturedLayout = ({ children, title, actions }: Props) => (
  <div className="tw-flex tw-flex-col tw-gap-6">
    <div className="tw-flex tw-justify-between tw-items-center">
      <h3 className="tw-font-semibold tw-text-lg tw-text-gray-900 tw-m-0">
        {title}
      </h3>
      <div className="tw-flex tw-gap-2">
        {actions}
      </div>
    </div>
    {children}
  </div>
);

export default FeaturedLayout;
