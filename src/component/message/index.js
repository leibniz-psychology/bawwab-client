import template from './template.html';
import './style.css';

export default {
	name: 'Message',
	props: ['kind'],
	data: function () { return {visible: true, observer: null} },
	template: template,
	mounted: function () {
		/* There is no way to watch $slots for changes, so we have to add a
		 * MutationObserver to the element containing the <slot> and watch for
		 * changes inside. This ensures the message is shown again whenever
		 * its content changes. */
		const observer = this.observer = new MutationObserver (this.show);
		observer.observe (this.$refs.content, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true,
		});
	},
	unmounted: function() {
		this.observer.disconnect ();
	},
	computed: {
		iconclass: function () {
			const kindToIcon = {
				warning: 'exclamation-triangle',
				info: 'info',
				};
			return "icn fa fa-" + kindToIcon[this.kind];
		},
		divclass: function () {
			return 'app-message app-message--' + (this.kind ? this.kind : 'info');
		},
	},
	methods: {
		hide: function () {
			this.visible = false;
		},
		show: function() {
			this.visible = true;
		}
	},
};
