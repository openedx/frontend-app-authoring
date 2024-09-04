/* istanbul ignore file */
/* eslint-disable import/prefer-default-export */
// This file doesn't need test coverage nor i18n because it's only seen by devs
import React from 'react';
import { LoadingSpinner } from '../../generic/Loading';
import { useXBlockOLX } from '../data/apiHooks';

interface Props {
  usageKey: string;
}

export const ComponentDeveloperInfo: React.FC<Props> = ({ usageKey }) => {
  const { data: olx, isLoading: isOLXLoading } = useXBlockOLX(usageKey);
  return (
    <>
      <hr />
      <h3 className="h5">Developer Component Details</h3>
      <p><small>(This panel is only visible in development builds.)</small></p>
      <dl>
        <dt>Usage key</dt>
        <dd><code>{usageKey}</code></dd>
        <dt>OLX</dt>
        <dd>
          {
            olx ? <code className="micro">{olx}</code> : // eslint-disable-line
            isOLXLoading ? <LoadingSpinner /> : // eslint-disable-line
            <span>Error</span>
          }
        </dd>
      </dl>
    </>
  );
};
