import { store } from '../../app.js';
import { getResponse } from '../../helper.js';
import { run as emrun } from '../../eventManager.js';
import Workspace from '../../workspace.js';
import template from './template.html';

export default {
	name: 'ActionView',
	props: ['token'],
	template: template,
	data: _ => ({
		running: true,
		message: null,
		state: store.state,
		}),
	created: async function () {
	 	console.debug ('executing action %s', this.token);
	 	const r = await fetch ('/api/action/' + this.token);
	 	try {
	 		const a = await getResponse (r);
	 		console.debug ('got action %o', a);
	 		switch (a.name) {
				case 'run': {
					console.debug ('got run action');
					const newws = await emrun ('workspaces.discover', a.extra, null, this.token);
					if (newws === null) {
						/* Can be a permission error or the workspace does not exist any more. */
						this.message = 'v.action.nows';
					} else {
						this.message = 'v.action.done';
						await this.$router.push ({name: 'workspace', params: {wsid: newws.metadata._id}});
					}
	 				break;
	 			}
	 		}
		} catch (e) {
			if (e.message == 'unauthenticated') {
				/* This should never happen. Logic handled by routing. */
				this.message = 'v.action.you-cant-cheat-death';
			} else {
				this.message = 'v.action.' + e.message;
			}
		} finally {
			this.running = false;
		}
	},
};

