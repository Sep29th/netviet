const config = {
  axios: {
    timeout: 10000,
    headers: {
      Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'vi',
      'Cache-Control': 'max-age=0',
      Priority: 'u=0, i',
      'Sec-Ch-Ua':
        '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    },
    baseHeaders: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  },
  symbols: ['^DJI', '^GSPC', '^IXIC'],
  numberOfRecordsToAverage: 10,
};
export default config;
