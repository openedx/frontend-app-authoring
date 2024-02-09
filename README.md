# frontend-lib-content-components

# Purpose
A library of high-level components for content handling (viewing, editing, etc. of HTML, video, problems, etc.), to be shared by multiple MFEs.

# Getting Started

## How to set up development workflow of V2 content Editors in Studio and course Authoring MFE.

This guide presumes you have a functioning devstack.

1. Enable Studio to use an editor for your xblock using waffle flags
    1. Add the string name of your editor e.g. `html` to the flag check in the [edx-platform repo.](https://github.com/openedx/edx-platform/blob/369e5af85ab58c51a4bf4baf249d5cb36c1961fe/cms/static/js/views/pages/container.js#L190)
    2. In devstack + venv, run `$ make dev.provision.lms+studio+frontend-app-course-authoring` to make up the required services. Minimum services required are lms, studio and frontend-app-course-authoring.
    4. In [Studio Django Admin](http://localhost:18000/admin/waffle/flag/) turn on `new_core_editors.use_new_text_editor` flag for HTML editor, `new_core_editors.use_new_video_editor` flag for new video editor, and `new_core_editors.use_new_problem_editor` flag for problems. The list of supported flags is in [toggles.py. ](https://github.com/openedx/edx-platform/blob/master/cms/djangoapps/contentstore/toggles.py). you might have to add a flag for your xblock of choice.
2. Clone this repo into the [`${DEVSTACK_WORKSPACE}/src` directory](https://edx.readthedocs.io/projects/open-edx-devstack/en/latest/readme.html?highlight=DEVSTACK_WORKSPACE#id9) the sibling repo of your edx devstack `/src`.
3. In the course authoring app, follow the guide to use your [local verison of frontend-lib-content-components. ](https://github.com/openedx/frontend-build#local-module-configuration-for-webpack) The module.config.js in the frontend-app-course-authoring repo will be:

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
        // { moduleName: '@openedx/paragon/scss/core', dir: '../paragon', dist: 'scss/core' },
        // { moduleName: '@openedx/paragon/icons', dir: '../paragon', dist: 'icons' },
        // { moduleName: '@openedx/paragon', dir: '../paragon', dist: 'dist' },
        // { moduleName: '@edx/frontend-platform', dir: '../frontend-platform', dist: 'dist' },
        // NOTE: This is the relative path of the frontend-lib-content-components in the frontend-app-course-authoring container.
        { moduleName: '@edx/frontend-lib-content-components', dir: '../src/frontend-lib-content-components', dist: 'dist' },
    ],
    };

```

4. Open a terminal
    1. `cd ${DEVSTACK_WORKSPACE}/src/frontend-lib-content-components`
    1. run `$ npm install`
    2. run `$ make build` when you want to see your changes.

5. In devstack run `make studio-static` followed by `$ make dev.down.frontend-app-course-authoring` and `$ make dev.up.frontend-app-course-authoring`.

6. Go to [studio](http://localhost:18010) and edit a course or add the Xblock with the developing editor, it should redirect to `frontend-app-course-authoring`
   MFE and the editor should load.

## Using the gallery view.

The gallery view runs the editor components with mocked-out block data, and sometimes does not replicate all desired behaviors, but can be used for faster iteration on UI-related changes. To run the gallery view, from the root directory, run

$ cd www
$ npm start

and now the gallery will be live at http://localhost:8080/index.html. use the toggle at the top to switch between available editors.

## Creating Xblock Editor

To develop a custom Xblock editor, run the command:

`$ npm run-script addXblock <name of xblock>`

from the frontend-lib-content-components source directory. It will create an editor you can then view at `src/editors/containers`.
It will also configure the editor to be viewable in the gallery view. Adding the editor to be used in studio will require the following steps:

1. Adding a flag in [toggles.py](https://github.com/openedx/edx-platform/blob/master/cms/djangoapps/contentstore/toggles.py)
2. Activating the Flag in [Studio Django Admin. ](http://localhost:18000/admin/waffle/flag/)
3. Add the function in [studio_xblock_wrapper.html](https://github.com/openedx/edx-platform/blob/master/cms/templates/studio_xblock_wrapper.html#L13)
4. Make appropriate changes in [container.js in the edx-platform repo.](https://github.com/openedx/edx-platform/blob/369e5af85ab58c51a4bf4baf249d5cb36c1961fe/cms/static/js/views/pages/container.js#L190)
5. Activate the flag.
6. Follow steps 4 to 6 from [above](#how-to-set-up-development-workflow-of-v2-content-editors-in-studio-and-course-authoring-mfe)

## Installing into a project

- `npm install @edx/frontend-lib-content-components`
- For the Jest tests to work, a few config options are necessary. In jest.config.js, include:
```js
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
```
- Some mocks for test setup are also necessary, specifically replacing `window.matchMedia`.
- To make this easier, we provide example files for `jest.config.js` and `setupTest.js` that are known to work.
You can find them in the example/ folder.

## License

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

## Contributing

Contributions are very welcome.  Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features.  However, please make sure
to have a discussion about your new feature idea with the maintainers prior to
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

## Getting Help

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_.  Because this is a
frontend repository, the best place to discuss it would be in the `#wg-frontend
channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-lib-content-components/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/community/connect

##  The Open edX Code of Conduct

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

## Reporting Security Issues

Please do not report security issues in public. Please email security@openedx.org.

