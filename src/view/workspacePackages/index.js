import { store } from '../../app.js';
import { queryParamProp, CancelledError } from '../../utils.js';
import template from './template.html';
import { WorkspaceError } from '../../workspaces';
import SupportEmail from '../../component/supportEmail';
import './style.css';

export default {
	name: 'WorkspacePackagesView',
	props: ['wsid'],
	data: _ => ({
		state: store.state,
		cancel: null,
		searching: false,
		searchId: null,
		/* Package state cache, list of {p: <package>, state: <state>} */
		packages: [],
		packageFilter: ['installed', 'add', 'remove'],
		defaultPackageFilter: ['add', 'remove'],
		status: null,
	}),
    template: template,
	components: {
		SupportEmail,
	},
	beforeRouteLeave: async function (to, from) {
		if (this.cancel) {
			this.cancel (new CancelledError ());
		}
		return true;
	},
	computed: {
		haveModifications: function () { return this.packageTransforms.length > 0; },
		filteredPackages: function () {
			function compare (a, b) {
				/* changed packages at the top */
				if ((a.state.add || a.state.remove) && !(b.state.add || b.state.remove)) {
					return -1;
				} else if (!(a.state.add || a.state.remove) && (b.state.add || b.state.remove)) {
					return 1;
				} else {
					/* if there’s a relevance score, sort by it */
					if (a.p.relevance && b.p.relevance) {
						return b.p.relevance - a.p.relelance;
					} else {
						return a.p.name.localeCompare (b.p.name);
					}
				}
			}
			return this.packages.filter (ps => this.packageFilter.reduce ((accum, f) => accum || ps.state[f], false)).sort (compare);
		},
		packageTransforms: function() {
			return this.packages.reduce (function (accum, ps) {
				const ret = [];
				if (ps.state.remove) {
					ret.push ('-' + ps.p.name);
				} else if (ps.state.add) {
					ret.push ('+' + ps.p.name);
				}
				return accum.concat (ret);
			}, []);
		},
		workspaces: function () { return this.state.workspaces; },
		workspace: function () {
			return this.workspaces ? this.workspaces.getById (this.wsid) : null;
		},
		/* inspired by https://stackoverflow.com/a/60786867 */
		search: queryParamProp ('search', ''),
		searchFailed: function () { return this.searching instanceof Error },
		busy: function () { return this.status?.name === 'busy' },
	},
    methods: {
		doPackageUpgrade: async function () {
			this.status = {name: 'busy'};
			await this.state.workspaces.packageUpgrade (this.workspace);
			this.status = {name: 'success'};

			this.packageFilter = this.defaultPackageFilter;
			this.search = '';
		},
		doPackageModify: async function () {
			this.status = {name: 'busy'};
			try {
				/* Make the promise “cancellable”, although packageModify is
				 * not really cancelled, we just ignore its results. */
				await Promise.race ([
						this.state.workspaces.packageModify (this.workspace, this.packageTransforms),
						new Promise (function (resolve, reject) { this.cancel = reject }.bind (this))]);
				this.status = {name: 'success'};
				await this.$router.push ({name: 'workspace', params: {wsid: this.workspace.metadata._id}});
			} catch (e) {
				console.debug ('workspacePackages failed: ' + e);
				if (e instanceof CancelledError) {
					this.status = {name: 'cancelled'};
				} else if (e instanceof WorkspaceError) {
					if (e.data.status == "package_build_error") {
						this.status = {name: 'packageBuild', packages: e.data.packages, token: e.token};

						/* Remove transaction flags (add/remove) from failed packages, so the
						   user can simply click apply again */
						for (const name of e.data.packages) {
							const ps = this.packages.find (ps => ps.p.name === name);
							console.debug ('Undoing actions for %o: %o', name, ps);
							if (ps) {
								this.undoPackageAction (ps);
							}
						}
					} else {
						this.status = {name: 'error', token: e.token};
					}
				} else {
					/* pass */
					this.status = {name: 'error'};
				}
			} finally {
				this.cancel = null;
			}
		},
		addPackage: function (ps) {
			if (!ps.state.installed) {
				ps.state.add = true;
			}
			ps.state.remove = false;
		},
		removePackage: function (ps) {
			if (ps.state.installed) {
				ps.state.remove = true;
			}
			ps.state.add = false;
		},
		undoPackageAction: function (ps) {
			ps.state.add = false;
			ps.state.remove = false;
		},
		mergePackageList (l, state) {
			for (const p of l) {
				/* XXX: match version too? */
				const ps = this.packages.find (ps => ps.p.name == p.name);
				if (!ps) {
					const s = Object.assign ({installed: false, add: false, remove: false, fromSearch: false}, state);
					this.packages.push ({state: s, p: p});
				} else {
					Object.assign (ps.state, state);
					Object.assign (ps.p, p);
				}
			}
		},
		queueSearch: function (debounceMs=350) {
			const minSearchLen = 3;
			if (this.search.length >= minSearchLen) {
				if (this.searchId) {
					window.clearTimeout (this.searchId);
					this.searchId = null;
				}
				/* simple debounce */
				this.searchId = window.setTimeout (function () {
					/* we cannot cancel search, so store the expression and compare it later */
					const searchFor = this.search;
					this.searching = true;
					this.packages.map (function (ps) { ps.state.fromSearch = false });
					this.state.workspaces.packageSearch (this.workspace, this.search.split (' '))
						.then (function (ret) {
							/* only apply changes if the expression is still
							 * the same, otherwise forget results */
							console.debug ('got packages', ret);
							if (this.search == searchFor) {
								this.mergePackageList (ret, {fromSearch: true});
								this.packageFilter = ['fromSearch'];
								this.searching = false;
							}
						}.bind (this), function (e) {
							console.error ('search failed', e);
							if (this.search == searchFor) {
								this.searching = e;
							}
						}.bind (this));
				}.bind (this), debounceMs);
			} else {
				this.searching = false;
				this.packageFilter = this.defaultPackageFilter;
				this.packages.map (function (ps) { ps.state.fromSearch = false });
			}
		},

    },
	created: function () {
		console.debug ('updating package cache');
		this.packages = [];
		this.mergePackageList (this.workspace.packages, {installed: true});
		this.queueSearch (0);
	},
	watch: {
		workspace: function () {
			/* reset package view */
			console.debug ('updating package cache');
			this.packages = [];
			this.mergePackageList (this.workspace.packages, {installed: true});
		},
		search: function () {
			this.queueSearch ();
		},
	},
};

