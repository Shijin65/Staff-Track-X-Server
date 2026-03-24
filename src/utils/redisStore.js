const { REDIS_KEY_PREFIX } = require("../config/envConfig");
const { logger, redisClient } = require("../config");

const redisStore = (() => {
  // Utility to generate prefixed Redis keys
  const generateKey = (category, apiName) =>
    `${REDIS_KEY_PREFIX}${category},${apiName}`;

  return {
    /**
     * Get all keys with the prefix from Redis
     * @returns {Array} - Array of objects containing key-value pairs
     */
    getAll: async () => {
      const client = await redisClient();
      try {
        const keys = await client.keys(`${REDIS_KEY_PREFIX}*`);
        if (keys.length > 0) {
          const values = await client.mGet(keys);
          return keys.map((key, index) => {
            const [rawCategory, name] = key
              .replace(REDIS_KEY_PREFIX, "")
              .split(",");
            // Capitalize category for better readability
            const category = rawCategory
              .replace(/^cf/, "")
              .replace(/([A-Z])/g, "$1")
              .trim();

            return {
              apiId: values[index],
              category,
              name,
            };
          });
        }
        return [];
      } catch (error) {
        logger.error(`Error getting all Redis keys: ${error}`);
        return [];
      }
    },

    /**
     * Get a value from Redis with the key prefix
     * @param {string} category - category Key for get
     * @param {string} apiName - api name Key for get
     * @returns {string|null} - Value from Redis, or null if key doesn't exist
     */
    getSingle: async (category, apiName) => {
      const client = await redisClient();
      const fullKey = generateKey(category, apiName);
      try {
        return await client.get(fullKey);
      } catch (error) {
        logger.error(`Error getting Redis key "${fullKey}": ${error}`);
        return null;
      }
    },

    /**
     * Get multiple values from Redis in a single operation
     * @param {Array<Object>} keys - Array of objects containing category and apiName keys
     * @returns {Array<Object>} - Array of objects containing key-value pairs, or empty if none found
     */
    getMultiple: async (keys) => {
      const client = await redisClient();
      const formattedKeys = keys.map(({ category, apiName }) =>
        generateKey(category, apiName)
      );
      try {
        // Use mGet to fetch multiple keys in one go
        const values = await client.mGet(formattedKeys);

        // Return keys and values together
        return formattedKeys.map((key, index) => ({
          key,
          value: values[index] || null, // Default to null if the key doesn't exist
        }));
      } catch (error) {
        logger.error(`Error getting multiple Redis keys: ${error}`);
        return [];
      }
    },

    /**
     * Set a value in Redis with the key prefix
     * @param {string} category - category Key to store
     * @param {string} apiName - api name Key to store
     * @param {string} value - Value to store
     * @param {number} [ttl] - Optional time-to-live in seconds
     */
    set: async (category, apiName, value, ttl = 0) => {
      const client = await redisClient();
      const fullKey = generateKey(category, apiName);
      try {
        if (ttl > 0) {
          await client.set(fullKey, value, { EX: ttl });
        } else {
          await client.set(fullKey, value);
        }
      } catch (error) {
        logger.error(`Error setting Redis key "${fullKey}": ${error}`);
      }
    },

    /**
     * Set multiple values in Redis in a single operation
     * @param {Array<Object>} keysValues - Array of objects containing category, apiName, and value to store
     * @param {number} [ttl] - Optional time-to-live in seconds for all keys
     */
    setMultiple: async (keysValues, ttl = 0) => {
      const client = await redisClient();
      const formattedEntries = keysValues.map(
        ({ category, apiName, value }) => {
          const fullKey = generateKey(category, apiName);
          return [fullKey, value];
        }
      );

      try {
        if (ttl > 0) {
          // If TTL is provided, use the EX option for each key-value pair
          for (const [key, value] of formattedEntries) {
            await client.set(key, value, { EX: ttl });
          }
        } else {
          // No TTL, just set the values
          await client.mSet(formattedEntries);
        }
      } catch (error) {
        logger.error(`Error setting multiple Redis keys: ${error}`);
      }
    },

    /**
     * Delete a key from Redis with the key prefix
     * @param {string} category - category Key for delete
     * @param {string} apiName - api name Key for delete
     */
    deleteSingle: async (category, apiName) => {
      const client = await redisClient();
      const fullKey = generateKey(category, apiName);
      try {
        await client.del(fullKey);
      } catch (error) {
        logger.error(`Error deleting Redis key "${fullKey}": ${error}`);
      }
    },

    /**
     * Clear all keys with the prefix from Redis
     */
    clearAll: async () => {
      const client = await redisClient();
      try {
        const keys = await client.keys(`${REDIS_KEY_PREFIX}*`);
        if (keys.length > 0) {
          await client.del(keys);
        }
      } catch (error) {
        logger.error(`Error clearing all Redis keys: ${error}`);
      }
    },

    /**
     * Check if a key exists in Redis with the key prefix
     * @param {string} category - category Key for check exist
     * @param {string} apiName - api name Key for check exist
     * @returns {boolean} - True if the key exists, otherwise false
     */
    checkExists: async (category, apiName) => {
      const client = await redisClient();
      const fullKey = generateKey(category, apiName);
      try {
        const result = await client.exists(fullKey);
        return result === 1; // 1 means the key exists
      } catch (error) {
        logger.error(
          `Error checking existence of Redis key "${fullKey}": ${error}`
        );
        return false;
      }
    },
  };
})();

module.exports = redisStore;
