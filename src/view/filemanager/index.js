import { store } from '../../app.js';
import FilesComponent from '../../component/files/index.js';
import template from './template.html';
import TooltipComponent from "../../component/tooltip";
import './style.css';

export default {
	name: 'FileManager',
	props: {
		wsidA: {type: String, required: true},
		pathA: {type: String, default() { return '/' }},
		wsidB: {type: String, required: false},
		pathB: {type: String, default() { return '/' }},
	},
	components: {
		files: FilesComponent,
		tooltip: TooltipComponent,
	},
	data: _ => ({
		state: store.state,
		newWsidB: '',
		selectedA: [],
		selectedB: [],
		enableSelectA: true,
		enableSelectB: false,
	}),
	template: template,
	computed: {
		workspaces: function () { return this.state.workspaces; },
		workspaceA: function () {
			return this.workspaces.getById (this.wsidA);
		},
		workspaceB: function () {
			return this.wsidB ? this.workspaces.getById (this.wsidB) : null;
		},
		workspacesB: function () {
			if (this.enableSelectB) {
				/* Any workspace can be a source */
				return this.workspaces.all ();
			} else if (this.enableSelectA) {
				/* Only those, which we can actually write to. */
				return this.workspaces.all().filter (w => w.permissions.mine.canWrite);
			}
		},
		selected: function () {
			return [].concat (this.selectedA).concat (this.selectedB);
		},
		canWriteA: function () { return this.workspaceA.permissions.mine.canWrite; },
		canWriteB: function () { return this.workspaceB.permissions.mine.canWrite; },
	},
    methods: {
		copyFiles: async function () {
			await this.$refs.filesA.copyFilesTo (this.workspaceB.path + this.pathB);
			await this.$refs.filesB.copyFilesTo (this.workspaceA.path + this.pathA);
			await Promise.all ([this.$refs.filesA.update (), this.$refs.filesB.update ()]);
		},
		moveFiles: async function () {
			await this.$refs.filesA.moveFilesTo (this.workspaceB.path + this.pathB);
			await this.$refs.filesB.moveFilesTo (this.workspaceA.path + this.pathA);
			await Promise.all ([this.$refs.filesA.update (), this.$refs.filesB.update ()]);
		},
		changeDirA: async function (path) {
			await this.$router.push ({name: 'fileManager', params: {wsidA: this.wsidA, pathA: path, wsidB: this.wsidB, pathB: this.pathB}});
		},
		changeDirB: async function (path) {
			await this.$router.push ({name: 'fileManager', params: {wsidA: this.wsidA, pathA: this.pathA, wsidB: this.wsidB, pathB: path}});
		},
		onSelectedA: async function (files) {
			this.selectedA = files;
		},
		onSelectedB: async function (files) {
			this.selectedB = files;
		},
		swap: async function () {
			this.enableSelectA = !this.enableSelectA;
			this.enableSelectB = !this.enableSelectB;
		},
		addTarget: async function () {
			await this.$router.push ({name: 'fileManager', params: {
					wsidA: this.wsidA,
					pathA: this.pathA,
					wsidB: this.wsidA,
					pathB: null}});
		}
	},
	created: async function () {
		this.newWsidB = this.wsidB;
	},
	watch: {
		wsidB: function () { this.newWsidB = this.wsidB; },
		newWsidB: async function () {
			await this.$router.push ({name: 'fileManager', params: {
					wsidA: this.wsidA,
					pathA: this.pathA,
					wsidB: this.newWsidB,
					/* Keep path if switching to the same workspace */
					pathB: this.newWsidB == this.wsidB ? this.pathB : '/',
					}});
		}
	},
};

