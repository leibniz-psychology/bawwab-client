export default class UnixUser {
	constructor (name, uid, gid, homedir, shell, gecos) {
		this.name = name;
		this.uid = uid;
		this.gid = gid;
		this.homedir = homedir;
		this.shell = shell;
		this.gecos = gecos;
	}

	static fromObject (o) {
		return new UnixUser (o.name, o.uid, o.gid, o.homedir, o.shell, o.gecos);
	}

	get nick () {
		return this.gecos ?? this.name;
	}
}
