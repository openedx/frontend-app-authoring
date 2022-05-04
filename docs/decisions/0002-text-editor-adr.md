# Status

Accepted

# Context

We seek to hoist the lecacy text (HTML) text editor out of the monolith into a decoupled React application.

The legacy editor delegates the bulk of its operations to the tinyMCE editor



# Decision set (each decision small)

1. Rely on editor-wide Blockstore networking utilities for loading from, and saving to, XBlock content
2. Continue using the tinyMCE editor
3. Wrap the tinyMCE editor so as to be able to handle it as a vanilla React component
4. Use a mix of configuration and tinyMCE API calls to customize the editor as needed 
    * (e.g., offer image upload and image gallery selection)



# Consequences

## Rely on editor-wide BlockStore networking decision

In the [frontend-lib-content-components repo](https://github.com/edx/frontend-lib-content-components), look at`src/editors/data/redux/thunkActions`. There, `requests.js` provides a `fetchBlock()` method that encapsulates all back-end logic for retrieving a block by id from BlockStore. A matching `saveBlock()` method is used to save changes, post-editing. The states associated with BlockStore requests are `startRequest`, `completeRequest`, and `failRequest`.

(drilling down, per Ben Warzeski) "Requests is a generalized interface I use to track the status of ALL network requests in that redux needs to track in the App, and is not limited to the BlockStore commms.
The "states" associated are [inactive, pending, completed, failed], as defined in `src/editors/data/constants/requests`.
Also in that file is a list of request categories being tracked in the requests store.

The methods in `thunkActions/requests.js` wrap api calls in a custom networkRequest wrapper to track their state.  The individual api methods are all defined in `data/services/cms/api`.
The goal of the `requests` thunkActions is to route the appropriate store data to the api request based on how they are being called, as well as.
The actual chain the code goes through is
  `thunkActions/app:saveBlock` -> `thunkActions/requests:saveBlock` -> `services/cms/api:saveBlock`
* The "app" thunk action updates the local block content, and then dispatches the request thunkAction
* The "request" thunkAction then loads relevant redux data for the save event and calls the api.saveBlock method, wrapped such that the UI can track the request state
* The "api" method provides the specifics for the actual network request, including prop format and url."

## Continue using the tinyMCE editor

Future customizations might not be possible if look-and-feel configurations offered by tinyMCE prove inadequate, or if the tinyMCE API falls short. For current requirements this was not a showstopper.


# Wrap the tinyMCE editor for React use

Wrapping of the tinyMCE editor to behave like a react component is done by the simple expedient of having `TextEditor.jsx` import the [tinymce/tinymce-react](https://github.com/tinymce/tinymce-react) repo and then interacting with the Editor component defined there.

Interaction with the tinyMCE editor is via a reference, saved at editor initialization.

(per Ben Warzeski) "When wrapping the tinyMCE component we assign a `ref` to the created component so that we can access its state and apis to update the content and draw it back out.
 
* initialize with html content from xblock


# Editor customization

(More color on this, per Ben Warzeski) "Because the tinyMCE instance is the core of the TextEditor experience (pretty much the whole thing), and it is not a custom-configuratble UI, the configuration hook provides much of our control of the UI.
However, because TinyMCE provides extensible controls, we have a few internal-written widgets we have embedded into the workflow, specifically including the image upload/settings modal.


Much of the editor configuration is actually defined in `TextEditor/pluginConfig.js`, and the editorHook mostly draws from this configuration to populate the editor."

## Image upload/gallery selection
The tinyMCE editor is extended to offer an image upload/select button. When the end-user pushes this button, the editor's window is occluded by a modal dialog capable of uploading an image. The end-user can also interact with this modal window to toggle between uploading a new image, or selecting from among previously uploaded images (aka, the image gallery), to save, or to cancel out.

On its initialization, the tinyMCE editor is provided with an icon and a callback to associate with the image upload button.

(per Ben Warzeski) 
* "Tiny MCE needs a "configured" button to open the modal dialog to select/upload an image.
    * This verbiage is somewhat important distinction, because this is a configuration, not a coding feature"

Later, on invocation of the modal dialog, this window is initialized with a reference to the tinyMCE editor.
If the modal window is driven to a save operation on an uploaded or a selected image, the window uses this reference to provide an image tag and image metadata to the tinyMCE editor, for inclusion at the current cursor location.

(per Ben Warzeski) "The wrapping modal around upload/settings has a hook that calls the editor execCommand to insert the image tag on a button click.
The hook runs before everything renders and produces a button callback that will save a passed image to the (_sic_ tinyMCE) editor context

* [on image upload or gallery selection] insert image tag at cursor location with source, dimensions, and alt text
* [on image update] Update and replace a given image tag selection with a new one, updating source, dimensions, and/or alt-text
    * Update and replace are utilizing exposed tinyMCE editor api accessed from the ref associated with the created component.
* Modal must have a "Save" option that inserts appropriately formatted tags into the tinyMCE editor context. 
    * Does not always update on relinquishing control, and communicates nothing on cancel"

