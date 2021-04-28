import {
  values,
  both,
  assocPath,
  equals,
  prop,
  compose,
  assoc,
  map,
} from "ramda";
import { ActivityItem } from "../models/activity";
import anylogger from "anylogger";
import { derived, writable } from "svelte/store";
import { user } from "./user";
import { prepareActivity } from "../helpers/activity";
import { generateSummary } from "../helpers/activity-summary";

const log = anylogger("activity-store");
const activities = writable([]);
let currentUser;

const getCurrentUserFromStore = () => {
  let currentUser;
  const unsubscribe = user.subscribe((_currentUser) => {
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
    const parsedActivities: ActivityItem[] = processActivities(
      $activities,
      currentUser
    );
    set(parsedActivities);
  },
  []
);

const fetchUserActivities = async () => {
  try {
    const response = await fetch("/api/activity");
    const data = await response.json();
    return values(data.items);
  } catch (error: unknown) {
    log.error(`Unable to get user activities from the API`, error);
    log.error(error);
  }
};

const processActivities = (rawActivities, asSomeUser): ActivityItem[] => {
  const processActivity = (eachActivity): ActivityItem => {
    // Move the relevant items (comments, previews, ..) to the top
    prepareActivity(eachActivity);

    // Generate an i18nable summary for this activity
    // const summary = generateSummary(asSomeUser, eachActivity);

    // Generate the primary actor view
    // const primaryActor = generatePrimaryActor(me, eachActivity);

    // Generate the activity preview items
    // const activityItems = generateActivityPreviewItems(context, eachActivity);

    // Construct the adapted activity
    // return new ActivityItem(eachActivity, summary, primaryActor, activityItems);

    // return eachActivity;

    eachActivity = assoc(
      "actor",
      parseActivityActor(eachActivity.actor, asSomeUser),
      eachActivity
    );
    const activityItem = new ActivityItem(eachActivity);
    return activityItem;
  };

  return map(processActivity, rawActivities);
};

// Use the most up-to-date profile picture when available
const parseActivityActor = (eachActivityActor, currentUser) => {
  const copySmallPictureFromCurrentUser = assocPath(
    ["picture", "small"],
    currentUser.smallPicture
  );
  const copyMediumPictureFromCurrentUser = assocPath(
    ["picture", "medium"],
    currentUser.mediumPicture
  );
  const copyLargePictureFromCurrentUser = assocPath(
    ["picture", "large"],
    currentUser.largePicture
  );

  const getActorId = prop("oae:id");
  const hasAnyPicture = prop("hasAnyPicture");
  const sameAsActivityActor = compose(
    equals(getActorId(eachActivityActor)),
    prop("id")
  );
  const isCurrentUserTheActorAndDoesItHavePictures = both(
    sameAsActivityActor,
    hasAnyPicture
  )(currentUser);

  if (isCurrentUserTheActorAndDoesItHavePictures) {
    eachActivityActor = compose(
      copySmallPictureFromCurrentUser,
      copyMediumPictureFromCurrentUser,
      copyLargePictureFromCurrentUser
    )(eachActivityActor);
  } else {
    // TODO simplify
    if (eachActivityActor.image && eachActivityActor.image.url) {
      eachActivityActor.thumbnailUrl = eachActivityActor.image.url;
    }

    // TODO simplify
    if (
      eachActivityActor["oae:wideImage"] &&
      eachActivityActor["oae:wideImage"].url
    ) {
      eachActivityActor.wideImageUrl = eachActivityActor["oae:wideImage"].url;
    }

    // TODO simplify
    if (eachActivityActor["oae:mimeType"]) {
      eachActivityActor.mime = eachActivityActor["oae:mimeType"];
    }
  }

  return eachActivityActor;
};

export { fetchUserActivities, activities, processedActivities };
