export default class Permissions {
	constructor (s) {
		this.s = s;
	}

	/* Current user is allowed to read files of this project.
	 */
	get canRead () {
		return this.s.includes ('r');
	}

	/* Current user is allowed to write files of this project.
	 */
	get canWrite () {
		return this.s.includes ('w');
	}

	/* Current user can run applications.
	 */
	get canRun () {
		return this.canWrite;
	}

	/* Usually only the owner can
	 */
	get canWriteNamedAttributes () {
		return this.s.includes ('T');
	}

	/* Current user can delete files. In theory having 'w' is enough, but don’t
	 * advertise it. */
	get canDelete () {
		return this.canWriteNamedAttributes;
	}
}
