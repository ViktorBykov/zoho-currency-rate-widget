let i18n = {};
let currentLang = 'ua';

export async function loadTranslations() {
	const res = await fetch('i18n/translations.json');
	i18n = await res.json();
}

export function getLanguage() {
	return currentLang;
}

export function setLanguage(lang) {
	currentLang = lang;
}

export function translate(key) {
	return i18n[currentLang]?.[key] || key;
}

export function translateElementsByID(ids) {
	ids.forEach((id) => {
		const el = document.getElementById(id);
		if (el) el.textContent = translate(id);
	});
}
