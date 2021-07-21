import {
  assocPath,
  __,
  not,
  isNil,
  nth,
  head,
  last,
  split,
  and,
  equals,
  compose,
  both,
  defaultTo,
  set,
  of,
  clone,
  reverse,
  sort,
  has,
  includes,
  prop,
  lensProp,
  find,
  propEq,
} from 'ramda';

const ID = 'id';
const THREAD_KEY = 'oae:threadKey';
const WIDE_IMAGE = 'oae:wideImage';
const MIME_TYPE = 'oae:mimeType';
const PICTURE = 'picture';
const SMALL = 'small';
const MEDIUM = 'medium';
const LARGE = 'large';
const COMMENTS = 'comments';
const IMAGE = 'image';
const OAE_ID = 'oae:id';
const HAS_ANY_PICTURE = 'hasAnyPicture';
const OBJECT = 'object';
const ACTOR = 'actor';
const TARGET = 'target';
const COLLECTION = 'oae:collection';
const ACTIVITY_TYPE = 'oae:activityType';

const hasImage = has(IMAGE);
const hasNotImage = compose(not, has(IMAGE));
const equalsId = propEq(OAE_ID);
const getId = prop(OAE_ID);
const getCommentId = getId;
const hasAnyPicture = prop(HAS_ANY_PICTURE);
const areThereSeveralOf = has(COLLECTION);
const getCollectionOf = prop(COLLECTION);
const getActivityType = prop(ACTIVITY_TYPE);

// Constant that holds the different activity types that are used for comment activities
export const COMMENT_ACTIVITY_TYPES = [
  'content-comment',
  'folder-comment',
  'discussion-message',
  'meeting-jitsi-message',
];

// Constant that holds the different activity types that are used for sharing activities
// const SHARE_ACTIVITY_TYPES = ['content-share', 'discussion-share', 'folder-share', 'meeting-jitsi-share'];

/**
 * Prepare an activity (in-place) in such a way that:
 *  - actors with an image are ordered first
 *  - objects with an image are ordered first
 *  - targets with an image are ordered first
 *  - comments are processed into an ordered set
 *  - each comment is assigned the level in the comment tree
 *
 * @param  {User}       me          The currently loggedin user
 * @param  {Activity}   activity    The activity to "prepare" and transform
 * @api private
 */
const prepareActivity = function (activity) {
  if (areThereSeveralOf(activity.actor)) {
    activity.actor = reverseActors(activity);
  }

  if (areThereSeveralOf(activity.object)) {
    activity.object = reverseObjects(activity);
  }

  if (areThereSeveralOf(activity.target)) {
    activity.target = reverseTargets(activity);
  }

  // We process the comments into an ordered set
  const activityIsAComment = includes(getActivityType(activity), COMMENT_ACTIVITY_TYPES);

  if (activityIsAComment) {
    activity = setUpCommentTree(activity);
  }

  return activity;
};

// TODO jsdoc
const setUpCommentTree = activity => {
  const defaultToClone = compose(defaultTo, of, clone, prop(OBJECT))(activity);
  const sortByTimestamp = sort(sortCommentsByTimestamp);
  let sortComments = compose(sortByTimestamp, defaultToClone, getCollectionOf, prop(OBJECT));

  // Construct a tree of the last 2 comments and their parents
  const latestComments = compose(constructLatestCommentTree, sortComments)(activity);

  // Construct an ordered tree from the comments plus the ones they replied to, if any
  const allComments = compose(constructCommentTree, sortComments)(activity);

  activity.object.objectType = COMMENTS;
  activity.object[COLLECTION] = allComments;
  activity.object.latestComments = latestComments;

  return activity;
};

// TODO jsdoc
const reverseActors = activity => {
  const updateActor = compose(
    set(lensProp(COLLECTION)),
    sort(sortEntityCollection),
    reverse,
    getCollectionOf,
    prop(ACTOR),
  )(activity);

  return updateActor(activity.actor);
};

// TODO jsdoc
const reverseObjects = activity => {
  const updateObject = compose(
    set(lensProp(COLLECTION)),
    sort(sortEntityCollection),
    reverse,
    getCollectionOf,
    prop(OBJECT),
  )(activity);

  return updateObject(activity.object);
};

