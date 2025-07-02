import {
	translate,
	translateElementsByID,
	getLanguage,
} from '../i18n/i18nService.js';
import {
	insertHistoryRecord,
	updateDealCurrencyRate,
} from '../services/apiServiceZoho.js';
import { loadHistory } from './historyLoader.js';

let lastErrorKey = null;

export function calculateDifference(dealRate, nbuRate) {
	return ((dealRate / nbuRate - 1) * 100).toFixed(1);
}

export function updateUI(nbuRate, dealRate, recordId) {
	// showError(''); // ??????

	document.getElementById('nbuRate').textContent = nbuRate.toFixed(2);
	document.getElementById('dealRate').textContent = dealRate.toFixed(2);

	const diff = calculateDifference(dealRate, nbuRate);
	document.getElementById('difference').textContent = `${diff} %`;

	const updateBtn = document.getElementById('updateButton');

	if (Math.abs(diff) >= 5) {
		updateBtn.style.display = 'block';
		updateBtn.onclick = async () => {
			try {
				const oldRate = dealRate;
				const resp = await updateDealCurrencyRate(recordId, nbuRate);

				if (resp.data?.[0]?.code !== 'SUCCESS') {
					throw new Error(resp.data[0].message);
				}

				updateUI(nbuRate, nbuRate, recordId);
				updateBtn.style.display = 'none';

				const historyData = {
					Name: `${translate(
						'historyRecordName'
					)} ${new Date().toLocaleDateString()}`,
					Lookup_2: recordId,
					Rate: nbuRate,
					Date: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
					Difference: parseFloat((nbuRate - oldRate).toFixed(2)),
					Rate_Sources: 'НБУ',
				};

				const response = await insertHistoryRecord(historyData);
				loadHistory(recordId);
				console.log(translate('historyRecordCreated'), response);
			} catch (err) {
				console.error(translate('errorUpdate'), err);
				showError('errorUpdate');
			}
		};
	} else {
		updateBtn.style.display = 'none';
	}
}

export function showError(key) {
	lastErrorKey = key;

	const el = document.getElementById('errorMessage');
	if (el) el.textContent = translate(key);
}

export function onChangeLanguage() {
	const elementsID = [
		'historyTitle',
		'labelNbuRate',
		'labelDealRate',
		'labelDifference',
		'updateButton',
		'langButton',
		'colDate',
		'colRate',
		'colDiff',
		'noHistory',
	];
	translateElementsByID(elementsID);

	// loading texts
	const nbuEl = document.getElementById('nbuRate');
	const dealEl = document.getElementById('dealRate');

	if (isNaN(parseFloat(nbuEl.textContent))) {
		nbuEl.textContent = translate('loading');
	}

	if (isNaN(parseFloat(dealEl.textContent))) {
		dealEl.textContent = translate('loading');
	}

	if (lastErrorKey) showError(lastErrorKey);
}

export function applyLoadingFallback(ids) {
	ids.forEach((id) => {
		const el = document.getElementById(id);
		if (el && isNaN(parseFloat(el.textContent))) {
			el.textContent = translate('loading');
		}
	});

	if (lastErrorKey) showError(lastErrorKey);
}
