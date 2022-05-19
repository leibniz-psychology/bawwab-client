import spinnerSvg from '../../img/spinner.svg';
import template from './template.html';
import './style.css';

export default {
	name: 'Spinner',
	props: ['big'],
	template: template,
	computed: {
		cls() {
			return 'spinner' + (this.big ? ' big' : '');
		},
		path() {
			return '/assets/' + spinnerSvg;
		}
	},
};

