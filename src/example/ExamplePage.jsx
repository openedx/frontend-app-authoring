import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

export default function ExamplePage() {
  return (
    <main>
      <div className="container-fluid">
        <h1>Example Page</h1>
        <p>
          <FormattedMessage
            id="authoring.example.hello"
            defaultMessage="Hello World!"
          />
        </p>
      </div>
    </main>
  );
}
