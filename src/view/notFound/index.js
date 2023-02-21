import template from './template.html';

export default {
	name: 'NotFoundView',
	template: template,
	data: _ => ({
		}),
	computed: {
		title: function() { return this.$t('v.notFound.notfound'); },
	},
};

