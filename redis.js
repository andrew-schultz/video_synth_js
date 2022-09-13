const redis = require('redis');
const _ = require('lodash');
const clients = {};
let connectionTimeout;

function throwTimeoutError() {
  connectionTimeout = setTimeout(() => {
      throw new Error('Redis connection failed');
  }, 10000);
}
function instanceEventListeners({ conn }) {
  conn.on('connect', () => {
      console.log('CacheStore - Connection status: connected');
      clearTimeout(connectionTimeout);
  });
  conn.on('end', () => {
      console.log('CacheStore - Connection status: disconnected');
      throwTimeoutError();
  });
  conn.on('reconnecting', () => {
      console.log('CacheStore - Connection status: reconnecting');
      clearTimeout(connectionTimeout);
  });
  conn.on('error', (err) => {
      console.log('CacheStore - Connection status: error ', { err });
      throwTimeoutError();
  });
}
module.exports.init = () => {
  const cacheInstance = redis.createClient('redis://127.0.0.1:637');
  clients.cacheInstance = cacheInstance;
  console.log('we inited')

  instanceEventListeners({ conn: cacheInstance });
};
module.exports.closeConnections = () => _.forOwn(clients, (conn) => conn.quit());
module.exports.getClients = () => clients;

module.exports.setCache = (key, value) => {
  const result = clients.cacheInstance.set(key, value)
  return result
};
module.exports.getCache = (key) => {
  const result = clients.cacheInstance.get(key)
  return result
};