RG Changelog
############

All notable changes to this project will be documented in this file.

The format is based on `Keep a Changelog <https://keepachangelog.com/en/1.0.0/>`_,
and this project adheres to customized Semantic Versioning e.g.: `verawood-rg.1`

[Unreleased]
************

Added:
======
* ``TextEditorPluginSlot`` and ``ProblemEditorPluginSlot`` so plugins can inject UI into the HTML and Problem editors (AILab-146)

Removed:
========
* codecov CI action, and the ``coverage`` job left with nothing to do — the fork has no codecov project, so the step failed every run (VERA-6)
