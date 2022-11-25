import { get as pmget, run as pmrun, getToken } from './processManager';

export class UsermgrError extends Error {
}

export class UsermgrNotAMember extends UsermgrError {
}

export async function groupCreate (name) {
	const token = getToken ();
	await pmrun (token, ['usermgr', 'g', 'create', name], null, null);
	const p = await pmget (token);
	const ret = await p.wait ();
	const data = await p.getObject ();
	console.debug ('data is' + data + ' ret is ' + ret);
	if (ret == 0 && data.status == 'ok') {
		return data;
	} else {
		throw new UsermgrError (data.status);
	}
}

export async function groupDelete (name) {
	const token = getToken ();
	await pmrun (token, ['usermgr', 'g', 'delete', name], null, null);
	const p = await pmget (token);
	const ret = await p.wait ();
	const data = await p.getObject ();
	console.debug ('data is' + data + ' ret is ' + ret);
	if (ret == 0 && data.status == 'ok') {
		return true;
	} else {
		if (data.status === 'not_a_member') {
			throw new UsermgrNotAMember ();
		} else {
			throw new UsermgrError (data.status);
		}
	}
}

