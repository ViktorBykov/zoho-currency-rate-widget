export async function getDealRecord(recordId) {
	const response = await ZOHO.CRM.API.getRecord({
		Entity: 'Deals',
		RecordID: recordId,
	});
	return response?.data?.[0] || null;
}

export async function updateDealCurrencyRate(recordId, rate) {
	return await ZOHO.CRM.API.updateRecord({
		Entity: 'Deals',
		APIData: { id: recordId, Currency_Rate: rate },
	});
}

export async function insertHistoryRecord(data) {
	return await ZOHO.CRM.API.insertRecord({
		Entity: 'Exchange_Rate_History',
		APIData: data,
	});
}

export async function searchHistoryRecords(recordId) {
	return await ZOHO.CRM.API.searchRecord({
		Entity: 'Exchange_Rate_History',
		Type: 'criteria',
		Query: `(Lookup_2.id:equals:${recordId})`,
		delay: false,
	});
}
