import {nextTick} from 'vue/dist/vue.esm-bundler.js';
import { store } from '../../app.js';
import TooltipComponent from "../../component/tooltip";
import template from './template.html';
import './style.css';

const TYPE_FILE = 1;
const TYPE_FOLDER = 2;
const TYPE_LINK = 3;

export default {
	name: 'Files',
	props: {
		root: {type: String},
		path: {type: String},
		canDelete: {type: Boolean, default: () => true},
		canUpload: {type: Boolean, default: () => true},
		canDownload: {type: Boolean, default: () => true},
		canMkdir: {type: Boolean, default: () => true},
		canSelect: {type: Boolean, default: () => true},
		onChangeDir: {type: Function},
		onSelected: {type: Function},
	},
	components: {
		tooltip: TooltipComponent,
	},
	data: _ => ({
		state: store.state,
		files: new Map (),
		selected: [],
		newName: '',
		updating: true,
		showMkdir: false,
	}),
    template: template,
	computed: {
		parent: function () {
			let path = this.path ?? '/';
			if (!path.endsWith ('/')) {
				path += '/';
			}
			return this.path.split('/').slice(0, -2).join ('/') + '/';
		},
		viewFiles: function () {
			const filtered = Array.from (this.files.values()).filter (a => !a.name.startsWith ('.'));
			/* folders first */
			filtered.sort ((a, b) => b.type-a.type || a.name.localeCompare (b.name));
			return filtered;
		},
		fullPath: function () {
			return this.root + this.path;
		},
		notFound: function () {
			return this.files == 'notfound';
		},
		downloadUrl: function () {
			if (this.selected.length == 1 && this.isFile (this.files.get (this.selected[0]))) {
				const url = new URL (`/api/filesystem${this.selected[0]}`, window.location.href);
				return url.toString ();
			} else {
				return null;
			}
		}
	},
    methods: {
		fileToIcon: function (f) {
			switch (f.type) {
				case TYPE_LINK: return 'fa-link';
				case TYPE_FOLDER: return 'fa-folder';
				case TYPE_FILE: {
					const extension = f.name.split ('.').slice (-1)[0];
					switch (extension) {
						case 'bz2':
						case 'gz':
						case 'lz':
						case 'lzip':
						case 'rar':
						case 'tar':
						case 'zip':
							return 'fa-file-archive';

						case 'flac':
						case 'mp3':
						case 'ogg':
						case 'opus':
							return 'fa-file-audio';


						case 'csv':
						case 'tsv':
							return 'fa-file-csv';

						case 'py':
						case 'R':
						case 'Rmd':
							return 'fa-file-code';

						case 'xls':
						case 'xlsx':
							return 'fa-file-excel';

						case 'gif':
						case 'jpg':
						case 'png':
							return 'fa-file-image';

						case 'pdf':
							return 'fa-file-pdf';

						case 'ppt':
						case 'ppx':
						case 'pptx':
							return 'fa-file-powerpoint';

						case 'mkv':
						case 'mp4':
							return 'fa-file-video';

						case 'doc':
						case 'docx':
							return 'fa-file-word';

						default: return 'fa-file';
					}
				}
			}
		},
		isFolder: function (f) {
			return f?.type == TYPE_FOLDER;
		},
		isFile: function (f) {
			return f?.type == TYPE_FILE;
		},
		sizeToHuman: function (bytes) {
			const units = ['B', 'kB', 'MB', 'GB'];
			while (bytes > 1024) {
				bytes = bytes/1024;
				units.shift ();
			}
			return [bytes.toFixed(1), units.shift()];
		},
		fileFromPath: function (path) {
			return path.split('/').slice(-1)[0];
		},
		update: async function () {
			/* clear files when changing directory */
			this.selected = [];
			this.updating = true;

			const url = new URL (`/api/filesystem${this.fullPath}`, window.location.href);
			const r = await fetch (url.toString ());
			const j = await r.json();
			if (r.ok) {
				const files = new Map ();
				for (let f of j) {
					const p = `${this.fullPath}/${f.name}`;
					f.path = p;
					files.set (p, f);
				}
				this.files = files;
			} else {
				this.files = j.status;
			}

			this.updating = false;
		},
		copy: async function (files, destination) {
			const success = [];
			for (const path of files) {
				const url = new URL (`/api/filesystem${path}`, window.location.href);
				url.searchParams.append ('to', destination);
				url.searchParams.append ('kind', 'COPY');
				const r = await fetch (url.toString (), {method: 'POST'});
				const j = await r.json();
				if (r.ok) {
					success.push (path);
				}
			}
			return success;
		},
		copyFilesTo: async function (destination) {
			await this.copy (this.selected, destination);
			this.selected.splice (0, this.selected.length);
		},
		moveFilesTo: async function (destination) {
			const files = this.selected;

			for (const path of files) {
				const o = this.files.get (path);
				if (o) {
					o.inProgress = true;
				}
			}

			/* Implemented as copy+move, because otherwise we cannot guarantee file
			 * permissions are correct for shared projects */
			await this.copy (files, destination);
			const deleted = await this.delete (files);

			for (const path of deleted) {
				this.files.delete (path);
			}

			this.selected.splice (0, this.selected.length);
		},
		delete: async function (files) {
			const success = [];
			for (const path of files) {
				const url = new URL (`/api/filesystem${path}`, window.location.href);
				const r = await fetch (url.toString (), {method: 'DELETE'});
				const j = await r.json();
				if (r.ok) {
					success.push (path);
				}
			}
			return success;
		},
		deleteFiles: async function () {
			const files = this.selected;

			for (const path of files) {
				const o = this.files.get (path);
				if (o) {
					o.inProgress = true;
				}
			}

			const deleted = await this.delete (files);

			for (const path of deleted) {
				this.files.delete (path);
			}
			for (const path of files) {
				const o = this.files.get (path);
				if (o) {
					o.inProgress = false;
				}
			}

			this.selected.splice (0, this.selected.length);
		},
		prepareMkdir: async function () {
			this.showMkdir = true;
			await nextTick ();
			this.$refs.newName.focus ();
		},
		onNewNameSubmit: async function () {
			await this.$refs.newNameSubmit.clicked ();
		},
		makeDir: async function () {
			const path = this.fullPath + '/' + this.newName;
			const o = {path, name: this.newName, type: TYPE_FOLDER, size: 0, inProgress: true};
			this.files.set (path, o);

			const url = new URL (`/api/filesystem${path}`, window.location.href);
			url.searchParams.append ('kind', 'MKCOL');
			const r = await fetch (url.toString (), {method: 'POST'});
			const j = await r.json();
			if (r.ok) {
				this.newName = '';
				o.inProgress = false;
				this.showMkdir = false;
			} else {
				throw 'nope';
			}
		},
		uploadSelect: function () {
			this.$refs.upload.click ();
		},
		upload: async function (e) {
			for (let f of e.target.files) {
				const path = `${this.fullPath}/${f.name}`;
				this.files.set (path, {path, name: f.name, type: TYPE_FILE, size: f.size, inProgress: true});
			}
			for (let f of e.target.files) {
				const path = `${this.fullPath}/${f.name}`;
				const url = new URL (`/api/filesystem${path}`, window.location.href);
				const r = await fetch (url.toString (), {method: 'PUT', body: f});
				if (r.ok) {
					const o = this.files.get (path);
					o.inProgress = false;
				} else {
					this.files.delete (path);
				}
			}
		},
		changeDir: async function (dir) {
			if (!this.updating) {
				await this.onChangeDir (dir);
			}
		}
	},
	created: async function () {
		await this.update ();
	},
	watch: {
		path: async function () { await this.update (); },
		root: async function () { await this.update (); },
		selected: async function () { await this.onSelected (this.selected); },
	}
};
