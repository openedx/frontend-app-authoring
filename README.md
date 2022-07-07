# frontend-lib-content-components
A library of high-level components for content handling (viewing, editing, etc. of HTML, video, problems, etc.), to be shared by multiple MFEs.

# How to setup development of V2 content Editors for this Package for use in Studio and course Authoring MFE.

This guide presumes you have a functioning devstack. 

1. Enable Studio to use an editor for your xblock using waffle flags
    1. Add the string name of your editor e.g. `html` to the flag check at line 3976 of `edx-platform/common/lib/xmodule/xmodule/js/common_static/bundles/js/factories/container.js`
    2. In devstack + venv, run `$make dev up frontend-app-course-authoring` to make up the required services
    3. run `$make dev.shell.lms` to enter the lms shell, then run `$paver update_assets lms` to update the static assets. This could take a minute.
    4. In http://localhost:18000/admin/waffle/flag/ turn on `new_core_editors.use_new_text_editor`
    5. refresh the studio page.
2. clone this repo into src directory the sibling repo of your edx devstack `/src`.
3. In the course authoring app, follow the guide to use your local verison of frontend-lib-content-components.  https://github.com/openedx/frontend-build#local-module-configuration-for-webpack. your moduleconfig.js will look like something like this:

```
    module.exports = {
    /*
    Modules you want to use from local source code.  Adding a module here means that when this app
    runs its build, it'll resolve the source from peer directories of this app.

    moduleName: the name you use to import code from the module.
    dir: The relative path to the module's source code.
    dist: The sub-directory of the source code where it puts its build artifact.  Often "dist".

    To use a module config:

    1. Copy module.config.js.example and remove the '.example' extension
    2. Uncomment modules below in the localModules array to load them from local source code.
    3. Remember to re-build the production builds of those local modules if they have one.
        See note below.
    */
    localModules: [
        /*********************************************************************************************
        IMPORTANT NOTE: If any of the below packages (like paragon or frontend-platform) have a build
        step that populates their 'dist' directories, you must manually run that step.  For paragon
        and frontend-platform, for instance, you need to run `npm run build` in the repo before
        module.config.js will work.
        **********************************************************************************************/

        // { moduleName: '@edx/brand', dir: '../brand-openedx' }, // replace with your brand checkout
        // { moduleName: '@edx/paragon/scss/core', dir: '../paragon', dist: 'scss/core' },
        // { moduleName: '@edx/paragon/icons', dir: '../paragon', dist: 'icons' },
        // { moduleName: '@edx/paragon', dir: '../paragon', dist: 'dist' },
        // { moduleName: '@edx/frontend-platform', dir: '../frontend-platform', dist: 'dist' },
        { moduleName: '@edx/frontend-lib-content-components', dir: '../../src/frontend-lib-content-components', dist: 'dist' },
    ],
    };

```

4. open a terminal at the folder you just cloned in, frontend-lib-content-components.
    1. run `$ npm install`
    2. run `$ npm run-script-build` when you want to see your changes.

    # Add A New Xblock Editor
    1. run `$ npm run-script addXblock <yourxblock string name ex: html>`
    2. edit your componentry at `src/frontend-lib-content-components/src/editors/containers`

5. Now, after a `make dev.down` and `make dev.up` for your devstack services, you should be able to realize your changes.

# Using the gallery view.
The gallery view runs the editor components with mocked out block data, and sometimes does not replicate all desired behaviors, but can be used for faster iteration on UI related changes. To run the gallery view, from the root directory, run

$ cd www
$ npm start

and now the gallery will be live at http://localhost:8080/index.html. use the toggle at the top to switch between availible editors.

# Creating Your own editor
If you wish to make your own editor, to being coding the editor, simply run the command

$ npm run-script addXblock <name of xblock>

from the frontend-lib-content-components source directory. It will create an editor you can then veiw at src/editors/containers. It will also configure the editor to be viewable in the gallery view. Adding the editor to be used in studio will require the following steps:

