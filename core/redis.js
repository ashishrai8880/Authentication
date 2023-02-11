var redis = require('redis');

const redisUrl = "redis://127.0.0.1:6379";

//Stage redis endpoint
//const redisUrl = "redis://digi-ott-stage-t3-redis-001.wndpry.0001.aps1.cache.amazonaws.com:6379";

//Production end point
// const redisUrl = "redis://digi-ott-redis.wndpry.ng.0001.aps1.cache.amazonaws.com:6379";

let client = redis.createClient({ url: redisUrl });
const expiration = 5; //90 sec

client.connect();

client.on('connect', () => {
    console.log("Client connected to redis...")
})

client.on('ready', () => {
    console.log("Client connected to redis and ready to use...")
})

client.on('error', (err) => {
    console.log(err.message)
})

client.on('end', () => {
    console.log("Client disconnected from redis")
})

process.on('SIGINT', () => {
    client.quit()
})



/**
 * Set data in redis
 * 
 * @param {*} key 
 * @param {*} data 
 * @returns 
 */
async function setCache(key, data , exTime) {
    return await set(key, JSON.stringify(data) , exTime)
}

/**
 * set data in cache in string format
 * 
 * @param {*} key 
 * @param {*} data 
 */
// async function set(key, data) {
//     await client.set(key, data, 'EX', expiration);
// }


async function set(key, data, exTime) {
    // console.log("set=========>" , exTime);
    await client.set(key , data );
    await client.expire(key , exTime) ;
}

/**
 * Set hash cache in redis
 * 
 * @param {*} hash 
 * @param {*} key 
 * @param {*} data 
 * @returns 
 */
async function setHashCache(hash, key, data) {
    return await hset(hash, key, JSON.stringify(data))
}

/**
 * Set hash value in cache
 * 
 * @param {*} hash 
 * @param {*} key 
 * @param {*} data 
 */
async function hset(hash, key, data) {
    await client.hSet(hash, key, data);
}

/**
 * Get string cache value
 * 
 * @param {*} key 
 * @returns 
 */
async function getCache(key) {
    var data = await get(key);
    return JSON.parse(data);
}

async function get(key) {
    return await client.get(key);
}

/**
 * Get hash cache data
 * 
 * @param {*} hash 
 */
async function getHashCache(hash) {
    var data = await hgetall(hash);
    return JSON.stringify(data);
}

async function hgetall(hash) {
    return await client.HGETALL(hash);
}

/**
 * Clear cache of key
 * 
 * @param {*} key 
 * @returns 
 */
async function clearCache(key) {
    return await clear(key);
}

async function clear(key) {
    return await client.del(key);
}

/**
 * Clear hash key
 * 
 * @param {*} hash 
 * @param {*} key 
 * @returns 
 */
async function clearHcache(hash, key) {
    return await client.hdel(hash, key);
}

/**
 * Check if key exists in redis cache
 * 
 * @param {*} key 
 * @returns 
 */
async function keyExists(key) {
    return await client.exist(key);
}

module.exports.getCache = getCache
module.exports.getHashCache = getHashCache
module.exports.setCache = setCache
module.exports.setHashCache = setHashCache
module.exports.clearCache = clearCache
module.exports.keyExists = keyExists
module.exports.clearHcache = clearHcache