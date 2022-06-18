'use strict';
require('dotenv').config();
const axios = require('axios');

const mongoose = require('mongoose');

main().catch(err => console.log(err));

// mongoose mongodb connection
async function main() {
  await mongoose.connect(process.env.DB);
}

const stockSchema = new mongoose.Schema({
  stock: String,
  likes: [String]
});

const Stock = mongoose.model('Stock', stockSchema);

async function getStock(symbol) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;

  const res = await axios.get(url).catch(e => console.log(e));
  return { stock: symbol, price: await res.data.latestPrice };
}


module.exports = function(app) {

  app.route('/api/stock-prices')
    .get(async function(req, res) {
      let result = {};

      let stocks = req.query.stock || '';
      const like = req.query.like || false;

      if (stocks == '') {
        res.json({ error: 'Invalid request' });
      }

      if (typeof stocks == 'string') {
        stocks = [stocks];
      }

      let _stocks = await Promise.all(stocks.map((stock) => {
        return getStock(stock);
      }));

      if (_stocks.length == 1) {
        _stocks[0].likes = 1;
        res.json({ stockData: _stocks[0] });
      } else {
        let std = [];
        let i = 0;
        for (i = 0; i < _stocks.length; i++) {
          _stocks[i].rel_likes = 1;
          std.push(_stocks[i]);
        }

        res.json({ stockData: std });
      }
    });
};
