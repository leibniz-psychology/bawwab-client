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

