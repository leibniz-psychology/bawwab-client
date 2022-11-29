import { store } from '../../app.js';
import template from './template.html';

export default {
	name: 'LogoutView',
	template: template,
	data: _ => ({
		done: false,
		}),
	computed: {
		ssoLogoutUrl: function () {
			const resolved = this.$router.resolve ({name: 'index'});
			const redirectUrl = new URL (resolved.href, window.location.href);
			const u = new URL ('/api/session/logout', window.location.href);
			u.searchParams.append ('next', redirectUrl);
			return u;
		},
	},
	created: async function () {
		await store.state.session.destroy ();
		await store.init ();
		this.done = true;
	},
};
