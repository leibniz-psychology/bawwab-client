bawwab-client
=============

This is the web frontend for bawwab_.  It is a JavaScript application
based on VueJS_ and `VueJS router`_.

(This software is probably not very useful to you. It is heavily branded and
has lots of hard-coded assumptions.)

.. _bawwab: https://github.com/leibniz-psychology/bawwab
.. _VueJS: https://vuejs.org/
.. _VueJS router: https://router.vuejs.org/

You can run start a shell containing a full development environment and
build the app using:

.. code:: console

	guix shell -L contrib/guix -D bawwab-client nginx
	make

Then you can serve that application on port 8080 using:

.. code:: console

	make run

If you make change, run ``make`` again.

You can also build and and run a backend-independent version with mocked API calls. Run

.. code:: console

	make run MOCK=1

Coding style
------------

CSS class names
^^^^^^^^^^^^^^^

For non-overriding, non-marker, non-framework-bound classes we use a
mixture of the BEM and EnduringCSS naming-conventions:

.. code-block::

    .[micronamespace][-blockContextOrComponent][_descendantNode][--modifier]

where ``micronamespace`` is a flat-case abbreviation of up
to 3 chars to communicate context and make it easier to avoid
collisions. ``blockContextOrComponent`` describes a visual block we want
to style (e.g. an item in a list). ``modifier`` is used to communicate
state or variants of an element.

Example: ``.faq-toc_container--hide``

List of micro-namespaces:

app
	things that (currently) do not have a more specific defining context
faq
	things in the broader context of the faq-page
av
	application-view
ac
	account-view
lp
	landing-page-view
tos
	things in the broader context of the tos(-prompt)
we
	workspace-export-view
wp
	workspace-package-view
wsp
	workspace-security-prompt-view
wsh
	workspace-share-view
ws
	workspace-show-view

