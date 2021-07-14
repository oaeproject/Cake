import { User } from './user';
import { Resource } from './resource';
import { Comment } from './comment';
import { generateSummary } from '../helpers/activity-summary';
import { map, defaultTo, of, nth, has, head as first, prop, pipe } from 'ramda';
import { prepareActivity } from '../helpers/activity';

const COLLECTION = 'oae:collection';
const ACTOR = 'actor';
const OBJECT = 'object';
const TARGET = 'target';
const COMMENT = 'comment';
const LATEST_COMMENTS = 'latestComments';

const second = nth(1);
const getActor = prop(ACTOR);
const getObject = prop(OBJECT);
const getTarget = prop(TARGET);
const getCollection = prop(COLLECTION);

const getActorCollection = pipe(getActor, getCollection);
const getObjectCollection = pipe(getObject, getCollection);
const getTargetCollection = pipe(getTarget, getCollection);

const hasSeveralActors = pipe(getActor, has(COLLECTION));
const hasSeveralObjects = pipe(getObject, has(COLLECTION));
const hasSeveralTargets = pipe(getTarget, has(COLLECTION));
const hasSingleTarget = has(TARGET);

const isThisAComment = has(COMMENT);
const otherwiseEmptyArray = defaultTo([]);

// Variable that keeps track of the different activity types that are used for comment activities
export const COMMENT_ACTIVITY_TYPES = [
  'content-comment',
  'folder-comment',
  'discussion-message',
  'meeting-jitsi-message',
];

// Variable that keeps track of the different activity types that are used for sharing activities
const SHARE_ACTIVITY_TYPES = ['content-share', 'discussion-share', 'folder-share', 'meeting-jitsi-share'];
const getActivityType = prop('oae:activityType');
const getId = prop('oae:activityId');
const convertToCommentModel = eachComment => new Comment(eachComment.comment, eachComment.level);

export class ActivityItem {
  /**
   * @type {ActivityItem[]}
   * in case this is a collection / aggregate of activity items, I think
   */
  activityItems;

  /** @type {number} */
  id;

  /** @type {string} */
  activityType;

  /** @type {ActivityItem} */
  originalActivity;

  /** @type {Date} */
  published;

  /** @type {Resource} */
  object;

  /** @type {string} */
  verb;

  /** @type {string} */
  summary;

  /** @type {Comment[]} */
  // allComments;

  /** @type {Comment[]} */
  latestComments;

  /** @type {Resource[]} */
  allObjects = [];

  /** @type {Resource[]} */
  allTargets = [];

  /** @type {User[]} */
  allActors = [];

  constructor(rawActivity) {
    this.id = getId(rawActivity);
    this.activityType = getActivityType(rawActivity);
    this.published = new Date(rawActivity?.published);
    this.verb = rawActivity?.verb;

    /**
     * Temporary
     */
    // Move the relevant items (comments, previews, ..) to the top
    rawActivity = prepareActivity(rawActivity);
    this.latestComments = otherwiseEmptyArray(rawActivity.object.latestComments);

    /**
     * Convert the latest comments into Comment model objects
     */
    this.latestComments = pipe(
      prop(OBJECT),
      prop(LATEST_COMMENTS),
      otherwiseEmptyArray,
      map(convertToCommentModel),
    )(rawActivity);

    let actors = [];
    if (hasSeveralActors(rawActivity)) {
      actors = getActorCollection(rawActivity).map(eachActor => {
        return new User(eachActor);
      });
    } else {
      actors = of(new User(rawActivity?.actor));
    }
    this.allActors = actors;

    let objects = [];
    if (hasSeveralObjects(rawActivity)) {
      objects = getObjectCollection(rawActivity).map(eachObject => {
        // TODO make this simpler
        if (isThisAComment(eachObject)) {
          return new Comment(eachObject.comment, eachObject.level);
        } else {
          return new Resource(eachObject);
        }
      });
    } else {
      objects = of(new Resource(rawActivity?.object));
    }
    this.allObjects = objects;

    let targets = [];
    if (hasSeveralTargets(rawActivity)) {
      targets = getTargetCollection(rawActivity).map(eachTarget => {
        return new Resource(eachTarget);
      });
    } else if (hasSingleTarget(rawActivity)) {
      targets = of(new Resource(rawActivity?.target));
    }
    this.allTargets = targets;
  }

  getSummary(currentUser) {
    return generateSummary(currentUser, this);
  }

  getPrimaryActor() {
    return first(this.allActors);
  }

  getSecondaryActor() {
    return second(this.allActors);
  }

  getPrimaryObject() {
    return first(this.allObjects);
  }

  getSecondaryObject() {
    return second(this.allObjects);
  }

  getPrimaryTarget() {
    return first(this.allTargets);
  }

  getSecondaryTarget() {
    return second(this.allTargets);
  }
}
