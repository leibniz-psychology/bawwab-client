/* This file will be injected into app.js and sets up a service worker
 * for mocking. It also overrides the WebSocket class. */

import { privateData, publicData } from '../config';
import { NotImplemented, LostMessage, unixUser, makeWord, makeSentence, randomInt, delay, makeStrDate } from './common';
import i18n from '../i18n';
import { mount } from '../app';

function argparse (args) {
    /* Argument parser, does not support long options. */
	const kvargs = new Map ();
	const posargs = [];

	let i = 0;
	while (i < args.length) {
		const a = args[i];
		if (a[0] == '-') {
			if (posargs.length > 0) {
				/* If a kvarg follows a posarg assume it’s a subparser and quit. */
				break;
			} else if (a[1] != '-') {
				/* Short argument, only one dash */
				const k = a.slice (1);
				const v = args[i+1];
				let l = kvargs.get (k);
				if (l === undefined) {
					l = [];
					kvargs.set (k, l);
				}
				if (!(v[0] == '-')) {
					l.push (v);
					i += 2;
				} else {
					/* Probably argument without options */
					i++;
				}
			} else if (a == '--') {
				/* Two leading dashes indicate there are no more args. Stop parsing */
				break;
			} else {
				/* Unsupported long option */
				throw new NotImplemented ();
			}
		} else {
			posargs.push (a);
			i++;
		}
	}

	return {kvargs, posargs, rest: args.slice (i)};
}

function makePermissions (owner, isPublic=false) {
	const permissions = {"user": {}, "group": {}, "other": isPublic ? "rx" : ""};
	const n = randomInt (0, 3);
	for (let i = 0; i < n; i++) {
		permissions.group[makeWord(5, 10)] = Math.random () < 0.5 ? "rx" : "rwx";
	}
	permissions.user[owner] = "rwxTt";
	if (owner != unixUser) {
		permissions.group[unixUser] = Math.random () < 0.5 ? "rx" : "rw";
	}
	return permissions;
}

function makeApplication () {
	const name = makeSentence (1, 2);
	return {"version": "1.1",
		"type": "Application",
		name,
		"tryexec": "/gnu/store/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-psychnotebook-app-invalid-0.1/bin/startinvalid",
		"exec": "/gnu/store/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-psychnotebook-app-invalid-0.1/bin/startinvalid",
		"keywords": "PsychNotebook",
		"categories": "Science;Development",
		"description": makeSentence (4, 10),
		"description[de]": makeSentence (4, 10),
		"icon": makeWord (4, 8),
		"interfaces": "org.leibniz-psychology.conductor.v1",
		"_id": `org.psychnotebook.${makeWord (4, 8)}.desktop`};
}

function makeWorkspace () {
	const user = Math.random () < 0.8 ? unixUser : makeWord (5, 10);
	const isPublic = Math.random () < 0.2;
	const permissions = makePermissions (user, isPublic);
	const name = makeSentence (1, 4);
	const _id = makeWord (10, 10),
			description = makeSentence (5, 10);
	const applications = [];
	const numApplications = randomInt (1, 4);
	for (let j = 0; j < numApplications; j++) {
		applications.push (makeApplication ());
	}
	applications.push ({"name": "Shell",
			"exec": null,
			"_id": "org.leibniz-psychology.mashru3.shell"});
	return {"path": publicData + "/" + _id,
		"profilePath": "/gnu/store/",
		"metadata": {"version": 1,
			_id,
			"created": new Date (),
			"modified": new Date (),
			"creator": user,
			name,
			description},
		permissions,
		applications,
		"packages": [
			{"name": "tini",
			"version": "0.18.0",
			"output": "out",
			"path": "/gnu/store/iwl2q98bb8s5pnb0rs9jsr88iv2b0kzy-tini-0.18.0"}]};
}


class ExitCode {
	constructor (code) {
		this.code = code;
	}
}

function makeVersion () {
	let v = [];
	let n = randomInt (1, 4);
	for (let i = 0; i < n; i++) {
		v.push (randomInt (0, 100));
	}
	return v.join ('.');
}

function makePackage () {
	return {
			"name": makeWord (3, 7),
			"version": makeVersion (),
			"output": "out",
			"path": "/gnu/store/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-invalid-0.1",
			"synopsis": makeSentence (5, 15),
			relevance: 0,
			};
}

