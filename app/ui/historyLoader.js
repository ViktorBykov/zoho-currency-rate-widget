import { searchHistoryRecords } from '../services/apiServiceZoho.js';
import { translate } from '../i18n/i18nService.js';

export async function loadHistory(recordId) {
	try {
		const response = await searchHistoryRecords(recordId);
		const records = (response.data || [])
			.sort((a, b) => new Date(b.Date) - new Date(a.Date))
			.slice(0, 5);

		const tableBody = document.getElementById('historyTableBody');
		tableBody.innerHTML = '';

		if (records.length === 0) {
			tableBody.innerHTML = `<tr><td colspan="3" id="noHistory">${translate(
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
		console.error(translate('errorLoadHistory'), err);
	}
}

function formatDate(iso) {
	const d = new Date(iso);
	const pad = (n) => String(n).padStart(2, '0');

	return `${pad(d.getDate())}.${pad(
		d.getMonth() + 1
	)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
