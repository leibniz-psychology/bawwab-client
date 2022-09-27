import Workspace from './workspace.js';
import { ConductorClient } from './conductor.js';
import { publicData, privateData } from './config';
import { postData, getResponse } from './helper.js';
import { run as emrun, register as emregister } from './eventManager.js';
import { groupCreate } from './usermgr.js';

import { reactive } from 'vue/dist/vue.esm-bundler.js';

export default class Workspaces {
	constructor (user) {
		this.user = user;
		this.loading = false;
		this.workspaces = reactive (new Map ());
		this.applications = reactive (new Map ());

		/* welcome to “this hell” */
		const registerRunWithCb = (name, f) =>
			emregister (name, async function (args, p) {
				return f.bind (this) (args, await this.onRunWith (p));
			}.bind (this));

		registerRunWithCb ('workspaces.fetch', this.onFetch);

		registerRunWithCb ('workspaces.create', this.onCreate);
		/* use same callback */
		registerRunWithCb ('workspaces.copy', this.onCreate);
		registerRunWithCb ('workspaces.import', this.onCreate);

		registerRunWithCb ('workspaces.update', this.onUpdate);
		/* use the same callback */
		registerRunWithCb ('workspaces.share', this.onUpdate);
		registerRunWithCb ('workspaces.unshare', this.onUpdate);
		registerRunWithCb ('workspaces.packageModify', this.onUpdate);
		registerRunWithCb ('workspaces.packageUpgrade', this.onUpdate);

		registerRunWithCb ('workspaces.ignore', this.onIgnore);

		emregister ('workspaces.delete', this.onDelete.bind (this));
		emregister ('workspaces.start', this.onStart.bind (this));
		emregister ('workspaces.export', this.onExport.bind (this));
		emregister ('workspaces.packageSearch', this.onPackageSearch.bind (this));
		/* When a new workspace is added through an action */
		emregister ('workspaces.discover', this.onDiscover.bind (this));
	}

	/* Run workspace command with more arguments
	 */
	async runWith (name, ws, args, extraArgs=null, options={}) {
		let command = ['workspace', '-f', 'json'];
		if (ws) {
			command = command.concat (['-d', ws.path]);
		}
		if (args) {
			command = command.concat (args);
		}
		if (ws) {
			if (extraArgs === null) {
				extraArgs = ws.path;
			} else {
				extraArgs.path = ws.path;
			}
		}
		return await emrun (name, extraArgs, command, null, options);
	}

	async onRunWith (p) {
		const workspaces = await p.getAllObjects ();
		const ret = await p.wait ();
		if (ret == 0) {
			return workspaces.map (o => new Workspace (o));
		} else {
			throw Error ('unhandled');
		}
	}

	async fetch (options) {
		try {
			this.loading = true;
			return await this.runWith ('workspaces.fetch', null, [
					'list',
					'-s', publicData,
					'-s', privateData,
					], null, options);
		} catch (e) {
			this.workspaces.clear ();
			throw e;
		} finally {
			this.loading = false;
		}
	}

	onFetch (args, ret) {
		this.workspaces.clear ();
		for (const v of ret) {
			this.workspaces.set (v.id, v);
		}
	}

	async create (name) {
		return await this.runWith ('workspaces.create', null, [
				'-d', `${publicData}/${this.user.name}`,
				'create',
				name,
				]);
	}

	onCreate (args, ret) {
		const ws = ret[0] ?? null;
		if (ws !== null) {
			this.workspaces.set (ws.id, ws);
		}
		return ws;
	}

	async update (ws) {
		const args = ['modify'];
		for (const k in ws.metadata) {
			args.push (`${k}=${ws.metadata[k]}`);
		}
		return await this.runWith ('workspaces.update', ws, args);
	}

	onUpdate (path, ret) {
		const ws = this.getByPath (path);
		const newws = ret[0];
		this.workspaces.set (newws.id, newws);
		return newws;
	}

	async delete (ws) {
		return await emrun ('workspaces.delete', ws.path, ['trash', '--', ws.path]);
	}

	async onDelete (path, p) {
		const ws = this.getByPath (path);
		const ret = await p.wait ();
		if (ret == 0) {
			this.workspaces.delete (ws.id);
			return true;
		} else {
			throw Error ('unhandled');
		}
	}

	/* share workspace with a user, group or others
	 */
	async share (ws, spec, isWrite) {
		const args = ['share', spec];
		if (isWrite) {
			args.push ('-w');
		}
		return await this.runWith ('workspaces.share', ws, args);
	}

	async unshare (ws, spec) {
		const args = ['share', '-x', spec];
		return await this.runWith ('workspaces.unshare', ws, args);
	}

	async ignore (ws) {
		const args = ['ignore'];
		return await this.runWith ('workspaces.ignore', ws, args);
	}

	onIgnore (path, ret) {
		const ws = this.getByPath (path);
		this.workspaces.delete (ws.id);
	}

