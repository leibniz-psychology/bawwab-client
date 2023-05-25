import { store } from '../../app.js';
import { publicData, privateData } from '../../config';
import { queryParamProp } from '../../utils';
import { get as pmget, run as pmrun, getToken } from '../../processManager';
import template from './template.html';
import "./style.css";

export default {
	name: 'WorkspaceExportEverythingView',
	props: ['wsid'],
	template: template,
	data: _ => ({
		state: store.state,
		program: null,
		success: null,
	}),
	computed: {
		target: queryParamProp ('target', ''),
		targetUrl: function () {
			const r = new RegExp (".+@(.+):/.+", "i");
			return r.exec (this.target)[1];
		},
		next: queryParamProp ('next', null),
		password: function () { return this.$router.currentRoute.value.hash.slice (1); },
		canExport: function () { return this.password; },
		title: function() { return this.$t('v.workspaceExportEverything.title'); },
		closeLink: function () {
			return this.next ?? {name: 'workspaces'};
		},
	},
	methods: {
		run: async function() {
			const user = this.state.user;
			const directory = `${publicData}/${user.name}/`;
			const token = getToken ();
			const passwordPath = `${privateData}/${user.name}/.exportPassword-${token}`;

			try {
				/* Put the password into a temporary file, so it’s not exposed through
				* the commandline (via sshpass’ -p option) */
				const r = await fetch (`/api/filesystem${passwordPath}`, {method: 'PUT', body: this.password});
				if (r.ok) {
					await pmrun (token, ['sshpass', '-f', passwordPath, 'rsync', '-av', directory, this.target], null, null);
					const p = await pmget (token);
					this.program = p;
					const ret = await p.wait ();

					this.success = ret == 0;

					if (this.next) {
						document.location = this.next;
					}
				} else {
					throw 'failed';
				}
			} finally {
				let r = await fetch (`/api/filesystem${passwordPath}`, {
					'method': 'DELETE'
				});
			}
		},
	},
};

