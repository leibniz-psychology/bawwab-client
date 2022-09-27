import Permissions from './permissions.js';
import UnixUser from './unixuser.js';

/* A single workspace.
 */
export default class Workspace {
	constructor (o) {
		Object.assign (this, o);

		function convertPermissions (o) {
			for (const id in o) {
				o[id] = new Permissions (o[id]);
			}
		}
		convertPermissions (this.permissions.user);
		convertPermissions (this.permissions.group);
		convertPermissions (this.permissions.acl.user);
		convertPermissions (this.permissions.acl.group);
		this.permissions.mine = new Permissions (this.permissions.mine);
		this.permissions.other = new Permissions (this.permissions.other);

		let newusers = new Map ();
		for (const u of Object.values (this.users)) {
			const newu = UnixUser.fromObject (u);
			newusers.set (newu.name, newu);
		}
		this.users = newusers;
	}

	/* Compare workspace names for .sort()
	 */
	static compareName (a, b) {
		const x = a.metadata.name ? a.metadata.name.toLowerCase () : '',
			y = b.metadata.name ? b.metadata.name.toLowerCase () : '';
		if (x == y) {
			return 0;
		} else if (x > y) {
			return 1;
		} else {
			return -1;
		}
	}

	get isPublic () {
		return this.permissions.other.canRead;
	}

	/* Return true if the project is shared with others */
	get isShared () {
		return Object.keys (this.permissions.acl.group).length > 0 ||
				Object.keys (this.permissions.acl.user).length > 0;
	}

	get sharedGroups () {
		return Object.keys (this.permissions.acl.group);
	}

	get sharedUsers () {
		let users = new Set ();
		for (let name of this.sharedGroups) {
			const group = this.groups[name];
			/* We don’t have any information about this group */
			if (group === undefined) {
				continue;
			}
			for (let name of group.members) {
				const u = this.users.get (name);
				if (u !== undefined) {
					users.add (u);
				}
			}
		}
		return users;
	}

	/* User can share project read-only */
	get canShareRead () {
		return this.permissions.mine.canRead && !this.isPublic;
	}

	/* User can share project read-write */
	get canShareWrite () {
		return this.permissions.mine.canWrite && !this.isPublic;
	}

	/* User can share project (any mode) */
	get canShare () {
		return this.canShareRead || this.canShareWrite;
	}

	get id () {
		return this.metadata._id;
	}

	/* Retrive the owners of this workspace.
	 */
	owner () {
		return Object.keys (this.permissions.user);
	}

	get ownerUsers () {
		let users = [];
		for (let name of this.owner ()) {
			const u = this.users.get (name);
			if (u !== undefined) {
				users.push (u);
			}
		}
		return users;
	}

	/* All applications runnable in the web client
	 */
	runnableApplications () {
		const ret = [];
		if (!this.permissions.mine.canRun) {
			return ret;
		}
		for (const a of this.applications) {
			const interfaces = a.interfaces ? a.interfaces.split (',') : [];
			if (interfaces.some (x => x.indexOf ('org.leibniz-psychology.conductor') == 0)) {
				ret.push (a);
			}
		}
		return ret;
	}
}