// TODO jsdoc
const reverseTargets = activity => {
  const updateTarget = compose(
    set(lensProp(COLLECTION)),
    sort(sortEntityCollection),
    reverse(),
    getCollectionOf,
    prop(TARGET),
  )(activity);

  return updateTarget(activity.target);
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
  const firstComment = head(comments);
  const secondComment = nth(1, comments);

  // Add the latest comment
  latestComments.push(firstComment);

  // If the latest comment has a parent, include it
  if (firstComment.inReplyTo) {
    latestComments.push(findOriginalComment(firstComment.inReplyTo, comments));
  }

  if (secondComment) {
    /**
     * If the next comment is not in the tree yet, we add it.
     * This happens when it's not the parent of the first comment
     */
    const withinLatestComments = find(__, latestComments);
    const notInTree = compose(not, withinLatestComments, equalsId, getCommentId);
    const isNotNil = compose(not, isNil);
    const hasParentWhichIsNotInTree = compose(notInTree, isNotNil, prop('inReplyTo'));

    // TODO this makes no sense... same code for if and for else?
    if (notInTree(secondComment)) {
      latestComments.push(secondComment);

      /**
       * If this comment has a parent that's not in the latestComments set yet, we include it
       */
      if (hasParentWhichIsNotInTree(secondComment)) {
        latestComments.push(findOriginalComment(secondComment.inReplyTo, comments));
      }

      /**
       * If the next comment was in the tree already, it means that it is
       * the parent of the first comment. It might still have a parent that
       * could be relevant to display in the activity stream though. If that
       * is the case, we will end up with a tree that is 3 levels deep
       */
    } else if (hasParentWhichIsNotInTree(secondComment)) {
      latestComments.push(findOriginalComment(secondComment.inReplyTo, comments));
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
  /**
   * Because this method gets called multiple times and there's no good way to deep clone
   * an array of objects in native JS, we ensure that any in-place edits to comment objects
   * in a previous run don't have an impact now
   */
  comments.forEach(comment => {
    comment.replies = [];
  });

  /**
   * Construct a proper graph wherein each object in the top level array is a comment
   * If a comment has replies they will be made available on the `replies` property
   */
  const commentTree = [];
  comments.forEach(comment => {
    /**
     * If this comment was a reply to another comment, we try to find that parent comment
     * and add the current comment as a reply to the parent. If the parent could not be found,
     * we add the comment as a top level comment. This can happen when we're rendering a tree
     * of the latest 4 comments for example
     */
    if (comment.inReplyTo) {
      const parent = find(equalsId(getId(comment.inReplyTo)), comments);
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
  commentTree.sort(sortCommentsByTimestamp);

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
 * Sort entities based on whether or not they have a thumbnail. Entities with
 * thumbnails will be listed in front of those with no thumbnails, as we give
 * preference to these for UI rendering purposes.
 *
 * @function sortEntityCollection
 * @param  {String} a   Some Activity item
 * @param  {String} b   Some other Activity item
 * @return {Number}     Either 1 or -1 to sort out which should come out first
 */
const sortEntityCollection = function (a, b) {
  const onlyFirstHasImage = and(hasImage(a), hasNotImage(b));
  const onlySecondHasImage = and(hasNotImage(a), hasImage(b));

  switch (true) {
    case onlyFirstHasImage:
      return -1;
    case onlySecondHasImage:
      return 1;
    default:
      return 0;
  }
};

/**
 * Sort comments based on when they have been created.
 * The comments list will be ordered from new to old.
 *
 * @function sortCommentsByTimestamp
 * @param  {String} a   Some Comment
 * @param  {String} b   Some other Comment
 * @return {Number}     Either 1 or -1 to sort out which should come out first
 */
const sortCommentsByTimestamp = function (a, b) {
  /**
   * Threadkeys will have the following format, primarily to allow for proper thread ordering:
   *  - Top level comments: <createdTimeStamp>|
   *  - Reply: <parentCreatedTimeStamp>#<createdTimeStamp>|
   */
  const getParentTimestamp = compose(last, split('#'), prop(THREAD_KEY));

  switch (true) {
    case getParentTimestamp(a) < getParentTimestamp(b):
      return 1;
    default:
      return -1;
  }
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
 * @param  {Comment[]}  setOfComments    The set of comments to find the "original" comment in
 * @param  {Comment}    comment     The comment for which to find the "original" comment
 * @return {Comment}                The "original" comment
 * @api private
 */
const findOriginalComment = (comment, setOfComments) => {
  // Find the "original" parent comment object
  const findWithin = find(__, setOfComments);
  const originalComment = compose(findWithin, equalsId, prop(ID))(comment);

  // Return the "original" comment object if there was one
  if (originalComment) return originalComment;

  /**
   * It's possible that we can't find the "original" comment object because
   * it expired out of the aggregation cache. In that case we return the comment as is
   */
  return comment;
};

const parseActivityActor = (eachActivityActor, currentUser) => {
  const copySmallPictureFromCurrentUser = assocPath([PICTURE, SMALL], currentUser.smallPicture);
  const copyMediumPictureFromCurrentUser = assocPath([PICTURE, MEDIUM], currentUser.mediumPicture);
  const copyLargePictureFromCurrentUser = assocPath([PICTURE, LARGE], currentUser.largePicture);

  const sameAsActivityActor = compose(equals(getId(eachActivityActor)), prop(ID));
  const isActorAndHasPictures = both(sameAsActivityActor, hasAnyPicture)(currentUser);

  if (isActorAndHasPictures) {
    eachActivityActor = compose(
      copySmallPictureFromCurrentUser,
      copyMediumPictureFromCurrentUser,
      copyLargePictureFromCurrentUser,
    )(eachActivityActor);
  } else {
    if (eachActivityActor?.image?.url) {
      eachActivityActor.thumbnailUrl = eachActivityActor.image.url;
    }

    if (eachActivityActor[WIDE_IMAGE]?.url) {
      eachActivityActor.wideImageUrl = eachActivityActor[WIDE_IMAGE].url;
    }

    if (eachActivityActor[MIME_TYPE]) {
      eachActivityActor.mime = eachActivityActor[MIME_TYPE];
    }
  }

  return eachActivityActor;
};

export { prepareActivity, parseActivityActor };
