Network and Requests Layer

Synopsis
--------

For V2 Content Editors, we have defined a general abstraction for basic editor actions and content retrieval. This abstraction is twofold: a defined set of general “app” actions for basic editor actions, and a Requests Layer to track the status of ALL network requests.

This will be a powerful tool to speed up the creation of new editors.



Decision
------

The common actions required for any V2 content editor are as follows:
Retrieve an xblock
Save an xblock to the xblock api in the CMS.
Return to your learning context (Studio, Course Authoring, Library Authoring)
Obtain content (video, files, images) from the contentstore associated with a learning context.

We have implemented actions to perform those tasks in src/editors/data/redux/thunkActions/app.js. These actions are decoupled from the code of a specific editor, and are easily portable across editors.

We have also defined an atomic method to track the lifecycle of a network action. This abstraction applies to these common actions, as well as any actions defined in the data layer of a particular V2 editor. 

The lifecycle of the acquisition of data from network and the updating of the global state with that data is termed to be a "request." The "states" of the lifecycle associated with a request are [inactive, pending, completed, failed]. This lifecycle provides information to the Redux consumer as to the status of their data.

Each unique request instance is given a key in `src/editors/data/constants/requests`. This key can be queried to ascertain the status of the request using a Redux selector by a consumer of the redux state. This allows for easy conditional rendering. By following this pattern, additional  async actions will be easy to write. 

The individual api methods are all defined in `data/services/cms/api`. The goal of the `requests` thunkActions is to first route the appropriate store data to the api request based on how they are being called.

The actual chain the an example request to save an xblock code is:

`thunkActions/app:saveBlock` -> `thunkActions/requests:saveBlock` `services/cms/api:saveBlock`

* The "app" thunk action updates the local block content, and then dispatches the request thunkAction
* The "request" thunkAction then loads relevant redux data for the save event and calls the api.saveBlock method, wrapped such that the UI can track the request state
* The "api" method provides the specifics for the actual network request, including prop format and url."

Status
------
Adopted

Context
-------

In building React Redux applications, asynchronous actions require a set of "Thunk" actions dispatched at relevant points. A common standard around the lifecycle helps prevent the boilerplate for these actions to spiral. In addition, it allows for the faster development of new V2 editors, as developers have easily usable Redux actions to dispatch, as well as Redux selectors to track the status of their requests. 

Consequences
------------

Network-based CRUD actions have a common language of lifecycle, as well as a common pattern to implement, allowing developers to use ready-made requests without issue for common actions, like xblock saving, content store retrieval, and even outside api access. This improves ease of use, as well as readability and uniformity.
