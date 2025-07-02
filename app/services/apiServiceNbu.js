export async function fetchNbuRate() {
	try {
		const response = await fetch(
			'https://ba1nk.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json'
		);
		if (!response.ok) throw new Error('fetch error');
		const data = await response.json();
		return data[0].rate;
	} catch (err) {
		throw err;
	}
}
