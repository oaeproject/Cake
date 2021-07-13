// import { humanize } from '@jsdevtools/humanize-anything';
import {
  defaultTo,
  set,
  of,
  clone,
  pipe,
  reverse,
  sort,
  has,
  includes,
  both,
  assocPath,
  equals,
  prop,
  compose,
  lensProp,
} from 'ramda';
import { COMMENT_ACTIVITY_TYPES } from '../models/activity';

const COLLECTION = 'oae:collection';
const OBJECT = 'object';
const ACTOR = 'actor';
const TARGET = 'target';
const ACTIVITY_TYPE = 'oae:activityType';

const areThereSeveralOf = has(COLLECTION);
const getCollectionOf = prop(COLLECTION);
const getActivityType = prop(ACTIVITY_TYPE);

const humanizeActivityVerb = verb => {
  return ` ${verb}d`;
};

/**
 * Sort entities based on whether or not they have a thumbnail. Entities with
 * thumbnails will be listed in front of those with no thumbnails, as we give
 * preference to these for UI rendering purposes.
 */
const sortEntityCollection = function (a, b) {
  if (a.image && !b.image) {
    return -1;
  }

  if (!a.image && b.image) {
    return 1;
  }

  return 0;
};

/**
 * Sort comments based on when they have been created. The comments list will be
 * ordered from new to old.
 */
const sortComments = function (a, b) {
  // Threadkeys will have the following format, primarily to allow for proper thread ordering:
  //  - Top level comments: <createdTimeStamp>|
  //  - Reply: <parentCreatedTimeStamp>#<createdTimeStamp>|
  if (a['oae:threadKey'].split('#').pop() < b['oae:threadKey'].split('#').pop()) {
    return 1;
  }

  return -1;
};

/**
 * Check if a set of comments contains a specific comment that is identified by its id
 *
 * @param  {Comment[]}  comments    The set of comments to check
 * @param  {String}     id          The id of the comment to search for
 * @return {Comment}                The comment if it was found, `undefined` otherwise
 * @api private
 */
const find = function (comments, id) {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i]['oae:id'] === id) {
      return comments[i];
    }
  }

  return undefined;
};

/**
 * Find the full "original" comment object for a comment in a set of comments. If the
 * "original" comment could not be found we return the comment as is. This function
 * is most-useful as an `inReplyTo` object on a comment object does NOT contain its
 * own parent comment. By using this function you will be able to find the "original"
 * node that does include that parent reply.
 *
 * For example, suppose we have the following comment structure:
 *
 * ```
 * - Comment A
 *    - Comment B
 *       - Comment C
 * ```
 *
 * The data returned by the activity stream API would look like this:
 * ```
 * [
 *    {'id': 'A'},
 *    {'id': 'B', 'inReplyTo': {'id': 'A'}}
 *    {'id': 'C', 'inReplyTo': {'id': 'B'}}
 * ]
 * ```
 *
 * If we are to construct a tree by starting with comment C and pushing its
 * `inReplyTo` object into our temporary set, we would lose the information
 * that A is the parent of B. This function will return the full ("original")
 * B object rather than just the C.inReplyTo object.
 *
 * @param  {Comment[]}  comments    The set of comments to find the "original" comment in
 * @param  {Comment}    comment     The comment for which to find the "original" comment
 * @return {Comment}                The "original" comment
 * @api private
 */
const findComment = function (comments, comment) {
  // Find the "original" parent comment object
  const originalComment = find(comments, comment['oae:id']);

  // Return the "original" comment object if there was one
  if (originalComment) {
    return originalComment;

    // It's possible that we can't find the "original" comment object because
    // it expired out of the aggregation cache. In that case we return the comment as is
  }

  return comment;
};

/**
 * Construct a tree of the last two comments that were made. If these comments
 * were replies, the parent comments will be included in the resulting tree.
 *
 * @param  {Comment[]}  comments    A sorted set of comments where the latest comment can be found at the beginning of the set
 * @return {Comment[]}              A tree of comments for the last two comments (and potentially their parents)
 * @api private
 */
