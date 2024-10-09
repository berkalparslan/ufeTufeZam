const axios = require('axios');
const cheerio = require('cheerio');

// Kullanıcıdan alınan örnek değer
const userInput = 50000; // Bu değeri kullanıcıdan input olarak alabilirsin
let lastMonths = 6; // Son x ayın enflasyon oranlarını almak için kullanılacak ay sayısı
calculateWithInflation(userInput, lastMonths);

// TÜFE verilerini çekme fonksiyonu
async function fetchTufeRates(lastMonths) {
    try {
        const response = await axios.get('https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Enflasyon+Verileri/Tuketici+Fiyatlari');
        const $ = cheerio.load(response.data);
        
        const tufeData = [];
        
        // Tablo hücrelerinden TÜFE verilerini çekme (Tablo yapısına göre özelleştirilebilir)
        $('table tr').each((index, element) => {
            const row = $(element).find('td');
            const month = $(row[0]).text();  // Ay sütunu
            const tufe = parseFloat($(row[2]).text());  // TÜFE sütunu

            if (!isNaN(tufe)) {
                tufeData.push({ month, tufe });
            }
        });

        // Son 6 ayın TÜFE verilerini al
        const lastMonthsTufe = tufeData.slice(0, lastMonths);
        console.log("🚀 ~ fetchTufeRates ~ lastMonthsTufe:", lastMonthsTufe)
        return lastMonthsTufe.map(data => data.tufe);

    } catch (error) {
        console.error('TÜFE verisi çekme hatası:', error);
    }
}

// ÜFE verilerini çekme fonksiyonu
async function fetchUfeRates(lastMonths) {
    try {
        const response = await axios.get('https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Enflasyon+Verileri/Uretici+Fiyatlari');
        const $ = cheerio.load(response.data);
        
        const ufeData = [];
        
        // Tablo hücrelerinden ÜFE verilerini çekme (Tablo yapısına göre özelleştirilebilir)
        $('table tr').each((index, element) => {
            const row = $(element).find('td');
            const month = $(row[0]).text();  // Ay sütunu
            const ufe = parseFloat($(row[4]).text());  // ÜFE sütunu

            if (!isNaN(ufe)) {
                ufeData.push({ month, ufe });
            }
        });

        // Son x ayın ÜFE verilerini al
        const lastMonthsUfe = ufeData.slice(0, lastMonths);
        console.log("🚀 ~ fetchUfeRates ~ lastMonthsUfe:", lastMonthsUfe)
        return lastMonthsUfe.map(data => data.ufe);

    } catch (error) {
        console.error('ÜFE verisi çekme hatası:', error);
    }
}

// Kullanıcının girdiği değeri TÜFE ve ÜFE ortalamasına göre artırma fonksiyonu
async function calculateWithInflation(userInput, lastMonths) {
    try {
        const tufeRates = await fetchTufeRates(lastMonths);
        const ufeRates = await fetchUfeRates(lastMonths);

        // Son 6 ayın TÜFE ve ÜFE verilerini kullanarak ortalama enflasyon oranını hesaplama
        let totalInflation = 0;
        for (let i = 0; i < tufeRates.length; i++) {
            totalInflation += (tufeRates[i] + (ufeRates[i] / 2));
        }
        const averageInflationRate = totalInflation / tufeRates.length;
        console.log("🚀 ~ calculateWithInflation ~ totalInflation:", totalInflation)
        console.log("🚀 ~ calculateWithInflation ~ averageInflationRate:", averageInflationRate)

        // Kullanıcı girdisini enflasyon oranında artırma
        const updatedValue = userInput * (1 + totalInflation / 100);
        console.log(`Güncellenmiş Değer: ${updatedValue.toFixed(2)} TL`);
    } catch (error) {
        console.error('Hesaplama sırasında bir hata oluştu:', error);
    }
}