	async copy (ws) {
		const args = ['copy', `${publicData}/${this.user.name}/`];
		return await this.runWith ('workspaces.copy', ws, args);
	}

	async start (ws, a) {
		return await this.runWith ('workspaces.start', ws, ['run', a._id],
				{aid: a._id,
				/* need to persist the path, so send it to the server */
				profilePath: ws.profilePath});
	}

	async onStart (args, p) {
		const ws = this.getByPath (args.path);
		const c = reactive (new ConductorClient (p));
		const k = ws.metadata._id + '+' + args.aid;
		const a = ws.applications.filter (a => a._id == args.aid)[0];
		const v = {profilePath: args.profilePath, conductor: c};
		this.applications.set (k, v);
		/* keep the application if an error occurred */
		const handle = function () { if (!c.error) { this.applications.delete (k); } }.bind (this);
		c.run ().then (handle).catch (function (e) { console.error ('application run failed with', e); });
		return v;
	}

	async export (kind, ws) {
		const args = ['export', kind, `${privateData}/${this.user.name}/.cache`];
		return await this.runWith ('workspaces.export', ws, args);
	}

	async onExport (args, p) {
		const ret = await p.wait ();
		if (ret == 0) {
			return await p.getObject ();
		} else {
			throw Error ('unhandled');
		}
	}

	async import (path) {
		const args = ['import', path, `${publicData}/${this.user.name}`];
		return await this.runWith ('workspaces.import', null, args);
	}

	async packageSearch (ws, expression) {
		const args = ['package', 'search'].concat (expression);
		return await this.runWith ('workspaces.packageSearch', ws, args);
	}

	async onPackageSearch (args, p) {
		const results = await p.getAllObjects ();
		const ret = await p.wait ();
		if (ret == 0) {
			return results;
		} else {
			throw Error ('unhandled');
		}
	}

	async packageModify (ws, packages) {
		const args = ['package', 'modify', '--'].concat (packages);
		return await this.runWith ('workspaces.packageModify', ws, args);
	}

	async packageUpgrade (ws) {
		const args = ['package', 'upgrade']
		return await this.runWith ('workspaces.packageUpgrade', ws, args);
	}

	async onDiscover (args, p) {
		console.debug ('workspaces: onDiscover' + args + p);
		const ret = await p.wait ();
		if (ret == 0) {
			return await this.runWith ('workspaces.create', null,
					['-d', args.path, 'list'], null, {useNewConnection: true});
		} else {
			throw Error ('add failed');
		}
	}

	getRunningApplication (ws, a) {
		const k = ws.metadata._id + '+' + a._id;
		return this.applications.get (k);
	}

	resetRunningApplication (ws, a) {
		const k = ws.metadata._id + '+' + a._id;
		this.applications.delete (k);
	}

	getById (wid) {
		return this.workspaces.get (wid);
	}

	getByPath (path) {
		for (const [k, v] of this.workspaces) {
			if (v.path == path) {
				return v;
			}
		}
		return null;
	}

	all () {
		return Array.from (this.workspaces.values ());
	}

	/* Add a workspace
	 */
	add (ws) {
		this.workspaces.set (ws.id, ws);
	}

	async createShareUrl (ws, isWrite) {
		let group = null;

		if ((!isWrite && !ws.canShareRead) || (isWrite && !ws.canShareWrite)) {
			/* Project cannot be shared, so bail out early */
			return null;
		}

		for (const g in ws.permissions.acl.group) {
			const p = ws.permissions.acl.group[g];
			if (!isWrite && p.canRead && !p.canWrite) {
				group = g;
				console.debug (`workspaces: Using group ${group} for read-only sharing`);
			} else if (isWrite && p.canRead && p.canWrite) {
				group = g;
				console.debug (`workspaces: Using group ${group} for read-write sharing`);
			}
		}

		if (!group) {
			console.debug (`Creating group for workspace ${ws.id} ${isWrite}`);
			const name = ws.path.split ('/').pop () + (isWrite ? '-rw' : '-ro');
			const newgroup = await groupCreate (name);
			group = newgroup.group;
			await this.share (ws, `g:${group}`, isWrite);
		}

		console.debug (`Creating action for group ${group}`);
		/* {user} is a special symbol, which will be resolved upon evaluation
		 * of the action */
		const command = ['usermgr', 'g', 'add', group, '{user}'];
		const r = await postData('/api/action', {
				name: 'run',
				extra: {path: ws.path},
				command: command,
				/* 100 years (not kidding) */
				validFor: 100*365*24*60*60,
				/* yes, also not kidding */
				usesRemaining: 10**10,
				});
		const action = await getResponse (r);
		const token = action.token;

		const ident = 'share-' + (isWrite ? 'write' : 'readonly');
		return new URL (`/action/${token}#${ident}`, window.location.href);
	}
}

