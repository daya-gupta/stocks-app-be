import express from "express";
import bodyParser from 'body-parser';
import axios from "axios";
import cors from "cors";
import NodeCache from "node-cache";

const PORT = process.env.PORT || 3000;
const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzM4OTM3MzAxLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwMzgyOTcwMyJ9.ffQzk5DiNys2lboeyQaitACNLyCuwnU6u9xCqXHO2_bp-wdTekKAohtOWy3-WxxLeZTz8XJqs3sOw6CJfvLESA";

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "access-token": accessToken,
    "client-id": "1103829703"
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
const myCache = new NodeCache({ stdTTL: 300 });

app.get('/', (req, res) => {
    res.send('Node app working :) !!')
});

const getHistoricalData = async (filter) => {
    const promise = new Promise((resolve, reject) => {
        // instrument_key	true	string	The unique identifier for the financial instrument for which historical data is being queried. For the regex pattern applicable to this field, see the Field Pattern Appendix.
        // interval	true	string	Specifies the time frame of the candles.
        // Possible values: 1minute, 30minute, day, week, month.
        // to_date	true	string	The ending date (inclusive) for the historical data range. Format: 'YYYY-MM-DD'.
        // from_date	false	string	The starting date for the historical data range. Format: 'YYYY-MM-DD'.
        const { instruments, interval, from_date, to_date } = filter;
        // const instrument_key = 'NSE_EQ%7CINE848E01016';
        // const interval = '1minute';
        // const from_date = '2024-11-12';
        // const to_date = '2024-11-13';
        // const url = 'https://api.upstox.com/v2/historical-candle/NSE_EQ%7CINE848E01016/1minute/2023-11-13/2023-11-12';
        const historicalDataBaseUrl = 'https://api.upstox.com/v2/historical-candle';
        const headers = {
            'Accept': 'application/json',
        };
        const requestArr = [];
        instruments.forEach((key) => {
            const url = `${historicalDataBaseUrl}/${key}/${interval}/${to_date}/${from_date}`;
            const request = axios.get(
                url,
                { headers }
            );
            requestArr.push(request);
        });

        Promise.all(requestArr)
            .then(responseArr => {
                const response = responseArr.map((item, index) => {
                    return {
                        instrument: filter.instruments[index],
                        candles: item.data?.data?.candles || []
                    }
                });
                resolve(response);
            })
            .catch(error => {
                console.error(`Error: ${error.response.status} - ${error.response.data}`);
                reject(error);
            });
    })
    return promise;
}

app.post('/historicalDataUpstox', async (req, res) => {
    try {
        const historicalDataCacheKay = `historicalData_${JSON.stringify(req.body.filter)}`;
        console.log(historicalDataCacheKay);
        let historicalData = myCache.get(historicalDataCacheKay);
        if (historicalData == null) {
            const filter = req.body.filter;
            console.log('No cache found');
            historicalData = await getHistoricalData(filter);
            myCache.set(historicalDataCacheKay, historicalData); // Store in cache
        } else {
            console.log('Cache found');
        }
        res.status(200).send(historicalData);
    } catch (err) {
        // console.error(err);
        res.send(err);
    }
});

const getIntradayData = async (filter) => {
    const promise = new Promise((resolve, reject) => {
        const { instruments, interval } = filter;
        const intradayDataBaseUrl = 'https://api.upstox.com/v2/historical-candle/intraday';
        // const instrument_key = 'NSE_EQ%7CINE848E01016';
        const headers = {
            'Accept': 'application/json',
        };
        const requestArr = [];
        instruments.forEach((key) => {
            const url = `${intradayDataBaseUrl}/${key}/${interval}`;
            const request = axios.get(
                url,
                { headers }
            );
            requestArr.push(request);
        });

        Promise.all(requestArr)
            .then(responseArr => {
                const response = responseArr.map((item, index) => {
                    return {
                        instrument: filter.instruments[index],
                        candles: item.data?.data?.candles || []
                    }
                });
                resolve(response);
            })
            .catch(error => {
                console.error(`Error: ${error.response.status} - ${error.response.data}`);
                reject(error);
            });
    })
    return promise;
}

app.post('/intradayData', async (req, res) => {
    try {
        const intradayDataCacheKay = `intradayData_${JSON.stringify(req.body.filter)}`;
        console.log(intradayDataCacheKay);
        let intradayData = myCache.get(intradayDataCacheKay);
        if (intradayData == null) {
            const filter = req.body.filter;
            console.log('No intraday cache found');
            intradayData = await getIntradayData(filter);
            myCache.set(intradayDataCacheKay, intradayData); // Store in cache
        } else {
            console.log('Cache found');
        }
        res.status(200).send(intradayData);
    } catch (err) {
        // console.error(err);
        res.send(err);
    }
});

app.get('/marketStatus', async (req, res) => {
    const axios = require('axios');
    const url = 'https://api.upstox.com/v2/market/status/NSE';
    const headers = {
        'Accept': 'application/json',
        'Authorization': 'Bearer {your_access_token}'
    };

    axios.get(url, { headers })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


app.listen(PORT, () => {
    console.log(`express running @ ${PORT}`);
})
