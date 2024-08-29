import tinyMCEEmbedIframePlugin from './embedIframePlugin';

const editorMock = {
  windowManager: {
    open: jest.fn(),
  },
  insertContent: jest.fn(),
  ui: {
    registry: {
      addButton: jest.fn(),
    },
  },
};

describe('TinyMCE Embed IFrame Plugin', () => {
  const pluginConfig = {
    title: 'Insert iframe',
    body: {
      type: 'tabpanel',
      tabs: [
        {
          title: 'General',
          items: [
            {
              type: 'input',
              name: 'source',
              label: 'Source URL',
              multiline: false,
              autofocus: true,
              required: true,
            },
            {
              type: 'selectbox',
              name: 'sizeType',
              label: 'Size',
              items: [
                { text: 'Inline Value', value: 'inline' },
                { text: 'Big embed', value: 'big' },
                { text: 'Small embed', value: 'small' },
              ],
            },
            {
              type: 'sizeinput',
              name: 'size',
              label: 'Dimensions',
            },
          ],
        },
        {
          title: 'Advanced',
          items: [
            {
              type: 'input',
              name: 'name',
              label: 'Name',
              value: '',
            },
            {
              type: 'input',
              name: 'title',
              label: 'Title',
              value: '',
            },
            {
              type: 'input',
              name: 'longDescriptionURL',
              label: 'Long description URL',
              value: '',
            },
            {
              type: 'checkbox',
              name: 'border',
              label: 'Show iframe border',
              text: 'Border',
              checked: false,
            },
            {
              type: 'checkbox',
              name: 'scrollbar',
              label: 'Enable scrollbar',
              text: 'Scrollbar',
              checked: false,
            },
          ],
        },
      ],
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel',
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens insert iframe modal on button action', () => {
    // Invoke the plugin
    tinyMCEEmbedIframePlugin(editorMock);

    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();
    expect(editorMock.windowManager.open).toHaveBeenCalled();
  });

  test('opens insert iframe modal on button action validate onSubmit and OnChange function', () => {
    tinyMCEEmbedIframePlugin(editorMock);

    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();
    expect(editorMock.windowManager.open).toHaveBeenCalledWith(
      expect.objectContaining({
        onSubmit: expect.any(Function),
        onChange: expect.any(Function),
      }),
    );
  });

  test('opens insert iframe modal on button action validate title', () => {
    tinyMCEEmbedIframePlugin(editorMock);

    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();
    expect(editorMock.windowManager.open).toHaveBeenCalled();
    expect(editorMock.windowManager.open).toHaveBeenCalledWith(
      expect.objectContaining({
        title: pluginConfig.title,
      }),
    );
  });

  test('opens insert iframe modal on button action validate buttons', () => {
    tinyMCEEmbedIframePlugin(editorMock);

    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();
    expect(editorMock.windowManager.open).toHaveBeenCalled();
    expect(editorMock.windowManager.open).toHaveBeenCalledWith(
      expect.objectContaining({
        buttons: pluginConfig.buttons,
      }),
    );
  });

  test('opens insert iframe modal on button action validate tabs', () => {
    tinyMCEEmbedIframePlugin(editorMock);

    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();
    const [generalTab, advancedTab] = pluginConfig.body.tabs;

    expect(editorMock.windowManager.open).toHaveBeenCalled();
    expect(editorMock.windowManager.open).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { type: 'tabpanel', tabs: [generalTab, advancedTab] },
      }),
    );
  });
  test('tests onChange function in plugin', () => {
    tinyMCEEmbedIframePlugin(editorMock);
    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

    // Access the onChange function from the opened configuration
    const onChangeFunction = editorMock.windowManager.open.mock.calls[0][0].onChange;

    // Mock API and field for onChange
    const apiMock = {
      getData: jest.fn(() => ({ sizeType: 'big' })),
      redial: jest.fn(),
    };
    const field = {
      name: 'sizeType',
    };

    // Simulate calling the onChange function
    onChangeFunction(apiMock, field);

    expect(apiMock.getData).toHaveBeenCalled();
    expect(apiMock.redial).toHaveBeenCalled();
  });

  test('modifies generalTab items when sizeType is not inline', () => {
    tinyMCEEmbedIframePlugin(editorMock);
    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

    const onChangeFunction = editorMock.windowManager.open.mock.calls[0][0].onChange;

    const apiMock = {
      getData: jest.fn(() => ({ sizeType: 'big' })),
      redial: jest.fn(),
    };
    const field = {
      name: 'sizeType',
    };

    onChangeFunction(apiMock, field);

    const [generalTab, advancedTab] = pluginConfig.body.tabs;
    const generalTabExpected = generalTab.items.filter(
      (item) => item.type !== 'sizeinput',
    );

    const expectedTabs = [
      { title: generalTab.title, items: generalTabExpected, type: generalTab.type },
      advancedTab,
    ];

    const expectedBody = {
      type: pluginConfig.body.type,
      tabs: expectedTabs,
    };

    expect(apiMock.redial).toHaveBeenCalledWith(expect.objectContaining({
      body: expectedBody,
    }));
  });

  test('adds sizeinput to generalTab items when sizeType is inline', () => {
    tinyMCEEmbedIframePlugin(editorMock);
    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

    const onChangeFunction = editorMock.windowManager.open.mock.calls[0][0].onChange;

    const apiMock = {
      getData: jest.fn(() => ({ sizeType: 'inline' })),
      redial: jest.fn(),
    };
    const field = {
      name: 'sizeType',
    };

    onChangeFunction(apiMock, field);

    const [generalTab, advancedTab] = pluginConfig.body.tabs;

    expect(apiMock.redial).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { type: 'tabpanel', tabs: [generalTab, advancedTab] },
      }),
    );
  });

  test('tests onSubmit function in plugin', () => {
    const dataMock = {
      source: 'https://www.example.com',
      sizeType: 'big',
    };
    const apiMock = {
      getData: jest.fn(() => dataMock),
      close: jest.fn(),
    };

    tinyMCEEmbedIframePlugin(editorMock);
    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

    const onSubmitFunction = editorMock.windowManager.open.mock.calls[0][0].onSubmit;
    onSubmitFunction(apiMock);

    expect(apiMock.getData).toHaveBeenCalled();
    expect(editorMock.insertContent).toHaveBeenCalled();
    expect(apiMock.close).toHaveBeenCalled();
  });

  test('tests onSubmit function in plugin advanced properties', () => {
    const dataMock = {
      source: 'https://www.example.com',
      sizeType: 'big',
      name: 'iframeName',
      title: 'iframeTitle',
      longDescriptionURL: 'https://example.com/description',
      border: true,
      scrollbar: true,
    };
    const apiMock = {
      getData: jest.fn(() => dataMock),
      close: jest.fn(),
    };

    tinyMCEEmbedIframePlugin(editorMock);
    editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

    const onSubmitFunction = editorMock.windowManager.open.mock.calls[0][0].onSubmit;
    onSubmitFunction(apiMock);

    expect(apiMock.getData).toHaveBeenCalled();

    expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('width="800px"'));
    expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('height="800px"'));
    expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining(`name="${dataMock.name}"`));
    expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining(`title="${dataMock.title}"`));
    expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining(`longdesc="${dataMock.longDescriptionURL}"`));
    expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('scrolling="yes"'));

    expect(apiMock.close).toHaveBeenCalled();
  });

  describe('tests onSubmit function in plugin sizeType', () => {
    test('tests onSubmit function in plugin with sizeType big', () => {
      const dataMock = {
        source: 'https://www.example.com',
        sizeType: 'big',
      };

      const apiMock = {
        getData: jest.fn(() => dataMock),
        close: jest.fn(),
      };

      tinyMCEEmbedIframePlugin(editorMock);
      editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

      const onSubmitFunction = editorMock.windowManager.open.mock.calls[0][0].onSubmit;
      onSubmitFunction(apiMock);

      expect(apiMock.getData).toHaveBeenCalled();

      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('width="800px"'));
      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('height="800px"'));

      expect(apiMock.close).toHaveBeenCalled();
    });

    test('tests onSubmit function in plugin with sizeType small', () => {
      const dataMock = {
        source: 'https://www.example.com',
        sizeType: 'small',
      };

      const apiMock = {
        getData: jest.fn(() => dataMock),
        close: jest.fn(),
      };

      tinyMCEEmbedIframePlugin(editorMock);
      editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

      const onSubmitFunction = editorMock.windowManager.open.mock.calls[0][0].onSubmit;
      onSubmitFunction(apiMock);

      expect(apiMock.getData).toHaveBeenCalled();

      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('width="100px"'));
      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('height="100px"'));
      expect(apiMock.close).toHaveBeenCalled();
    });

    test('tests onSubmit function in plugin with custom sizeType', () => {
      const dataMock = {
        source: 'https://www.example.com',
        sizeType: 'inline',
        size: {
          width: '500px',
          height: '700px',
        },
      };

      const apiMock = {
        getData: jest.fn(() => dataMock),
        close: jest.fn(),
      };

      tinyMCEEmbedIframePlugin(editorMock);
      editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

      const onSubmitFunction = editorMock.windowManager.open.mock.calls[0][0].onSubmit;
      onSubmitFunction(apiMock);

      expect(apiMock.getData).toHaveBeenCalled();

      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('width="500px"'));
      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('height="700px"'));
      expect(apiMock.close).toHaveBeenCalled();
    });

    test('tests onSubmit function in plugin with custom sizeType invalid values', () => {
      const dataMock = {
        source: 'https://www.example.com',
        sizeType: 'inline',
        size: {
          width: 'test',
          height: 'test',
        },
      };

      const apiMock = {
        getData: jest.fn(() => dataMock),
        close: jest.fn(),
      };

      tinyMCEEmbedIframePlugin(editorMock);
      editorMock.ui.registry.addButton.mock.calls[0][1].onAction();

      const onSubmitFunction = editorMock.windowManager.open.mock.calls[0][0].onSubmit;
      onSubmitFunction(apiMock);

      expect(apiMock.getData).toHaveBeenCalled();

      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('width="300px"'));
      expect(editorMock.insertContent).toHaveBeenCalledWith(expect.stringContaining('height="300px"'));
      expect(apiMock.close).toHaveBeenCalled();
    });
  });
});
