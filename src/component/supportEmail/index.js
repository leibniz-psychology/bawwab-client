import template from './template.html';

export default {
	name: 'SupportEmail',
	props: ['id'],
	template: template,
	computed: {
		mailto: function () {
			return `mailto:${this.$t('g.supportMail')}?subject=[Support] ${this.id}`
		}
	},
};
