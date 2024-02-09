import React, { useEffect } from 'react';

import { Form } from '@openedx/paragon';
// eslint-disable-next-line
import { EditorPage } from '@edx/frontend-lib-content-components';
// eslint-disable-next-line
import { blockTypes } from '@edx/frontend-lib-content-components/editors/data/constants/app';
// eslint-disable-next-line
import { mockBlockIdByType } from '@edx/frontend-lib-content-components/editors/data/constants/mockData';
import { useDispatch } from 'react-redux';
// eslint-disable-next-line
import { thunkActions } from '@edx/frontend-lib-content-components/editors/data/redux';

export const EditorGallery = () => {
  const [blockType, setBlockType] = React.useState('html');
  const [mockRaw, setMockRaw] = React.useState(false);

  const blockIds = Object.keys(blockTypes).reduce((obj, blockTypeKey) => {
    const type = blockTypes[blockTypeKey];
    return { ...obj, [type]: [mockBlockIdByType(type), (mockRaw ? '-mockRaw' : '')].join('') };
  }, {});
  const courseId = 'library-v1:EDX+apmjoemaonmeonaoenan';
  const studioEndpointUrl = 'fake-studio-endpoint-url';
  const lmsEndpointUrl = 'https://courses.edx.org'; // this is hardcoded because that is where the image data is from.

  const handleBlockChange = (e) => setBlockType(e.target.value);
  const handleRawChange = (e) => setMockRaw(e.target.value === 'true');

  const dispatch = useDispatch();
  useEffect(() => {
    thunkActions.app.initialize({
      blockId: blockIds[blockType],
      blockType,
      lmsEndpointUrl,
      studioEndpointUrl,
    })(dispatch);
  }, [dispatch, blockType]);
  return (
    <div className="gallery">
      <div style={{ display: 'flex' }}>
        <Form.Group>
          <Form.RadioSet
            name="blockTypes"
            onChange={handleBlockChange}
            value={blockType}
          >
            { Object.values(blockTypes).map((e) => (
              <Form.Radio value={e}> {e} </Form.Radio>
            ))}
          </Form.RadioSet>
        </Form.Group>
        <Form.Group
          style={{
            display: blockType === 'html' || blockType === 'problem'
              ? 'block'
              : 'none',
          }}
        >
          <Form.RadioSet
            name="raw"
            onChange={handleRawChange}
            value={mockRaw.toString()}
          >
            <Form.Radio value="false">visual</Form.Radio>
            <Form.Radio value="true">raw</Form.Radio>
          </Form.RadioSet>
        </Form.Group>
      </div>
      <EditorPage
        {...{
          blockId: blockIds[blockType],
          blockType,
          courseId,
          studioEndpointUrl,
          lmsEndpointUrl,
          onClose: () => setBlockType(null),
        }}
      />
    </div>
  );
};

export default EditorGallery;
