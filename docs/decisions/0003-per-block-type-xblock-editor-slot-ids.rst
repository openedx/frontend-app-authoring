3. Per-block-type IDs for the XBlock editor plugin slot
-------------------------------------------------------

Status
------

Proposed

Context
-------

``XBlockEditorSlot`` lets an out-of-tree plugin supply the authoring editor for
an XBlock type. Its default content is what this app already renders for that
type: a built-in editor from ``supportedEditors`` when one exists, otherwise
``AdvancedEditor``.

The slot's ID includes the block type being edited::

    org.openedx.frontend.authoring.xblock_editor.<blockType>.v1

so a plugin for the ``games`` block registers under
``org.openedx.frontend.authoring.xblock_editor.games.v1``, and every other block
type resolves to a different ID.

This makes two departures from the frontend-plugin-framework's
`slot naming ADR`_, and they are separate choices.

1. **The ID is derived at runtime.** The framework ADR describes a slot ID as a
   string in a fixed format whose identifier segment is a snake-case name. It
   does not explicitly prohibit computing that string from a runtime value,
   but every slot in this repository and every example in the framework's
   documentation uses a literal. A derived ID cannot be listed in advance, so
   a catalogue of slots, or tooling that enumerates them, sees a pattern rather
   than a name.

2. **The ID has an additional block-type segment.** The framework format has
   five fields, ``{Reverse DNS}.{Subdomain}.{Module}.{Identifier}.{Version}``.
   The current ID adds a segment between the identifier and the version:
   ``xblock_editor`` and ``games`` are separate. The block type could instead
   be folded into the identifier, giving
   ``org.openedx.frontend.authoring.xblock_editor_games.v1``, which keeps the
   five-field structure while still being per type.

Two properties of the framework shaped the per-type choice.

1. ``keepDefault: false`` removes all default content for the configured slot
   ID, regardless of the block type currently being edited.

2. Studio's unit page only sends a fixed set of block types to this app's
   editor. Every other type arrives as an ``editXBlock`` message, which opens
   the legacy edit modal inside the iframe. For a plugin to take over a block
   type, the host has to know, before it opens anything, that a plugin exists
   for that type.

Decision
--------

The slot ID is derived from the block type. ``xblockEditorSlotId(blockType)``
returns ``org.openedx.frontend.authoring.xblock_editor.<blockType>.v1``, and
``xblockEditorSlotAliases(blockType)`` returns the shorter
``xblock_editor_<blockType>_slot``.

The ``<blockType>`` segment is the XBlock type name exactly as it appears in a
usage key (``games``, ``html``, ``problem``). Block type names can contain
hyphens (``drag-and-drop-v2``), so this segment is not strictly snake case
whichever shape the ID takes. The rest of the ID follows the framework
convention: the module is ``authoring`` and the version is ``v1``.

Whether the block type is a separate segment
(``xblock_editor.games``) or folded into the identifier
(``xblock_editor_games``) is left open for review. The separate segment reads as
"the xblock_editor slot, for games", and groups the family under one prefix
when scanning a config file. The folded form matches the framework's
five-field structure exactly. Either format supports the same routing and
replacement behaviour. Changing the canonical format requires updating
registrations, documentation and tests; existing deployments would also need
migration or compatibility aliases.

The unit page treats a block type as **claimed** when the effective slot
config for its ID (canonical or alias, last configured entry wins, as
``PluginSlot`` resolves it) has at least one plugin, whatever the operation
and whatever ``keepDefault`` is. A claimed type has ``editXBlock`` routed to
this app's editor instead of the legacy modal. The usual configuration for
**replacing** the built-in editor is ``keepDefault: false`` with an ``Insert``
operation, but a ``Wrap`` around ``default_contents`` with ``keepDefault:
true`` also claims the type and is routed the same way.

Why this shape
~~~~~~~~~~~~~~

**A replacement configured for one block type does not remove the defaults
for other types.** Because ``keepDefault`` is per slot ID, giving each block
type its own ID means ``keepDefault: false`` on the games ID removes only the
games default. The built-in HTML, problem and video editors keep rendering
through their own IDs, untouched.

**Routing uses the existing slot config and nothing else.** Whether a plugin
exists for a block type is answered by looking up that type's ID in
``pluginSlots``. The unit page uses that single lookup to decide between this
app's editor and the legacy modal. No further registration contract is needed
between the plugin and the host.

