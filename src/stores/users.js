import { writable } from 'svelte/store';
import { Map } from 'immutable';
import { not } from 'ramda';

/**
 * This store is in fact a Map where for every userId there is
 * an object with all picture sizes like this
 * { small:, medium:, large: }
 */
const pictureStore = writable(new Map());

/**
 * @function cachedFetch
 * @param  {String} userId  The user id which serves as the key for the cache (which is a Map)
 * @param  {String} apiUrl  The API URL we need to GET in order to obtain the profile JSON
 * @return {Promise}        A pending promise consisting of fetching the user profile from the backend
 */
const cachedFetch = async (userId, apiUrl) => {
  let cacheMap;
  const unsubscribe = pictureStore.subscribe(_avatars => {
    cacheMap = _avatars;
  });
  const userIsNotCached = not(cacheMap.has(userId));

  /**
   * If user avatar isn't cached yet
   * let's fetch it and store the Promise in cache
   * so other components may `await` it
   */
  if (userIsNotCached) {
    pictureStore.set(cacheMap.set(userId, promiseToFetch(apiUrl)));
  }

  unsubscribe();
  return cacheMap.get(userId);
};

/**
 * A simple function that wraps a fetch within a new Promise and returns it
 *
 * @function promiseToFetch
 * @param  {String} apiUrl  The API URL we need to GET in order to obtain the profile JSON
 * @return {Promise}        A pending promise consisting of fetching the user profile from the backend
 */
const promiseToFetch = apiUrl => {
  return new Promise((resolve, reject) => {
    fetch(apiUrl)
      .then(data => data.json())
      .then(data => resolve(data.picture))
      .catch(e => reject(e));
  });
};

export { cachedFetch, pictureStore };
