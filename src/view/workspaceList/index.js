import { store } from '../../app.js';
import { queryParamProp } from '../../utils.js';
import Workspace from '../../workspace.js';
import { copy } from "../../workspaceUtil";
import template from './template.html';
import { trackEvent } from "../../matomo.js";
import TooltipComponent from "../../component/tooltip";
import './style.css';

export default {
	name: 'WorkspaceListView',
	template: template,
	data: _ => ({
		state: store.state,
		name: '',
		}),
	components: {
		tooltip: TooltipComponent,
	},
	mounted: function () {
	},
	computed: {
		workspaces: function () { return this.state.workspaces; },
		disabled: function() { return !this.state.workspaces; },
		username: function () { return this.state.user?.name; },
		filteredWorkspaces: function () {
			const filterFunc = {
				mine: w => w.permissions.mine.canShare (),
				shared: w => !w.permissions.mine.canWriteNamedAttributes () && !w.isPublic,
				world: w => w.isPublic,
				};
			const searchFunc = function (w) {
				const s = this.filtertext;
				if (s) {
					const sl = s.toLowerCase ();
					const searchFields = ['name', 'description'];
					return searchFields.reduce ((last, name) => last || w.metadata[name]?.toLowerCase().indexOf (sl) != -1, false);
				} else {
					return true;
				}
			}.bind (this);
			if (!this.disabled) {
				const f = w => [filterFunc[this.filter], searchFunc].reduce ((last, g) => last && g(w), true)
				return this.state.workspaces.all().filter (f).sort (Workspace.compareName);
			} else {
				return [];
			}},
		filter: queryParamProp ('filter', 'mine'),
		filtertext: queryParamProp ('search', ''),
	},
	methods: {
		copy,
        createWorkspace: async function() {
			const w = await this.state.workspaces.create (this.name);
			trackEvent ('projects', 'project-created');
			await this.$router.push ({name: 'workspace', params: {wsid: w.metadata._id}});
        },
		goTo: async function (wsid) {
			await this.$router.push ({name: 'workspace', params: {wsid: wsid}});
		},
	}
};

