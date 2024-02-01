/* eslint-disable no-param-reassign */
/**
 * The JavaScript code which runs inside our IFrame and is responsible
 * for communicating with the parent window.
 *
 * This cannot use any imported functions because it runs in the IFrame,
 * not in our app webpack bundle.
 */
// eslint-disable-next-line import/prefer-default-export
export function xblockIFrameConnector() {
  const CHILDREN_KEY = '_jsrt_xb_children'; // JavaScript RunTime XBlock children
  const USAGE_ID_KEY = '_jsrt_xb_usage_id';
  const HANDLER_URL = '_jsrt_xb_handler_url';

  const uniqueKeyPrefix = `k${+Date.now()}-${Math.floor(Math.random() * 1e10)}-`;
  let messageCount = 0;

  /**
   * A helper method for sending messages to the parent window of this IFrame
   * and getting a reply, even when the IFrame is securely sandboxed.
   * @param messageData The message to send. Must be an object, as we add a key/value pair to it.
   * @param callback The callback to call when the parent window replies
   */
  function postMessageToParent(messageData, callback) {
    messageCount += 1;
    const messageReplyKey = uniqueKeyPrefix + messageCount;
    messageData.replyKey = messageReplyKey;

    if (callback !== undefined) {
      const handleResponse = (event) => {
        if (event.source === window.parent && event.data.replyKey === messageReplyKey) {
          callback(event.data);
          window.removeEventListener('message', handleResponse);
        }
      };
      window.addEventListener('message', handleResponse);
    }
    window.parent.postMessage(messageData, '*');
  }

  /**
   * The JavaScript runtime for any XBlock in the IFrame
   */
  const runtime = {
    /**
     * An obscure and little-used API that retrieves a particular
     * XBlock child using its 'data-name' attribute
     * @param block The root DIV element of the XBlock calling this method
     * @param childName The value of the 'data-name' attribute of the root
     *    DIV element of the XBlock child in question.
     */
    childMap: (block, childName) => runtime.children(block).find((child) => child.element.getAttribute('data-name') === childName),
    children: (block) => block[CHILDREN_KEY],
    /**
     * Get the URL for the specified handler. This method must be synchronous, so
     * cannot make HTTP requests.
     */
    handlerUrl: (block, handlerName, suffix, query) => {
      let url = block[HANDLER_URL].replace('handler_name', handlerName);
      if (suffix) {
        url += `${suffix}/`;
      }
      if (query) {
        url += `?${query}`;
      }
      return url;
    },
    /**
     * Pass an arbitrary message from the XBlock to the parent application.
     * This is mostly used by the studio_view to inform the user of save events.
     * Standard events are as follows:
     *
     * save: {state: 'start'|'end', message: string}
     * -> Displays a "Saving..." style message + animation to the user until called
     *    again with {state: 'end'}. Then closes the modal holding the studio_view.
     *
     * error: {title: string, message: string}
     * -> Displays an error message to the user
     *
     * cancel: {}
     * -> Close the modal holding the studio_view
     */
    notify: (eventType, params) => {
      params.method = `xblock:${eventType}`;
      postMessageToParent(params);
    },
  };

  /**
   * Initialize an XBlock. This function should only be called by initializeXBlockAndChildren
   * because it assumes that function has already run.
   */
  function initializeXBlock(element, callback) {
    const usageId = element[USAGE_ID_KEY];
    // Check if the XBlock has an initialization function:
    const initFunctionName = element.getAttribute('data-init');

    if (initFunctionName !== null) {
      // Since this block has an init function, it may need to call handlers,
      // so we first have to generate a secure handler URL for it:
      postMessageToParent({ method: 'get_handler_url', usageId }, (handlerData) => {
        element[HANDLER_URL] = handlerData.handlerUrl;
        // Now proceed with initializing the block's JavaScript:
        const InitFunction = (window)[initFunctionName];
        // Does the XBlock HTML contain arguments to pass to the InitFunction?
        let data = {};
        [].forEach.call(element.children, (childNode) => {
          // The newer/pure/Blockstore runtime uses 'xblock_json_init_args'
          // while the Studio runtime uses 'xblock-json-init-args'.
          if (
            childNode.matches('script.xblock_json_init_args')
            || childNode.matches('script.xblock-json-init-args')
          ) {
            data = JSON.parse(childNode.textContent);
          }
        });

        // An unfortunate inconsistency is that the old Studio runtime used
        // to pass 'element' as a jQuery-wrapped DOM element, whereas the Studio
        // runtime used to pass 'element' as the pure DOM node. In order not to
        // break backwards compatibility, we would need to maintain that.
        // However, this is currently disabled as it causes issues (need to
        // modify the runtime methods like handlerUrl too), and we decided not
        // to maintain support for legacy studio_view in this runtime.
        // const isStudioView = element.className.indexOf('studio_view') !== -1;
        // const passElement = isStudioView && (window as any).$ ? (window as any).$(element) : element;
        const blockJS = new InitFunction(runtime, element, data) || {};
        blockJS.element = element;
        callback(blockJS);
      });
    } else {
      const blockJS = { element };
      callback(blockJS);
    }
  }

  /**
   * Finds the value of the first 'data-usage' or 'data-usage-id' attribute within the given element
   * and its descendants.
   */
  function findFirstDataAttributeValue(element) {
    // eslint-disable-next-line consistent-return,no-shadow
    function searchDataUsageAttribute(element) {
      const { attributes, children } = element;
      for (let i = 0; i < attributes.length; i++) {
        const attributeName = attributes[i].name;
        if (attributeName === 'data-usage' || attributeName === 'data-usage-id') {
          return attributes[i].value;
        }
      }

      for (let j = 0; j < children.length; j++) {
        const result = searchDataUsageAttribute(children[j]);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return searchDataUsageAttribute(element);
  }

  // Recursively initialize the JavaScript code of each XBlock:
  function initializeXBlockAndChildren(element, callback) {
    const usageId = findFirstDataAttributeValue(element);

    if (usageId !== null) {
      element[USAGE_ID_KEY] = usageId;
    } else {
      throw new Error('XBlock is missing a usage ID attribute on its root HTML node.');
    }

    const version = element.getAttribute('data-runtime-version');

    if (version != null && version !== '1') {
      throw new Error('Unsupported XBlock runtime version requirement.');
    }
    // Recursively initialize any children first:
    // We need to find all div.xblock-v1 children, unless they're grandchilden
    // So we build a list of all div.xblock-v1 descendants that aren't descendants
    // of an already-found descendant:
    const childNodesFound = [];
    [].forEach.call(element.querySelectorAll('.xblock, .xblock-v1'), (childNode) => {
      if (!childNodesFound.find((el) => el.contains(childNode))) {
        childNodesFound.push(childNode);
      }
    });

    // This code is awkward because we can't use promises (IE11 etc.)
    let childrenInitialized = -1;
    function initNextChild() {
      childrenInitialized += 1;
      if (childrenInitialized < childNodesFound.length) {
        const childNode = childNodesFound[childrenInitialized];
        initializeXBlockAndChildren(childNode, initNextChild);
      } else {
        // All children are initialized:
        initializeXBlock(element, callback);
      }
    }
    initNextChild();
  }

  // Find the root XBlock node.
  // The newer/pure/Blockstore runtime uses '.xblock-v1' while the Studio runtime uses '.xblock'.
  const rootNode = document.querySelector('.xblock, .xblock-v1'); // will always return the first matching element

  initializeXBlockAndChildren(rootNode, () => {
    // When done, tell the parent window the size of this block:
    postMessageToParent({
      height: document.body.scrollHeight,
      method: 'update_frame_height',
    });
    postMessageToParent({ method: 'init_done' });
  });

  let lastHeight = -1;
  function checkFrameHeight() {
    const visibleIFrameContent = document.querySelector('.xblock-render');
    const newHeight = visibleIFrameContent.scrollHeight;

    if (newHeight !== lastHeight) {
      postMessageToParent({ method: 'update_frame_height', height: newHeight });
      lastHeight = newHeight;
    }
  }
  // Check the size whenever the DOM changes:
  new MutationObserver(checkFrameHeight).observe(document.body, { attributes: true, childList: true, subtree: true });
  // And whenever the IFrame is resized
  window.addEventListener('resize', checkFrameHeight);
}
