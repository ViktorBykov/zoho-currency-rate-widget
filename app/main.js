let i18n = {};
let currentLang = 'ua';
let lastErrorKey = null;

async function fetchNbuRate() {
	try {
		const response = await fetch(
			'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json'
		);
		if (!response.ok) throw new Error('fetch error');
		const data = await response.json();

		const nbuRate = data[0].rate;
		localStorage.setItem('lastNbuRate', nbuRate.toString()); // ✅ Збереження

		return nbuRate;
	} catch (err) {
		console.error(t('errorFetch'), err);
		showError('errorFetch');

		// If the API doesn't work, use the latest localStorage course
		const lastRate = localStorage.getItem('lastNbuRate');
		if (lastRate) {
			console.warn(t('usingCachedRate'), lastRate);
			return parseFloat(lastRate);
		}

		throw err;
	}
}

function calculateDifference(dealRate, nbuRate) {
	return ((dealRate / nbuRate - 1) * 100).toFixed(1);
}

function updateUI(nbuRate, dealRate, recordId) {
	showError('');

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

				const resp = await ZOHO.CRM.API.updateRecord({
					Entity: 'Deals',
					APIData: {
						id: recordId,
						Currency_Rate: nbuRate,
					},
				});

				if (resp.data && resp.data[0].code !== 'SUCCESS') {
					throw new Error(resp.data[0].message);
				}

				console.log(t('rateUpdated'));

				updateUI(nbuRate, nbuRate, recordId);

				updateBtn.style.display = 'none';

				// Create record in Exchange Rate History
				const historyData = {
					Name: `${t(
						'historyRecordName'
					)} ${new Date().toLocaleDateString()}`,
					Lookup_2: recordId,
					Rate: nbuRate,
					Date: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
					Difference: parseFloat((nbuRate - oldRate).toFixed(2)),
					Rate_Sources: 'НБУ',
				};

				const response = await ZOHO.CRM.API.insertRecord({
					Entity: 'Exchange_Rate_History',
					APIData: historyData,
				});
				loadHistory(recordId);
				console.log(t('historyRecordCreated'), response);
			} catch (err) {
				console.error(t('errorUpdate'), err);
				showError('errorUpdate');
			}
		};
	} else {
		updateBtn.style.display = 'none';
	}
}

async function initWidget(recordId) {
	try {
		const nbuRate = await fetchNbuRate();
		const recordResp = await ZOHO.CRM.API.getRecord({
			Entity: 'Deals',
			RecordID: recordId,
		});

		if (!recordResp || !recordResp.data || recordResp.data.length === 0) {
			showError('errorNoRecord');
			return;
		}

		const record = recordResp.data[0];
		const dealRate = parseFloat(record.Currency_Rate || 0);

		updateUI(nbuRate, dealRate, recordId);
	} catch (err) {
		console.error(t('errorInitWidget'), err);
		showError('errorInitWidget');
	}
}

async function initApp() {
	await loadTranslations();

	const savedLang = localStorage.getItem('selectedLang') || 'ua';
	setLanguage(savedLang);
	translateElements();

	ZOHO.embeddedApp.on('PageLoad', function (data) {
		const recordId = data.EntityId;

		initWidget(recordId);
		loadHistory(recordId);
	});

	ZOHO.embeddedApp.init();
}

initApp();

async function loadTranslations() {
	const res = await fetch('translations/lang.json');
	i18n = await res.json();
}

// Language dropdown
document.querySelectorAll('.dropdown-item').forEach((item) => {
	item.addEventListener('click', (e) => {
		e.preventDefault();

		const lang = e.target.getAttribute('data-lang');
		if (lang) {
			setLanguage(lang);
			translateElements();
		}
	});
});

// Set and save language
function setLanguage(lang) {
	currentLang = lang;

	localStorage.setItem('selectedLang', lang);
}

function translateElements() {
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

	elementsID.forEach((el) => {
		translateElementByID(el);
	});

	// loading texts
	const nbuEl = document.getElementById('nbuRate');
	const dealEl = document.getElementById('dealRate');

	if (isNaN(parseFloat(nbuEl.textContent))) {
		nbuEl.textContent = i18n[currentLang].loading;
	}

	if (isNaN(parseFloat(dealEl.textContent))) {
		dealEl.textContent = i18n[currentLang].loading;
	}

	if (lastErrorKey) showError(lastErrorKey);
}

// get translate string by key
function t(key) {
	return i18n[currentLang][key] || key;
}

// show error in widget
function showError(messageKey) {
	lastErrorKey = messageKey;

	const el = document.getElementById('errorMessage');
	el.textContent = t(messageKey);
}

// history
async function loadHistory(recordId) {
	try {
		const response = await ZOHO.CRM.API.searchRecord({
			Entity: 'Exchange_Rate_History',
			Type: 'criteria',
			Query: `(Lookup_2.id:equals:${recordId})`,
			delay: false,
		});

		const records = (response.data || [])
			.sort((a, b) => new Date(b.Date) - new Date(a.Date))
			.slice(0, 5);

		const tableBody = document.getElementById('historyTableBody');
		tableBody.innerHTML = '';

		if (records.length === 0) {
			tableBody.innerHTML = `<tr><td colspan="3" id="noHistory">${t(
				'noHistory'
			)}</td></tr>`;
			return;
		}

		const recordsNumber = records.length > 5 ? 5 : records.length;
		for (let i = 0; i < recordsNumber; i++) {
			const rec = records[i];
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${formatDate(rec.Date)}</td>
				<td>${rec.Rate?.toFixed(2) || '-'}</td>
				<td>${rec.Difference?.toFixed(1) || '0'}%</td>
			`;
			tableBody.appendChild(row);
		}
	} catch (err) {
		console.error(t('errorLoadHistory'), err);
	}
}

// convert iso date format to "dd.mm.yyyy HH:mm"
function formatDate(iso) {
	const d = new Date(iso);
	const pad = (n) => String(n).padStart(2, '0');

	return `${pad(d.getDate())}.${pad(
		d.getMonth() + 1
	)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// avoid errors if the element is not in DOM
function translateElementByID(elID) {
	const el = document.getElementById(elID);
	if (el) el.textContent = i18n[currentLang][elID];
}
