import { postData } from './helper.js';

/* Unix user
 */
export default class User {
	constructor (name, motd, loginStatus) {
		this.name = name;
		this.motd = motd;
		this.loginStatus = loginStatus;
	}

	static fromJson (j) {
		return new User (j.name, j.motd, j.loginStatus);
	}

	static async get () {
		let url = '/api/user';
		const r = await fetch (url);
		const j = await r.json ();
		if (r.ok) {
			return User.fromJson (j);
		} else {
			throw Error (j.status);
		}
	}

	static async create (info) {
		const r = await postData ('/api/user', {
				firstName: info.given_name,
				lastName: info.family_name,
				username: info.preferred_username,
				email: info.email,
				orcid: info.orcid,
				});
		const j = await r.json ();
		if (r.ok) {
			return User.fromJson (j);
		} else {
			throw Error (j.status);
		}
	}

	async acceptTos () {
		const r = await postData ('/api/user/acceptTos');
		const j = await r.json ();
		if (r.ok) {
			this.name = j.name;
			this.motd = j.motd;
			this.loginStatus = j.loginStatus;
			return true;
		} else {
			throw Error (j.status);
		}
	}
}

