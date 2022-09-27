import {store} from '../../app.js';
import {nextTick} from 'vue/dist/vue.esm-bundler.js';
import {copy} from "../../workspaceUtil";
import template from './template.html';
import './style.css';

export default {
	name: 'WorkspaceShowView',
	props: ['wsid'],
	template: template,
	data: _ => ({
		state: store.state,
		editable: false,
	}),
	mounted: async function () {
		if (!this.workspace || this.isOwnWorkspace) {
			return;
		}

		const firstVisit = !this.settings.get(this.workspaceAlreadyVisitedKey);
		if (!firstVisit) {
			return;
		}

		//if user specified to skip the pop-up, his autocopy-setting is the only thing that still matters
		const dontShowPopUp = (this.isReadOnlyWorkspace && this.settings.get('dontShowSharedReadOnlyPopUp'))
			|| (!this.isReadOnlyWorkspace && this.settings.get('dontShowSharedWriteAccessPopUp'));
		if (dontShowPopUp) {
			const autocopy = this.settings.get('autocopySharedReadOnly');
			if (autocopy && this.isReadOnlyWorkspace) {
				/* click the button, so there will be visual feedback */
				await this.$refs.copybtn.clicked ();
			}
			await this.setWorkspaceVisited();
		} else {
			await this.setWorkspaceVisited();
			await this.$router.push({ name: 'workspaceSecurityPrompt', params: { wsid: this.workspace.metadata._id } });
		}
	},
	computed: {
		settings: function () {
			return this.state.settings;
		},
		workspaces: function () { return this.state.workspaces; },
		username: function () { return this.state.user?.name; },
		workspace: function () {
			return this.workspaces?.getById (this.wsid);
		},
		isOwnWorkspace: function () { return this.workspace.owner().includes(this.username) },
		permissions: function () {
			return this.workspace?.permissions?.mine;
		},
		name: function () { return this.workspace.metadata.name },
		hasName: function () { return this.editable || this.workspace.metadata.name },
		description: function () { return this.workspace.metadata.description },
		hasDescription: function () { return this.editable || this.workspace.metadata.description },
		/* owners without us */
		owners: function () { return this.workspace.ownerUsers.filter (u => u.name != this.username); },
		/* user can edit project metadata */
		canEditMeta: function () { return this.permissions.canWrite; },
		isReadOnlyWorkspace: function () { return !this.permissions.canWrite; },
		workspaceAlreadyVisitedKey: function () { return `alreadyVisited${this.workspace.metadata._id}`; },
	},
	methods: {
		setWorkspaceVisited: async function () {
			this.settings.set (this.workspaceAlreadyVisitedKey, true);
			await this.settings.sync();
		},
		save: async function () {
			const name = this.$refs.title.value;
			const description = this.$refs.description.value;
			const w = this.workspace;

			w.metadata.name = name;
			w.metadata.description = description;
			await this.workspaces.update (w);

			this.editable = false;
		},
		deleteShare: async function (group) {
			await this.workspaces.unshare (this.workspace, `g:${group}`);
		},
		copy,
		makeEditable: function () {
			if (!this.canEditMeta) {
				return false;
			} else {
				this.editable = true;
				return true;
			}
		},
		makeTitleEditable: async function () {
			if (this.makeEditable()) {
				await nextTick ();
				this.$refs.title.focus ();
			}
		},
		makeDescriptionEditable: async function () {
			if (this.makeEditable()) {
				await nextTick ();
				this.$refs.description.focus ();
			}
		},
		discard: async function () {
			this.editable = false;
		},
	}
};

