V2 Content Editors

Synopsis
--------

We have created a framework for creating improved editor experiences for existing xblocks. We call these new editors V2 Content Editors.
V2 Content Editors replace existing xblock editing experiences using redirection.
The V2 Editor framework allows for the easy creation and configuration of new editors through automated boilerplate generation, simple networking and state abstractions, and premade components for basic editing views.

Decisions
------

I. All V2 content editors shall live in this repository. This choice was made as the existing xblock framework is not amenable to running modern React applications for studio views, and cannot be upgraded to do so without herculanean effort.

II. These editors will be served to the user as if an overlay on the existing editing experience for a particular xblock. This shall occur by this library's editor comoponent being served from a learning context MFE (Library or Course Authoring).

III. The Editor component is loaded into a learning context authoring tool (eg. Course or Library Authoring) from this JS library. This component then serves the correct editor type based on the xblock id it is provided.

IV. Editors for a specific xblock are then provided with the relevant data and metadata of that xblock instance, and their code is run to provide the experience.

V. The following process was implemented to inject this flow into Studio.

     For entering an editor page: Users click on the "edit xblock" button, are redirected to the course authoring MFE, where they are presented with the relevant editor.

    .. image:: https://user-images.githubusercontent.com/49422820/166940630-51dfc25e-c760-4118-b4dd-ae1fa7fa73b9.png

     For saving content: Once inside the editor, clicking save saves the content to the xblock api and returns the user to the course authoring context.

    .. image:: https://user-images.githubusercontent.com/49422820/166940624-068e8446-0c86-4c24-a2dd-3eb474984f08.png

    For exiting without saving: The user is simply transported back to the course authoring context.

    .. image:: https://user-images.githubusercontent.com/49422820/166940617-80455ade-0a5e-4e61-94b0-b9e2d7a0531e.png

VI. The library provides prebuilt components and features to accomplish common editor tasks.
    - The EditorContainer component makes for easy saving, canceling changes, and xblock title editing.
    - An app-level abstraction for network requests and handling thier states. This is the /Requests layer in the redux store. More information will be contained in ADR 0004 Network Request Layer
VII. There are several patterns and principles along which the V2 editors are built. Additional editors are not required to follow these, but it is strongly encouraged. Theses are:
    - Following the Testing and Implementation ADR.
    - Generalize components for reuse when possible.
    - Use Redux for global state management.

VIII. How to create, configure, and enable a new editor experience will exist in other documentation, but should rely on automated configuration.

Status
------

Adopted

Context
-------

We need self-contained xblock editing and configuration experiences. Changing requirements require that that experience be modernized to use Paragon, work across authoring for different learning contexts (course authoring and library authoring), and be flexible, extensible and repeatable.

Carving experiences out of Studio is an architectural imperative. Editing, as xblocks are discrete pieces of content, can exist in a context independent of the learning context, so having a learning-context agnostic environment for editing makes sense.

Consequences
------------

This design has several consequences. These consequences are the result of the favoring of incremental changes, which can be iterated upon as other improvements in the openedx ecosystem occur.

The majority of the impactful consequences have to do with the architectural choice to NOT simply upgrade the capabilities of xblock rendering, and instead serve the new experiences from a separate library. The fallout of these design choices leads to architectural complexity, but also the ability to deliver value in new ways.

For example, locating the V2 editor in frontend-lib-content-components outside of the xblock code leaves no clear solution for easy open-source extension of V2 editors. This choice, however, also allows us to easily serve library and course contexts and leads to the easier creation of common content react components.

In addition, this also allows developers to add value to editors, without having to rewrite the course-authoring experience to leverage React. Indeed, even when course authoring moves into an MFE, it will be trivial to place the editor inside the editor.

This choice, however, is not intended to be final. Instead, this library can become merely a set of tools and common components, and once xblock editor views are Reactified, we can very easily restore the abstraction that all xblock code lives with the xblock. It is in this spirit of providing incremental value that we provided this choice.
