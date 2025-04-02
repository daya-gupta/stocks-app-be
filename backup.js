const getHistoricalData = () => {
    // instrument_key	true	string	The unique identifier for the financial instrument for which historical data is being queried. For the regex pattern applicable to this field, see the Field Pattern Appendix.
    // interval	true	string	Specifies the time frame of the candles.
    // Possible values: 1minute, 30minute, day, week, month.
    // to_date	true	string	The ending date (inclusive) for the historical data range. Format: 'YYYY-MM-DD'.
    // from_date	false	string	The starting date for the historical data range. Format: 'YYYY-MM-DD'.
    const filter = body.filter;
    const { instruments, interval, from_date, to_date } = filter;
    // const instrument_key = 'NSE_EQ%7CINE848E01016';
    // const interval = '1minute';
    // const from_date = '2024-11-12';
    // const to_date = '2024-11-13';
    // const url = 'https://api.upstox.com/v2/historical-candle/NSE_EQ%7CINE848E01016/1minute/2023-11-13/2023-11-12';
    const historicalDataBaseUrl = 'https://api.upstox.com/v2/historical-candle';
    const headers = {
        'Accept': 'application/json',
        // 'contentType': 'application/json',
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

    try {
        const responseArr = await Promise.all(requestArr);
        const response = responseArr.map((item, index) => {
            return {
                instrument: filter.instruments[index],
                candles: item.data?.data?.candles || []
            }
        });
        // console.log('.................response', response);
        res.send(response);
    } catch (error) {
        // console.log('.................errror', error);
        console.error(`Error: ${error.response.status} - ${error.response.data}`);
        res.send(error);
    }

    // const url = `https://api.upstox.com/v2/historical-candle/${instrument_key}/${interval}/${to_date}/${from_date}`;

    // const headers = {
    //     'Accept': 'application/json'
    // };

    // axios.get(url, { headers })
    //     .then(response => {
    //         // Do something with the response data (e.g., print it)
    //         console.log(response.data);
    //         res.send(response.data);
    //     })
    //     .catch(error => {
    //         // Print an error message if the request was not successful
    //         console.error(`Error: ${error.response.status} - ${error.response.data}`);
    //         res.error(error);
    //     });
}