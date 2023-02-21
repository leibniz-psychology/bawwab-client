import FaqSideNav from "../../component/faqSideNav";
import template from './template.html';
import './style.css';

export default {
	name: 'FaqView',
	template: template,
	components: {
		FaqSideNav,
	},
	computed: {
		title: function() { return this.$t('v.faq.title'); },
	},
};

