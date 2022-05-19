import { store } from '../../app.js';
import template from './template.html';
import './style.css';

export default {
	name: 'IndexView',
	template: template,
	data: _ => ({
		state: store.state,
	}),
};