**The plugin does not need to dispatch.** A plugin registered for the games ID
is only ever rendered for games blocks. It does not receive other types and
does not need a branch that hands them back.

Alternatives considered
-----------------------

A single shared slot with conditional wrapping
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

One fixed ID, ``org.openedx.frontend.authoring.xblock_editor.v1``, rendered for
every block type with ``blockType`` passed as a plugin prop.

The naive form, ``keepDefault: false`` plus ``Insert``, does not work: it
removes the built-in editor for every block type at once, so a games plugin
would silently take out the HTML and problem editors.

The workable form uses the framework's ``Wrap`` operation on
``default_contents``. The wrapper receives the built-in editor as its
``component`` prop and the block type in ``pluginProps``; it renders its own
editor when the type matches and returns ``component`` unchanged otherwise.
``keepDefault`` stays ``true``. This preserves the defaults correctly and keeps
the slot ID static and literal, in line with the framework convention.

It was not chosen for two reasons.

* **Routing needs an additional contract.** With one shared ID, the slot
  config says that *a* plugin exists but not which block types it covers, and
  the unit page cannot decide from the config alone whether to open this
  app's editor or the legacy modal. The plugin would have to declare its
  supported block types in some agreed way, for example an export the host
  reads or an operator-supplied list, and the host would need selection logic
  to consult it. That declaration can be a single source used for both routing
  and rendering, so it need not drift, but it is a new registration contract
  on top of the slot config. Per-type IDs get routing from the slot config the
  framework already defines.

* **Conditional selection adds logic.** Each wrapper must select its
  supported types and preserve the wrapped content otherwise, either directly
  or through a shared helper. Multiple wrappers also require defined behaviour
  when their supported types overlap.

The wrap approach remains a reasonable fallback if derived IDs are judged to
conflict too strongly with the naming convention. Switching would touch the
slot component, the unit-page router and the plugin's registration example,
and would add the declaration contract described above.

A fixed ID with the block type as a widget ID
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Keep one slot ID and rely on ``widgetId`` to target a block type. Rejected
because ``widgetId`` names a widget already in the slot; it does not select
which default content to render, and ``keepDefault`` still applies to the slot
as a whole.

Consequences
------------

* The set of slot IDs is open-ended. Documentation describes the pattern and
  the ``<blockType>`` rule rather than listing each ID. The slot README does
  this, and any future slot catalogue should list the pattern with a note that
  the segment is a block type name.

* The framework's naming convention gains a variant: an identifier that is
  parameterised by a runtime value, and possibly an extra segment depending on
  the shape chosen above. If the community wants either as a general rule, it
  should be proposed upstream in frontend-plugin-framework; this ADR only
  records the decision for this slot.

* Two plugins configured for the same block type are not arbitrated. The
  framework renders every configured plugin in priority order, so two
  ``Insert`` operations on the games ID render two editors together. Operators
  configuring more than one plugin for a type are responsible for using
  ``Hide``, ``Modify`` or ``Wrap`` so that one editor results. The host does
  not detect or warn about this.

* Versioning follows the convention unchanged. A breaking change to the slot's
  props or placement bumps ``v1`` to ``v2`` for the pattern as a whole, and the
  deprecation process in the framework ADR applies.

* A plugin that edits several block types registers once per type. That is
  deliberate: it keeps each registration's effect local, at the cost of some
  repetition in ``env.config.jsx``.

* Anything in the host that asks "is there a plugin for this block type" must
  check the canonical ID and its aliases together and use the last configured
  entry, the same way ``PluginSlot`` does. ``xblockEditorSlotIds`` exists for
  that purpose.

References
----------

* `Slot naming and life cycle`_ (frontend-plugin-framework ADR 0003)
* ``src/plugin-slots/XBlockEditorSlot/README.md``
* `frontend-plugin-framework README`_, "Plugin Operations"

.. _slot naming ADR: https://github.com/openedx/frontend-plugin-framework/blob/master/docs/decisions/0003-slot-naming-and-life-cycle.rst
.. _Slot naming and life cycle: https://github.com/openedx/frontend-plugin-framework/blob/master/docs/decisions/0003-slot-naming-and-life-cycle.rst
.. _frontend-plugin-framework README: https://github.com/openedx/frontend-plugin-framework#plugin-operations
