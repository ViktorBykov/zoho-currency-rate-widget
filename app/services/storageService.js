export function saveRateToStorage(rate) {
	localStorage.setItem('lastNbuRate', rate.toString());
}

export function getRateFromStorage() {
	return parseFloat(localStorage.getItem('lastNbuRate')) || null;
}

export function getSavedLanguage() {
	return localStorage.getItem('selectedLang') || 'ua';
}

export function saveLanguage(lang) {
	localStorage.setItem('selectedLang', lang);
}