const constructLatestCommentTree = function (comments) {
  // This set will hold the last 2 comments (and their parents)
  const latestComments = [];

  // Add the latest comment
  latestComments.push(comments[0]);

  // If the latest comment has a parent, include it
  if (comments[0].inReplyTo) {
    latestComments.push(findComment(comments, comments[0].inReplyTo));
  }

  // Check the next comment (if any)
  if (comments[1]) {
    // If the next comment is not in the tree yet, we add it. This happens
    // when it's not the parent of the first comment
    if (!find(latestComments, comments[1]['oae:id'])) {
      latestComments.push(comments[1]);

      // If this comment has a parent that's not in the latestComments
      // set yet, we include it
      if (comments[1].inReplyTo && !find(latestComments, comments[1].inReplyTo['oae:id'])) {
        latestComments.push(findComment(comments, comments[1].inReplyTo));
      }

      // If the next comment was in the tree already, it means that it is
      // the parent of the first comment. It might still have a parent that
      // could be relevant to display in the activity stream though. If that
      // is the case, we will end up with a tree that is 3 levels deep
    } else if (comments[1].inReplyTo && !find(latestComments, comments[1].inReplyTo['oae:id'])) {
      latestComments.push(findComment(comments, comments[1].inReplyTo));
    }
  }

  // Construct a comment tree and return it
  return constructCommentTree(latestComments);
};

/**
 * Process a list of comments into an ordered tree that contains
 * the comments they were replies to, if any,
 * as well as the level at which all of these comments need to be rendered.
 *
 * @param  {Comment[]}   comments   The array of comments to turn into an ordered tree
 * @return {Comment[]}              The ordered tree of comments with an `oae:level` property for each comment, representing the level at which they should be rendered
 * @api private
 */
const constructCommentTree = function (comments) {
  // Because this method gets called multiple times and there's no good way to deep clone
  // an array of objects in native JS, we ensure that any in-place edits to comment objects
  // in a previous run don't have an impact now
  comments.forEach(comment => {
    comment.replies = [];
  });

  // Construct a proper graph wherein each object in the top level array is a comment
  // If a comment has replies they will be made available on the `replies` property
  const commentTree = [];
  comments.forEach(comment => {
    // If this comment was a reply to another comment, we try to find that parent comment
    // and add the current comment as a reply to the parent. If the parent could not be found,
    // we add the comment as a top level comment. This can happen when we're rendering a tree
    // of the latest 4 comments for example
    if (comment.inReplyTo) {
      const parent = find(comments, comment.inReplyTo['oae:id']);
      if (parent) {
        parent.replies.push(comment);
      } else {
        commentTree.push(comment);
      }

      // If this comment was not a reply, it's considered a top-level comment
    } else {
      commentTree.push(comment);
    }
  });

  // Now flatten the graph so it can easily be rendered in a TrimPath template
  const flatCommentTree = [];
  flattenCommentTree(flatCommentTree, commentTree);
  return flatCommentTree;
};

/**
 * Walks through the comments graph in `commentTree` in a recursive depth-first manner.
 * Each comment that is encountered is added to the `flatCommentTree` including the level
 * that it should be displayed at.
 *
 * @param  {Object[]}   flatCommentTree             The flattened comment tree
 * @param  {Number}     flatCommentTree[i].level    The level the comment was made at
 * @param  {Comment}    flatCommentTree[i].comment  The comment that was made
 * @param  {Comment[]}  commentTree                 The (nested) graph to walk through
 * @api private
 */
const flattenCommentTree = function (flatCommentTree, commentTree, _level = 0) {
  // Sort the comments on this level so newest comments are at the top
  commentTree.sort(sortComments);

  // Visit each comment
  commentTree.forEach(comment => {
    // Ensure that the `published` timestamp is a number
    comment.published = parseInt(comment.published, 10);

    // Add the comment to the array
    flatCommentTree.push({
      level: _level,
      comment,
    });

    // If this comment has any replies, we add those as well
    if (comment.replies) {
      flattenCommentTree(flatCommentTree, comment.replies, _level + 1);
    }
  });
};

