# Status

Accepted

# Context

We seek to hoist the legacy text (HTML) text XBlock editor out of the monolith into a decoupled React application
without reducing editor capabilities in the process.

The legacy editor delegates the bulk of its operations to the [TinyMCE](https://www.tiny.cloud/docs/tinymce/6/) editor.
Per the link, TinyMCE is "a rich-text editor that allows users to create formatted content within
a user-friendly interface".

# Decision set (each decision small)

1. Rely on cross-editor XBlock network access support, per "Network Request Layer" ADR in this repo
2. Continue using the tinyMCE editor
3. Wrap the tinyMCE editor so as to be able to handle it as a vanilla React component
4. Use a mix of configuration and tinyMCE API calls to customize the editor as needed 
    * (e.g., offer image upload and image gallery selection)
    
# Consequences

## Rely on editors-wide XBlock API (network access) decision
No complexity associated with CRUD operations on XBlock content, irrespective of where the XBlocks are stored.

## Continue using the tinyMCE editor

Future customizations might not be possible if look-and-feel configurations offered by tinyMCE prove inadequate, or if the tinyMCE API falls short. For current requirements this was not a showstopper.

# Wrap the tinyMCE editor for React use

Wrapping of the tinyMCE editor to behave like a react component is done by the simple expedient of having `TextEditor.jsx` import the [tinymce/tinymce-react](https://github.com/tinymce/tinymce-react) repo and then interacting with the Editor component defined there.

Interaction with the tinyMCE editor is via a reference, saved at editor initialization.

When wrapping the tinyMCE component we assign a `ref` to the created component so that we can access its state and apis to update the content and draw it back out.
 
* initialize with html content from xblock

# Editor customization

Because the tinyMCE instance is the core of the TextEditor experience (pretty much the whole thing), and it is not a custom-configuratble UI,
the configuration hook provides much of our control of the UI.
However, because TinyMCE provides extensible controls, we have a few internal-written widgets we have embedded into the workflow,
specifically including the image upload/settings modal.

Much of the editor configuration is actually defined in `TextEditor/pluginConfig.js`, and the editorHook mostly draws from this configuration to populate the editor."

## Image upload/gallery selection
The tinyMCE editor is extended to offer an image upload/select button. When the end-user pushes this button, the editor's window is occluded by a modal dialog capable of uploading an image. The end-user can also interact with this modal window to toggle between uploading a new image, or selecting from among previously uploaded images (aka, the image gallery), to save, or to cancel out.

On its initialization, the tinyMCE editor is provided with an icon and a callback to associate with the image upload button.

* Tiny MCE needs a "configured" button to open the modal dialog to select/upload an image.
    * This verbiage is somewhat important distinction, because this is a configuration, not a coding feature

Later, on invocation of the modal dialog, this window is initialized with a reference to the tinyMCE editor.
If the modal window is driven to a save operation on an uploaded or a selected image, the window uses this reference to provide an image tag and image metadata to the tinyMCE editor, for inclusion at the current cursor location.

The wrapping modal around upload/settings has a hook that calls the editor execCommand to insert the image tag on a button click.
The hook runs before everything renders and produces a button callback that will save a passed image to the (_sic_ tinyMCE) editor context

* [on image upload or gallery selection] insert image tag at cursor location with source, dimensions, and alt text
* [on image update] Update and replace a given image tag selection with a new one, updating source, dimensions, and/or alt-text
    * Update and replace are utilizing exposed tinyMCE editor api accessed from the ref associated with the created component.
* Modal must have a "Save" option that inserts appropriately formatted tags into the tinyMCE editor context. 
    * Does not always update on relinquishing control, and communicates nothing on cancel

