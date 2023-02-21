import template from './template.html';

export default {
	name: 'OpenSourceView',
	template: template,
	computed: {
		title: function () { return this.$t('v.opensource.title'); },
	},
};