/**
 * Prepare an activity (in-place) in such a way that:
 *  - actors with an image are ordered first
 *  - objects with an image are ordered first
 *  - targets with an image are ordered first
 *  - comments are processed into an ordered set
 *  - each comment is assigned the level in the comment tree
 *
 * @param  {User}       me          The currently loggedin user
 * @param  {Activity}   activity    The activity to prepare
 * @api private
 */
const prepareActivity = function (activity) {
  // Reverse the items so the item that was changed last is shown first
  if (areThereSeveralOf(activity.actor)) {
    const reversedActors = pipe(prop(ACTOR, getCollectionOf, reverse, sort(sortEntityCollection)))(activity);
    set(lensProp(COLLECTION), reversedActors, activity.actor);
  }

  // Reverse the items so the item that was changed last is shown first
  if (areThereSeveralOf(activity.object)) {
    const reversedObjects = pipe(prop(OBJECT), getCollectionOf, reverse, sort(sortEntityCollection))(activity);
    set(lensProp(COLLECTION), reversedObjects, activity.object);
  }

  // Reverse the items so the item that was changed last is shown first
  if (areThereSeveralOf(activity.target)) {
    const reversedTargets = pipe(prop(TARGET), getCollectionOf, reverse(), sort(sortEntityCollection))(activity);
    set(lensProp(COLLECTION), reversedTargets, activity.target);
  }

  // We process the comments into an ordered set
  const isOneOfCommentActivities = includes(getActivityType(activity), COMMENT_ACTIVITY_TYPES);
  if (isOneOfCommentActivities) {
    const cloneOfActivityObject = pipe(prop(OBJECT), clone, of)(activity);
    let comments = defaultTo(cloneOfActivityObject, activity.object['oae:collection']);
    /*
    if (!comments) {
      comments = of(clone(activity.object));
    }
    */
    /**
     * Keep track of the full list of comments on the activity. This will be used to check
     * whether or not all comments on the activity have made it into the final ordered list
     */
    // const originalComments = comments.slice();

    // Sort the comments based on the created timestamp
    comments.sort(sortComments);

    // Construct a tree of the last 2 comments and their parents
    const latestComments = constructLatestCommentTree(comments);

    // Convert these comments into an ordered tree that also includes the comments they were
    // replies to, if any
    const allComments = constructCommentTree(comments);

    activity.object.objectType = 'comments';
    activity.object['oae:collection'] = allComments;
    activity.object.latestComments = latestComments;
  }

  return activity;
};

const parseActivityActor = (eachActivityActor, currentUser) => {
  const copySmallPictureFromCurrentUser = assocPath(['picture', 'small'], currentUser.smallPicture);
  const copyMediumPictureFromCurrentUser = assocPath(['picture', 'medium'], currentUser.mediumPicture);
  const copyLargePictureFromCurrentUser = assocPath(['picture', 'large'], currentUser.largePicture);

  const getActorId = prop('oae:id');
  const hasAnyPicture = prop('hasAnyPicture');
  const sameAsActivityActor = compose(equals(getActorId(eachActivityActor)), prop('id'));
  const isCurrentUserTheActorAndDoesItHavePictures = both(sameAsActivityActor, hasAnyPicture)(currentUser);

  if (isCurrentUserTheActorAndDoesItHavePictures) {
    eachActivityActor = compose(
      copySmallPictureFromCurrentUser,
      copyMediumPictureFromCurrentUser,
      copyLargePictureFromCurrentUser,
    )(eachActivityActor);
  } else {
    // TODO simplify
    if (eachActivityActor.image && eachActivityActor.image.url) {
      eachActivityActor.thumbnailUrl = eachActivityActor.image.url;
    }

    // TODO simplify
    if (eachActivityActor['oae:wideImage'] && eachActivityActor['oae:wideImage'].url) {
      eachActivityActor.wideImageUrl = eachActivityActor['oae:wideImage'].url;
    }

    // TODO simplify
    if (eachActivityActor['oae:mimeType']) {
      eachActivityActor.mime = eachActivityActor['oae:mimeType'];
    }
  }

  return eachActivityActor;
};

export {
  humanizeActivityVerb,
  sortEntityCollection,
  parseActivityActor,
  sortComments,
  find,
  findComment,
  constructLatestCommentTree,
  constructCommentTree,
  flattenCommentTree,
  prepareActivity,
};
