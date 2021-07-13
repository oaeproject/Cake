import { set, lensProp, values, map } from 'ramda';
import { ActivityItem } from '../models/activity';
import { parseActivityActor } from '../helpers/activity';
import anylogger from 'anylogger';
import { derived, writable } from 'svelte/store';
import { user } from './user';

const log = anylogger('activity-store');
const activities = writable([]);
let currentUser;

const getCurrentUserFromStore = () => {
  let currentUser;
  const unsubscribe = user.subscribe(_currentUser => {
    currentUser = _currentUser;
  });
  unsubscribe();
  return currentUser;
};

/**
 * Check https://svelte.dev/docs#derived for details on how to derive from multiple values
 */
const processedActivities = derived(
  activities,
  ($activities, set) => {
    currentUser = getCurrentUserFromStore();
    const parsedActivities = processActivities($activities, currentUser);
    set(parsedActivities);
  },
  [],
);

const fetchUserActivities = async () => {
  try {
    const response = await fetch('/api/activity');
    const data = await response.json();
    return values(data.items);
  } catch (error) {
    log.error(`Unable to get user activities from the API`, error);
    log.error(error);
  }
};

const processActivities = (rawActivities, asSomeUser) => {
  const processActivity = eachActivity => {
    // Generate the primary actor view
    // const primaryActor = generatePrimaryActor(me, eachActivity);

    // Generate the activity preview items
    // const activityItems = generateActivityPreviewItems(context, eachActivity);

    // Construct the adapted activity
    // return new ActivityItem(eachActivity, summary, primaryActor, activityItems);

    // return eachActivity;

    // Use the most up-to-date profile picture when available
    eachActivity = set(lensProp('actor'), parseActivityActor(eachActivity.actor, asSomeUser), eachActivity);
    const activityItem = new ActivityItem(eachActivity);
    return activityItem;
  };

  return map(processActivity, rawActivities);
};

export { fetchUserActivities, activities, processedActivities };
