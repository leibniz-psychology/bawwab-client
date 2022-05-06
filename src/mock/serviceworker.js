import { privateData } from '../config';
import { NotImplemented, unixUser, makeWord, makeSentence, makeStrDate, randomInt } from './common';
import dragon from '../img/dragon.svg';

self.addEventListener('install', function(e) {
	/* activate this worker immediately, without reload */
	self.skipWaiting();
});

self.addEventListener('activate', function(e) {
	e.waitUntil (clients.claim ());
});

function randomColor () {
	/* These colors should work with black as foreground color, sampled from https://offeo.com/learn/20-pastel-spring-summer-color-palettes */
	const palette = ['#CCD4BF', '#E7CBA9', '#EEBAB2', '#F5F3E7', '#F5E2E4',
			'#C6C9D0', '#D5E4C3', '#B8E0F6', '#DDF2F4', '#E4CEE0', '#F7CE76'];
	return palette[randomInt (0, palette.length)];
}

async function handleSession (request, path) {
	const o = {
			name: 'examplesession',
			oauthInfo: {"sub":"cddd3c04-dba0-448b-b8f9-bc182fa5594a",
					"email_verified":true,
					"name":"Mock User",
					"preferred_username": unixUser,
					"given_name":"Mock",
					"family_name":"User",
					"email":"mockuser@example.com"
			},
			created: new Date (),
			accessed: new Date (),
			};
	return new Response (JSON.stringify (o), {status: 200, statusText: 'OK', headers: {}});
}

async function handleUser (request, path) {
	const o = {
			status: 'ok',
			name: unixUser,
			password: 'examplepassword',
			motd: 'This is a test application. Everything you do will be lost upon closing the browser window. No data is stored on any server.',
			loginStatus: 'success',
			};
	return new Response (JSON.stringify (o), {status: 200, statusText: 'OK', headers: {}});
}

async function messageToClient (msg) {
	/* Not sure this is correct */
	const clients = await self.clients.matchAll()
	return await Promise.all(clients.map(client => client.postMessage(msg)));
}

async function handleProcess (request, path) {
	if (request.method == 'POST') {
		const req = await request.json ();
		const o = {
				status: 'ok',
				token: req.token,
				};
		if (req.command) {
			messageToClient ({type: 'processStart', req});
		} else if (req.action) {
			messageToClient ({type: 'action', req});
		}
		return new Response (JSON.stringify (o), {status: 200, statusText: 'OK', headers: {}});
	} else if (request.method == 'DELETE') {
		/* We cannot terminate the process here, so just ignore it */
		return new Response (JSON.stringify ({'status': 'ok'}), {status: 200, statusText: 'OK', headers: {}});
	} else {
		return new Response ('', {status: 500, statusText: 'Server Error'});
	}
}

async function handleFilesystem (request, path) {
	/* Just ignore storing data */
	if (request.method == 'PUT') {
		const o = {status: 'ok'};
		return new Response (JSON.stringify (o), {status: 200, statusText: 'OK', headers: {}});
	}

	const filepath = '/' + path.slice (2).join ('/'),
			settingspath = privateData + '/' + unixUser + '/.config/bawwab/userStorage/settings.json';
	console.log ('mock: filesystem: ', filepath, settingspath);
	if (filepath == settingspath) {
		const o = {};
		return new Response (JSON.stringify (o), {status: 200, statusText: 'OK', headers: {}});
	} else if (filepath == `${privateData}/${unixUser}/.cache/invalidBackup.zip`) {
		return new Response ('', {status: 200, statusText: 'OK', headers: {'Content-Disposition': 'attachment; filename="invalidBackup.zip"'}});
	} else if (filepath.includes ('/.guix-profile/share/icons/hicolor/scalable/apps/')) {
		const file = path.slice (-1)[0];
		const icon = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
width="64"
height="64"
viewBox="0 0 64 64"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
xmlns:svg="http://www.w3.org/2000/svg">
<g>
<circle style="fill:${randomColor()}; stroke: white; stroke-width: 0.2em;" cx="32" cy="32" r="32" />
<text style="font-size: 32px; font-family: sans-serif; font-weight: bold; text-align: center;" x="20" y="44" ><tspan>${file[0].toUpperCase ()}</tspan></text>
</g>
</svg>`;
		return new Response (icon, {status: 200, statusText: 'OK', headers: {'Content-Type': 'image/svg+xml'}});
	}

	throw new NotImplemented ();
}

async function handleAction (request, path) {
	const o = {token: makeWord (32, 32), name: 'run', expires: makeStrDate (), usesRemaining: 100};
	console.log ('mock: handleAction: ', o);
	return new Response (JSON.stringify (o), {status: 200, statusText: 'OK'});
}

async function handleEmail (request, path) {
	const o = {'status': 'ok', 'message': makeSentence (50, 100)}
	return new Response (JSON.stringify (o), {status: 200, statusText: 'OK'});
}

async function handleTos (request, path) {
	const o = []
	for (let kind of ['privacy', 'tos']) {
		for (let language of ['de', 'en']) {
			o.push ({'id': makeWord (10, 10), language, kind, content: makeSentence (50, 100), effective: makeStrDate ()});
		}
	}
	return new Response (JSON.stringify (o), {status: 200, statusText: 'OK'});
}

async function mockedFetch (request) {
    console.log ('mock: fetch', request);

	const url = new URL (request.url);
	const resource = url.pathname;

	/* resource starts with a slash, so first element would be empty → slice */
	const path = resource.split ('/').slice (1);
	console.log ('mock: path is', path);
	if (path[0] == 'api') {
		const handler = {
				'session': handleSession,
				'user': handleUser,
				'process': handleProcess,
				'filesystem': handleFilesystem,
				'action': handleAction,
				'email': handleEmail,
				'tos': handleTos,
				};
		const f = handler[path[1]];
		if (f === undefined) {
			return new Response ('', {status: 500, statusText: 'Server Error'});
		} else {
			return await handler[path[1]] (request, path);
		}
	} else if (path[0] == '_conductor') {
		/* We cannot emulate applications */
		return new Response (dragon, {status: 200, statusText: 'OK', headers: {'Content-Type': 'image/svg+xml'}});
	} else {
		console.log ('mock: serving from web', path);
		return await fetch (request);
	}

}

self.addEventListener('fetch', (event) => {
	const request = event.request;
	console.log ('mock: fetch: mocked fetch', event, request, request.url);

	event.respondWith (mockedFetch (request));
});

