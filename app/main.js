import { fetchNbuRate } from './services/apiServiceNbu.js';
import * as storageService from './services/storageService.js';
import { getDealRecord } from './services/apiServiceZoho.js';
import * as i18nService from './i18n/i18nService.js';
import * as uiUpdater from './ui/uiUpdater.js';
import * as historyLoader from './ui/historyLoader.js';

async function initWidget(recordId) {
	try {
		let nbuRate;

		try {
			nbuRate = await fetchNbuRate();
			storageService.saveRateToStorage(nbuRate);
		} catch (e) {
			console.warn(i18nService.translate('usingCachedRate'));
			uiUpdater.showError('usingCachedRate');

			nbuRate = storageService.getRateFromStorage();

			if (!nbuRate) throw e;
		}

		const record = await getDealRecord(recordId);
		if (!record) {
			uiUpdater.showError('errorNoRecord');

			return;
		}

		const dealRate = parseFloat(record.Currency_Rate || 0);
		uiUpdater.updateUI(nbuRate, dealRate, recordId);
	} catch (err) {
		console.error(i18nService.translate('errorInitWidget'), err);
		uiUpdater.showError('errorInitWidget');
	}
}

async function initApp() {
	await i18nService.loadTranslations();
	defineLanguage();

	ZOHO.embeddedApp.on('PageLoad', function (data) {
		const recordId = data.EntityId;

		initWidget(recordId);
		historyLoader.loadHistory(recordId);
	});

	ZOHO.embeddedApp.init();
}

initApp();

document.querySelectorAll('.dropdown-item').forEach((item) => {
	item.addEventListener('click', (e) => {
		e.preventDefault();

		const lang = e.target.getAttribute('data-lang');
		if (lang) {
			onChangeLanguage(lang);
		}
	});
});

function onChangeLanguage(lang) {
	i18nService.setLanguage(lang);
	storageService.saveLanguage(lang);
	uiUpdater.onChangeLanguage();
}

function defineLanguage() {
	const savedLang = storageService.getSavedLanguage();

	if (i18nService.getLanguage() !== savedLang) {
		onChangeLanguage(savedLang);
	}
}
