import { get as pmget, run as pmrun } from './processManager';

export async function groupCreate (name) {
	const token = 'usermgr-' + Date.now();
	await pmrun (token, ['usermgr', 'g', 'create', name], null, null);
	const p = await pmget (token);
	const ret = await p.wait ();
	const data = await p.getObject ();
	console.debug ('data is' + data + ' ret is ' + ret);
	if (ret == 0 && data.status == 'ok') {
		return data;
	} else {
		throw Error (data.status);
	}
}

export async function groupDelete (name) {
	const token = 'usermgr-' + Date.now();
	await pmrun (token, ['usermgr', 'g', 'delete', name], null, null);
	const p = await pmget (token);
	const ret = await p.wait ();
	const data = await p.getObject ();
	console.debug ('data is' + data + ' ret is ' + ret);
	if (ret == 0 && data.status == 'ok') {
		return True;
	} else {
		throw Error (data.status);
	}
}

