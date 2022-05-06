/* Shared code between mock and mock-serviceworker. No inline code, only definitions. */

class MockError extends Error {
}

export class NotImplemented extends MockError {
}

export class LostMessage extends MockError {
}

export const unixUser = 'mockuser';

export function makeWord (min, max) {
	const consonants = 'bcdfghjklmnpqrstvwxyz',
		vowels = 'aeiou';
	const syllables = randomInt (min, max);
	let s = '';
	for (let i = 0; i < syllables; i++) {
		s += consonants[Math.floor (Math.random ()*consonants.length)];
		s += vowels[Math.floor (Math.random ()*vowels.length)];
	}
	return s;
}

export function makeSentence (min, max) {
	const words = [];
	const n = randomInt (min, max);
	for (let i = 0; i < n; i++) {
		words.push (makeWord (2, 7));
	}
	return words.join (' ');
}

function makeDate () {
	return new Date (randomInt (0, 2**32)*1000);
}

export function makeStrDate () {
	/* Remove “Z” at the end to match borg’s behavior */
	return makeDate ().toISOString ().slice (0, -1);
}

export function randomInt (min, max) {
	return Math.floor (Math.random ()*(max-min))+min;
}

export function delay (msec) {
	return new Promise ((resolve, reject) => { setTimeout(() => { resolve(); }, msec) });
}
