function tinyMCEEmbedIframePlugin(editor) {
  function openInsertIframeModal() {
    const defaultConfig = {
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
      onChange(api, field) {
        const { name } = field;
        const data = api.getData();
        const { sizeType, ...fields } = data;
        const isSizeTypeFiled = name === 'sizeType';
        const hasCustomSize = sizeType === 'inline';

        if (!hasCustomSize && isSizeTypeFiled) {
          const {
            body: {
              tabs: [generalTab],
            },
          } = defaultConfig;

          generalTab.items = generalTab.items.filter(
            (item) => item.type !== 'sizeinput',
          );

          defaultConfig.initialData = { ...fields, sizeType };
          api.redial(defaultConfig);
        }

        if (hasCustomSize && isSizeTypeFiled) {
          const {
            body: {
              tabs: [generalTab],
            },
          } = defaultConfig;

          const hasSizeInput = generalTab.items.some((item) => item.name === 'size');

          if (!hasSizeInput) {
            generalTab.items = [
              ...generalTab.items,
              {
                type: 'sizeinput',
                name: 'size',
                label: 'Dimensions',
              },
            ];
          }

          defaultConfig.initialData = { ...fields, sizeType };
          api.redial(defaultConfig);
        }
      },
      onSubmit(api) {
        const data = api.getData();
        const sizeTypes = {
          small: {
            height: '100px',
            width: '100px',
          },
          big: {
            height: '800px',
            width: '800px',
          },
        };
        if (data.source) {
          const {
            size, sizeType, name, title, longDescriptionURL, border, scrollbar,
          } = data;
          const { width, height } = sizeTypes[sizeType] || { width: size.width, height: size.height };

          const pxRegex = /^\d+px$/;
          const widthFormat = pxRegex.test(width) ? width : '300px';
          const heightFormat = pxRegex.test(height) ? height : '300px';
          const hasScroll = scrollbar ? 'yes' : 'no';

          let iframeCode = `<iframe src="${data.source}" width="${widthFormat}" height="${heightFormat}" scrolling="${hasScroll}"`;

          if (name) {
            iframeCode += ` name="${name}"`;
          }

          if (title) {
            iframeCode += ` title="${title}"`;
          }

          if (longDescriptionURL) {
            iframeCode += ` longdesc="${longDescriptionURL}"`;
          }

          if (!border) {
            iframeCode += 'frameborder="0"';
          }

          iframeCode += '></iframe>';

          iframeCode = `<div class="tiny-pageembed" style="width: ${widthFormat}; height: ${heightFormat}">`
            + `${iframeCode}`
            + '</div>';

          editor.insertContent(iframeCode);
        }

        api.close();
      },
    };

    editor.windowManager.open(defaultConfig);
  }

  // Register the button
  editor.ui.registry.addButton('embediframe', {
    text: 'Embed iframe',
    onAction: openInsertIframeModal,
  });
}

((tinymce) => {
  if (tinymce) {
    tinymce.PluginManager.add('embediframe', tinyMCEEmbedIframePlugin);
  }
})(window.tinymce);

export default tinyMCEEmbedIframePlugin;
