import Permissions from './permissions.js';

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
		return this.permissions.other.canRead ();
	}

	/* Return true if the project is shared with others */
	get isShared () {
		return Object.keys (this.permissions.acl.group).length > 0 ||
				Object.keys (this.permissions.acl.user).length > 0;
	}

	get sharedGroups () {
		return Object.keys (this.permissions.acl.group);
	}

	get id () {
		return this.metadata._id;
	}

	/* Retrive the owners of this workspace.
	 */
	owner () {
		return Object.keys (this.permissions.user);
	}

	/* All applications runnable in the web client
	 */
	runnableApplications () {
		const ret = [];
		if (!this.permissions.mine.canRun ()) {
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