async function* runWorkspace (args) {
	/* Emulate the `workspace` command. Only returns valid results, but
	 * completely stateless and thus does not preserve any changes */
	console.log ('mock: runWorkspace', args);
	const { kvargs, posargs, rest } = argparse (args);
	const { kvargs: subkvargs, posargs: subposargs, rest: subrest } = argparse (rest);
	console.log ('mock: runWorkspace', kvargs, posargs, subkvargs, subposargs, subrest);

	/* emulate command latency */
	await delay (randomInt (500, 1500));

	switch (posargs[0]) {
		case 'list': {
			for (let i = 0; i < 5; i++) {
				yield makeWorkspace ();
			}
			yield new ExitCode (0);
			break;
		}

		case 'share':
		case 'import':
		case 'create':
		case 'copy':
		case 'modify': {
			yield makeWorkspace ();
			yield new ExitCode (0);
			break;
		}

		case 'package': {
			switch (posargs[1]) {
				case 'installed':
				case 'search':
					for (let i = 0; i < 5; i++) {
						yield makePackage ();
					}
					yield new ExitCode (0);
					break;

				case 'upgrade':
				case 'modify': {
					yield makeWorkspace ();
					yield new ExitCode (0);
					break;
				}

				default:
					yield new ExitCode (1);
					break;
			}
			break;
		}

		case 'export': {
			/* XXX: This causes the browser to navigate */
			yield {'path': `${privateData}/${unixUser}/.cache/invalidBackup.zip`}
			yield new ExitCode (0);
			break;
		}

		case 'run': {
			/* emulate conductor */
			yield {state: 'connect', user: unixUser, host: 'invalid', port: 0};
			yield {state: 'controlConnect', path: '/invalid', banner: 'banner'};
			await delay (5000);
			/* Use the same location. The service worker will deliver dummy data */
			yield {state: 'live', config: {auth: '123', key: '123', urls: [window.location.host]}};
			await delay (60000);
			yield {state: 'dead'};
			yield new ExitCode (0);
			break;
		}

		default:
			/* Invalid subcommand */
			yield new ExitCode (1);
			break;
	}
}

async function* runTrash (args) {
	/* This is fine. */
	yield new ExitCode (0);
}

/* Emulate the `env` command, but ignore everything that comes before
 * and just run the command itself */
async function* runEnv (args) {
	const { kvargs, posargs, rest } = argparse (args);
	let i = 0;
	for (i = 0; i < posargs.length; i++) {
		const a = posargs[i];
		if (a.startsWith ('-') || a.includes ('=')) {
			continue;
		}
		break;
	}
	const newArgs = posargs.slice (i);
	console.log ('mock: runEnv: running new command', newArgs);
	for await (let l of exec (newArgs)) {
		yield l;
	}
}

/* XXX: Not emulated right now. */
async function* runBorg (args) {
	const [subcmd, ...rest] = args;

	switch (subcmd) {
		case 'list': {
			let archives = [];
			const n = randomInt (1, 5);
			for (let i = 0; i < n; i++) {
				archives.push ({
								"archive": makeStrDate (),
								"barchive": makeStrDate (),
								"comment": makeSentence (1, 5),
								"id": makeWord (32, 32),
								"name": "auto-" + makeStrDate (),
								"start": makeStrDate (),
								"time": makeStrDate (),
								"username": unixUser
							});
			}
			yield {
						archives,
						"encryption": {
							"mode": "none"
						},
						"repository": {
							"id": makeWord (32, 32),
							"last_modified": makeStrDate (),
							"location": "/invalid"
						}
					}
			yield new ExitCode (0);
			break;
		}

		case 'create':
			yield {
					"archive": {
						"command_line": [
							"borg",
							"create",
						].concat (rest),
						"duration": 0.013842,
						"end": makeStrDate (),
						"id": makeWord (32, 32),
						"limits": {
							"max_archive_size": 0.00002880102066239582
						},
						"name": "manual-" + makeStrDate (),
						"start": makeStrDate (),
						"stats": {
							"compressed_size": 2970,
							"deduplicated_size": 1899,
							"nfiles": 5,
							"original_size": 8330
						}
					},
					"cache": {
						"path": "/invalid",
						"stats": {
							"total_chunks": 11,
							"total_csize": 5691,
							"total_size": 14830,
							"total_unique_chunks": 8,
							"unique_csize": 4620,
							"unique_size": 12785
						}
					},
					"encryption": {
						"mode": "none"
					},
					"repository": {
						"id": makeWord (32,32),
						"last_modified": makeStrDate (),
						"location": "/invalid"
					}
				}
			yield new ExitCode (0);
			break;

		case 'extract':
		case 'recreate':
		case 'rename':
		case 'delete':
		case 'prune':
			yield new ExitCode (0);
			break;

		default:
			yield new ExitCode (1);
			break;
	}

}

