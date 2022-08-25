import { store } from '../../app.js';
import { postData } from '../../helper.js';
import { queryParamProp } from '../../utils.js';
import template from './template.html';
import { trackEvent } from "../../matomo.js";
import { get as pmget, run as pmrun } from '../../processManager';
import { getResponse } from '../../helper';
import './style.css';

const SendStatus = Object.freeze ({
	unknown: 0,
	inprogress: 1,
	success: 2,
	failure: 3,
});

export default {
	name: 'WorkspaceShareView',
	props: ['wsid'],
	template: template,
	data: _ => ({
		state: store.state,

		/* share url for reading (false), writing (true) */
		shareUrl: {false: null, true: null},
		selectedShareUrl: false,
		emailAddressesInput: '',
		emailAddresses: [],
		emailMessage: '',
		emailQuotaReached: false,
		preview: null,

		/* for the template */
		SendStatus: SendStatus,
	}),
	computed: {
		workspaces: function () { return this.state.workspaces; },
		workspace: function () {
			return this.workspaces ? this.workspaces.getById (this.wsid) : null;
		},
		shareMeaning: function () {
			if (!this.selectedShareUrl) {
				return this.$t ('v.workspaceShare.readMeaning');
			} else {
				return this.$t ('v.workspaceShare.writeMeaning');
			}
		},
		modeLink: function () { return this.mode == 'link'; },
		modeEmail: function () { return this.mode == 'email'; },
		mode: queryParamProp ('mode', 'link'),
		canSend: function () {
			return !this.emailQuotaReached &&
					this.shareUrl[this.selectedShareUrl] &&
					this.emailAddresses.reduce ((last, current) => last || (current.status == SendStatus.unknown), false) &&
					this.emailMessage;
		},
	},
	created: async function() {
		const ws = this.workspace;

		async function createAction (group) {
			console.debug (`Creating action for group ${group}`);
			/* {user} is a special symbol, which will be resolved upon evaluation of the action */
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
			return action.token;
		}

		/* Do the groups exist? */
		let groups = {false: null, true: null};

		for (const g in ws.permissions.acl.group) {
			const p = ws.permissions.acl.group[g];
			if (p.canRead () && !p.canWrite ()) {
				groups[false] = g;
			} else if (p.canRead () && p.canWrite ()) {
				groups[true] = g;
			}
		}

		async function createGroupForWorkspace (ws, isWrite) {
			console.debug (`Creating group for workspace ${ws} ${isWrite}`);
			const token = 'usermgr-' + Date.now();
			const name = ws.path.split ('/').pop ();
			await pmrun (token, ['usermgr', 'g', 'create', name + (isWrite ? '-rw' : '-ro')], null, null);
			const p = await pmget (token);
			const ret = await p.wait ();
			const data = await p.getObject ();
			console.debug ('data is' + data + ' ret is ' + ret);
			if (ret == 0 && data.status == 'ok') {
				console.debug ('Group for' + ws + ' ' + isWrite + ' is ' + data);
				return data.group;
			} else {
				throw Error (data.status);
			}
		}

		if (groups[false] === null) {
			groups[false] = await createGroupForWorkspace (ws, false);
			await this.workspaces.share (ws, `g:${groups[false]}`, false);
		}
		if (groups[true] === null) {
			groups[true] = await createGroupForWorkspace (ws, true);
			await this.workspaces.share (ws, `g:${groups[true]}`, true);
		}

		/* async resolve both actions */
		const keys = [false, true];
		const values = await Promise.all (keys.map (function (isWrite) {
			return createAction (groups[isWrite]);
		}.bind (this)));
		for (let i = 0; i < keys.length; i++) {
			const isWrite = keys[i];
			const token = values[i];
			const ident = 'share-' + (isWrite ? 'write' : 'readonly');
			this.shareUrl[isWrite] = new URL (`/action/${token}#${ident}`, window.location.href);
		}
	},
	methods: {
		copyToClipboard: async function(text) {
			if (navigator.clipboard) {
				const ret = await navigator.clipboard.writeText (text);
				return true;
			} else {
				throw Error ('unsupported');
			}
		},
		sendAllMails: async function () {
			this.processAddresses ();

			for (let a of this.emailAddresses) {
				if (a.status != SendStatus.unknown) {
					continue;
				}
				a.status = SendStatus.inprogress;
				try {
					const j = await this.sendMail (a);
					a.status = SendStatus.success;
				} catch (e) {
					a.status = SendStatus.failure;
					break;
				}
			}
		},
		/* send single email to address a */
		sendMail: async function (a, dryRun=false) {
			const r = await postData ('/api/email', {
					recipientName: a.name,
					recipientAddress: a.address,
					projectName: this.workspace.metadata.name,
					message: this.emailMessage,
					link: this.shareUrl[this.selectedShareUrl],
					lang: this.$i18n.locale,
					template: 'invite',
					dryRun: dryRun,
					});
			const j = await r.json ();
			if (r.ok) {
				trackEvent ("email", "email-send");
				return j;
			} else {
				/* would be good to move this out, to have a stateless
				 * function, but then we have to do the same error-handling for
				 * previews */
				if (j.status == 'quota_reached') {
					this.emailQuotaReached = true;
				}
				throw Error (j.status);
			}
		},
		removeAddress: function (a) {
			this.emailAddresses = this.emailAddresses.filter (o => o.address != a.address);
		},
		addAddress: function () {
			this.processAddresses ();
		},
		processAddresses: function () {
			/* this matches email addresses similar to RFCXXX:
			 * user@example.com
			 * <user@example.com>
			 * user <user@example.com>
			 * "user" <user@example.com>
			 */
			const restr = '^\\s*(?:["\']?(?<name>[^@\'"]+)["\']?\\s+)?<?(?<address>[^@ ,;<>"]+@[^@ ,;<>"]+)>?';
			const mailre = new RegExp(restr, 'ig');
			const s = this.emailAddressesInput;
			const rawAddresses = s.split(/[,;]/).map((address) => address.trim());
			for (let rawAddress of rawAddresses) {
				const it = rawAddress.matchAll (mailre);
				for (let m of it) {
					const g = m.groups;
					this.emailAddresses.push ({
						/* prefer name from text field, then from address then localpart of email */
						name: g.name || g.address.split ('@', 1)[0],
						address: g.address,
						status: SendStatus.unknown});
				}
			}
			this.emailAddressesInput = "";
		},
		runPreview: function () {
			const debounceMs = 350;
			if (this.previewTimeout) {
				window.clearTimeout (this.previewTimeout);
				this.previewTimeout = null;
			}
			if (this.canSend) {
				/* simple debounce */
				this.previewTimeout = window.setTimeout (function () {
					this.sendMail (this.emailAddresses[0], true)
						.then (function (ret) {
							this.preview = ret.message;
						}.bind (this));
				}.bind (this), debounceMs);
			} else {
				this.preview = '';
			}
		},
	},
	watch: {
		emailAddresses: async function () {
			await this.runPreview ();
		},
		emailMessage: async function () {
			await this.runPreview ();
		},
	},
};
