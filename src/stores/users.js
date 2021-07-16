import { writable } from 'svelte/store';
import { Map } from 'immutable';

/**
 * This store is in fact a Map where for every userId there is
 * an object with all picture sizes like this
 * { small:, medium:, large: }
 */
// const usersAvatars = writable(new Map());

/**
 * @function fetchUserAvatar
 * @param  {User} actor   The actor/user we're fetching the profile from the backend
 * @param  {Map}  users   The Map holding the cache for users' profile pictures
 * @return {Object}       An object with all picture sizes (`small`, `medium` and `large`)
 */
const fetchUserAvatar = async (actor, userIsCached) => {
  // const userIsCached = usersAvatars.has(actor.id);
  let pictureSet = null;

  if (userIsCached) {
    // TODO debug
    console.log(`Fetching avatar for ${actor.displayName} from cache!`);

    pictureSet = usersAvatars.get(actor.id);
    return pictureSet;
  } else {
    // TODO debug
    console.log(`Fetching avatar for ${actor.displayName} from Hilary!`);

    /*
    let data = await fetch(actor.apiUrl);
    data = await data.json();
    pictureSet = data.picture;

    // TODO: Side-effect, not a pure function anymore
    usersAvatars.set(users.set(actor.id, pictureSet));

    // TODO debug
    console.log(`Cache size: ${users.size}`);
    return pictureSet;
    */

    return fetch(actor.apiUrl)
      .then(data => data.json())
      .then(data => data.picture)
      .then(pictureSet => {
        usersAvatars.set(usersAvatars.set(actor.id, pictureSet));
        // TODO debug
        console.log(`Cache size: ${usersAvatars.size}`);
        return pictureSet;
      });
  }
};

/**
 * @function getAvatar
 * @param  {User} actor   The actor/user we're fetching the profile from the backend
 * @param  {Map}  users   The Map holding the cache for users' profile pictures
 * @return {String}       The medium picture Uri
 */
const getAvatar = async (actor, users) => {
  switch (true) {
    case actor.hasNoPicture:
      return fetchUserAvatar(actor, users);
    case actor.hasAnyPicture:
      return { small: actor.smallPicture, medium: actor.mediumPicture, large: actor.largePicture };
  }
};

function createAvatarMap() {
  const { subscribe, set, update } = writable(new Map());

  return {
    subscribe,
    addEntry: (key, value) =>
      update(old => {
        const oldSize = old.size;
        const newMap = old.set(key, value);
        // console.log('cache size: ' + oldSize + ' -> ' + newMap.size);
        return newMap;
      }),
    setTo: newMap => set(newMap),
  };
}

export const avatars = createAvatarMap();