/* Emulate conductor’s output */
async function conductor (token, command, extraData, f) {
	let ret = 127;

	openWebsocket.feedMessage ({notify: 'processStart', command, extraData, token});

	for await (let l of f) {
		console.log ('mock: conductor: program returned line', l);
		let t = null;
		if (l instanceof ExitCode) {
			t = 'ExitCode';
		} else {
			t = typeof l;
		}
		switch (t) {
			case 'ExitCode':
				ret = l.code;
				break;

			case 'object':
				l = JSON.stringify (l) + '\n';
				/* no break */

			case 'string':
				/* passthrough */
				openWebsocket.feedMessage ({notify: 'processData', kind: 'stdout', data: l, token});
				break;

			default:
				throw new NotImplemented ();
		}
	}
	openWebsocket.feedMessage ({notify: 'processExit', status: ret, signal: null, token});
}

/* Map from program name to function */
const execLookup = {
	'workspace': runWorkspace,
	'trash': runTrash,
	'env': runEnv,
	'borg': runBorg,
	};

/* Run command with arguments argv */
async function* exec (argv) {
	const [program, ...args] = argv;
	const f = execLookup[program];

	/* Forward data to caller, there is no `async yield*` */
	if (f) {
		for await (let l of f (args)) {
			yield l;
		}
	} else {
		/* not found */
		console.log ('mock: exec: command not found', argv);
		yield new ExitCode (127);
	}
}

let openWebsocket = null;

export class WebSocket {
	constructor (path) {
		console.log ('mock: WebSocket: creating mocked websocket to', path);
		openWebsocket = this;
		this.listeners = new Map ();
	}

	addEventListener (name, handler) {
		console.log ('mock: addEventListener', name, handler)
		let l = this.listeners.get (name);
		if (!this.listeners.has (name)) {
			l = [];
			this.listeners.set (name, l);
		}
		l.push (handler);

		if (name === 'open') {
			/* Assuming the connection is opened immediately, but only after listening. */
			this.feedEvent ('open', null);
		}
	}

	feedEvent (name, data) {
		console.log ('mock: feedEvent', name, data);
		const listeners = this.listeners.get (name);
		if (listeners === undefined || listeners.length == 0) {
			console.log ('mock: feedEvent: message lost', name, data);
			throw new LostMessage ();
		}
		for (let handler of listeners) {
			console.log ('mock: feedEvent: feeding', name, data, 'to', handler);
			handler (data);
		}
	}

	feedMessage (payload) {
		console.log ('mock: feedMessage', payload);
		this.feedEvent ('message', {data: JSON.stringify (payload)});
	}
}

/* We need to install a service worker in order to catch image loads */
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.addEventListener('controllerchange', function (e) {
		console.log ('mock: controller change', e);
		mount ();
	});

	navigator.serviceWorker.register('/assets/serviceworker.js', {
		scope: '/',
		type: 'module'
	}).then(function (registration) {
		if (navigator.serviceWorker.controller) {
			mount ();
		}
	}).catch (function (error) {
		alert (`Error loading service worker: ${error}`);
	});
	/* We cannot intercept/run WebSockets in the service worker,
	 * so whenever a program is started it’ll send us a message */
	navigator.serviceWorker.addEventListener('message', function(event) {
		const msg = event.data;
		console.log ('mock: message:', msg);
		switch (msg.type) {
			case 'processStart': {
				const req = msg.req;
				console.log ('mock: processStart', req);
				conductor (req.token, req.command, req.extraData,
						exec (req.command)).then (() => {});
				break;
			}

			case 'action': {
				/* Let’s assume it’s a share action */
				const req = msg.req;
				/* No arguments required for mock */
				const command = ['workspace', 'share'];
				console.log ('mock: processStart', req);
				conductor (req.token, command, req.extraData,
						exec (command)).then (() => {});
				break;
			}

			default:
				throw new NotImplemented ();
		}
	});
} else {
	alert ('This demo does not work without service workers. You need a newer browser.');
}

/* Add a new dummy language */
i18n.global.setLocaleMessage ('ud', {});
