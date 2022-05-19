import spinnerSvg from '../../img/spinner.svg';
import template from './template.html';
import './style.css';

export default {
	name: 'Spinner',
	props: ['big'],
	template: template,
	computed: {
		cls() {
			return 'app-spinner ' + (this.big ? 'app-spinner--big' : '');
		},
		path() {
			return '/assets/' + spinnerSvg;
		}
	},
};

