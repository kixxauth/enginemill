Enginemill
==========
[![npm version](https://badge.fury.io/js/enginemill.svg)](https://badge.fury.io/js/enginemill)

Enginemill is a content database, rendering, and publishing tool using Node.js.

Architecture
------------
- An in-process database keeps records.
- Records are stored as a directory with two files inside: A data file and a meta file. The data file is the image, markdown, css, js, or whatever. The meta file contains the record type, ID and any other useful information.
- Records can be created, edited, and deleted using a text editor or normal command line operations.
- A `$ db validate` command can be run which updates all the meta files and validates the state of the database.
- Links are stored as a single configuration file.
- Links provide a resource URI and a "link" to the record ID which represents that resource.
- A build tool uses the links to create content which is placed in a dist folder.

Copyright and License
---------------------
Copyright: (c) 2014 - 2019 by Kris Walker <kris@kixx.name> (http://www.kixx.name/)

Unless otherwise indicated, all source code is licensed under the MIT license. See MIT-LICENSE for details.
