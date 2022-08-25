import { store } from '../../app.js';
import template from './template.html'
import { trackEvent } from '../../matomo.js';
import { groupDelete, UsermgrNotAMember } from '../../usermgr';

export default {
	name: 'WorkspaceDeleteView',
	props: ['wsid'],
	template: template,
	data: _ => ({
		state: store.state,
	}),
	computed: {
		workspaces: function () { return this.state.workspaces; },
		workspace: function () {
			return this.workspaces ? this.workspaces.getById (this.wsid) : null;
		},
		permissions: function () {
			return this.workspace?.permissions.mine;
		},
		canDelete: function () {
			return this.permissions?.canDelete () ?? false;
		},
	},
	methods: {
        deleteWorkspace: async function() {
			const ws = this.workspace;
			if (this.canDelete) {
				await this.workspaces.delete (ws);
				trackEvent ('projects', 'project-deleted');
			} else if (ws.isShared) {
				/* Make sure we are not part of any group
				 * any more (there may be more than one) */
				for (let g of ws.sharedGroups) {
					try {
						await groupDelete (g);
					} catch (e) {
						if (e instanceof UsermgrNotAMember) {
							/* pass */
						} else {
							throw e;
						}
					}
				}
				/* There is no way to figure out which projects are actually affected
				 * by removing group membership. While we only assign one group to one
				 * project it is theoretically possible to have one group for multiple
				 * projects. Also it’s difficult to broadcast this change through the
				 * event manager mechanism, so reloading refreshes the other clients
				 * too. And finally this way we update the current SSH user’s permissions.
				 */
				await this.workspaces.fetch ({useNewConnection: true});
			} else {
				await this.workspaces.ignore (ws);
			}
			await this.$router.push ({name: 'workspaces'});
        },
	}
};

