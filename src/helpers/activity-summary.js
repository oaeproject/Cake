import { isNil, and, __, not, equals, prop, pipe, length, gt, isEmpty } from 'ramda';

const isOne = equals(1);
const isTwo = equals(2);
const isGreaterThanOne = gt(__, 1);
const isDefined = pipe(isNil, not);

const ACTOR = 'actor';
const actorOf = prop(ACTOR);

const TARGET = 'target';
const targetOf = prop(TARGET);

const ID = 'id';
const idOf = prop(ID);

const SUB_TYPE = 'subType';
const subTypeOf = prop(SUB_TYPE);

const OBJECT_TYPE = 'objectType';
const objectTypeOf = prop(OBJECT_TYPE);

const VISIBILITY = 'visibility';
const visibilityOf = prop(VISIBILITY);

const ACTIVITY_TYPE = 'activityType';
const activityTypeOf = prop(ACTIVITY_TYPE);

const PUBLIC = 'public';
const isPublic = equals(PUBLIC);

const LOGGEDIN = 'loggedin';
const isLoggedIn = equals(LOGGEDIN);

const ALL_ACTORS = 'allActors';
const ALL_OBJECTS = 'allObjects';
const ALL_TARGETS = 'allTargets';
const OBJECT_COUNT = 'objectCount';
const ACTOR_COUNT = 'actorCount';
const TARGET_COUNT = 'targetCount';
const USER = 'user';
const GROUP = 'group';
const FOLDER = 'folder';
const FILE = 'file';
const LINK = 'link';
const COLLABDOC = 'collabdoc';
const COLLABSHEET = 'collabsheet';

const countIsOne = (count, properties) => isOne(prop(count, properties));
const countIsTwo = (count, properties) => isTwo(prop(count, properties));
const countIsMoreThanOne = (count, properties) => isGreaterThanOne(prop(count, properties));

const typeIs = (attribute, activity) => pipe(prop(attribute), objectTypeOf, equals)(activity);
const objectSubTypeIs = activity => pipe(subTypeOf, equals)(activity.getPrimaryObject());
const targetSubTypeIs = activity => pipe(subTypeOf, equals)(activity.getPrimaryTarget());

const isTargetTheCurrentUser = (activity, currentUserId) => pipe(targetOf, idOf, equals(currentUserId))(activity);
const objectIsCurrentUser = (activity, currentUserId) => pipe(idOf, equals(currentUserId))(activity.getPrimaryActor());
const actorIsCurrentUser = (activity, currentUserId) => pipe(actorOf, idOf, equals(currentUserId))(activity);

// dont know why the keys __are__like__this__ but oh well
const transformKey = i18nKey => {
  i18nKey = i18nKey.split('__')[2];
  i18nKey = 'shared.oae.bundles.ui.' + i18nKey;
  return i18nKey;
};

/**
 * Given a current set of properties, property key and an entity, attach the values for the
 * entity that can be used to render them in the activity template
 *
 * @param  {Object}     properties                              The arbitrary activity summary properties
 * @param  {String}     propertyKey                             The base key for the property (e.g., actor1, actor2, object1, etc...)
 * @param  {Object}     entity                                  The entity for which to create the summary properties
 * @param  {Function}   sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
 * @param  {Function}   sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
 * @param  {Function}   sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
 * @param  {Object}     [opts]                                  Optional arguments
 * @param  {String}     [opts.resourceHrefOverride]             When specified, this value will replace any URL specified for an entity. This can be used to control outbound links in different contexts (e.g., email invitation)
 * @api private
 */
const setSummaryPropertiesForEntity = function (properties, propertyKey, entity) {
  const displayNameKey = propertyKey;
  const profilePathKey = propertyKey + 'URL';
  const displayLinkKey = propertyKey + 'Link';
  const tenantDisplayNameKey = propertyKey + 'Tenant';

  // This holds the "display name" of the entity
  properties[displayNameKey] = entity.displayName;
  // properties[profilePathKey] = opts.resourceHrefOverride || entity['oae:profilePath'];
  properties[profilePathKey] = entity.profilePath;

  /**
   * If the profile path was set, it indicates that we have access to view the user,
   * therefore we should display a link. If not specified, we should show plain-text
   */
  if (properties[profilePathKey]) {
    properties[displayLinkKey] = '<a href="' + properties[profilePathKey] + '">' + properties[displayNameKey] + '</a>';
  } else {
    properties[displayLinkKey] = '<span>' + properties[displayNameKey] + '</span>';
  }

  if (entity.tenant) {
    properties[tenantDisplayNameKey] = entity.tenant.displayName;
  }
};

/**
 * Given an activity, generate an approriate summary
 *
 * @param  {User}                   me                                      The currently loggedin user
 * @param  {Activity}               activityItem                                The activity for which to generate a summary
 * @param  {Object}                 sanitization                            An object that exposes basic HTML encoding functionality
 * @param  {Function}               sanitization.encodeForHTML              Encode a value such that it is safe to be embedded into an HTML tag
 * @param  {Function}               sanitization.encodeForHTMLAttribute     Encode a value such that it is safe to be embedded into an HTML attribute
 * @param  {Function}               sanitization.encodeForURL               Encode a value such that it is safe to be used as a URL fragment
 * @param  {Object}                 [opts]                                  Optional arguments
 * @param  {String}                 [opts.resourceHrefOverride]             When specified, this value will replace any URL specified for an entity. This can be used to control outbound links in different contexts (e.g., email invitation)
 * @return {ActivityItem}                                            The summary for the given activity
 * @api private
 */
const generateSummary = function (me, activityItem) {
  const i18nDynamicValues /*: { actorCount: number; objectCount: number } */ = {
    actorCount: null,
    objectCount: null,
  };
  const activityIs = pipe(activityTypeOf, equals)(activityItem);

  const hasPrimaryActor = activity => isDefined(activity.getPrimaryActor());
  const hasSecondaryActor = activity => isDefined(activity.getSecondaryActor());

  const hasPrimaryObject = activity => isDefined(activity.getPrimaryObject());
  const hasSecondaryObject = activity => isDefined(activity.getSecondaryObject());

  const hasPrimaryTarget = activity => isDefined(activity.getPrimaryTarget());
  const hasSecondaryTarget = activity => isDefined(activity.getSecondaryTarget());

  const hasTargets = pipe(prop(ALL_TARGETS), isEmpty, not);
  const numberOfActors = pipe(prop(ALL_ACTORS), length);
  const numberOfObjects = pipe(prop(ALL_OBJECTS), length);
  const numberOfTargets = pipe(prop(ALL_TARGETS), length);

  // Prepare the actor-related variables that will be present in the i18n keys
  let actor1 = null;
  i18nDynamicValues.actorCount = 1;

  if (hasPrimaryActor(activityItem)) {
    actor1 = activityItem.getPrimaryActor();
    if (hasSecondaryActor(activityItem)) {
      // Apply the actor count information to the summary properties
      i18nDynamicValues.actorCount = numberOfActors(activityItem);
      i18nDynamicValues.actorCountMinusOne = i18nDynamicValues.actorCount - 1;

      // Apply additional actor information
      setSummaryPropertiesForEntity(i18nDynamicValues, 'actor2', activityItem.getSecondaryActor());
    }
  } else {
    actor1 = activityItem.getPrimaryActor();
  }

  // Apply the actor1 information to the summary properties
  setSummaryPropertiesForEntity(i18nDynamicValues, 'actor1', actor1);

  // Prepare the object-related variables that will be present in the i18n keys
  let object1 = null;
  i18nDynamicValues.objectCount = 1;

  if (hasPrimaryObject(activityItem)) {
    object1 = activityItem.getPrimaryObject();
    if (hasSecondaryObject(activityItem)) {
      // Apply the object count information to the summary properties
      i18nDynamicValues.objectCount = numberOfObjects(activityItem);
      i18nDynamicValues.objectCountMinusOne = i18nDynamicValues.objectCount - 1;

      // Apply additional object information
      setSummaryPropertiesForEntity(i18nDynamicValues, 'object2', activityItem.getSecondaryObject());
    }
  } else {
    object1 = activityItem.getPrimaryObject();
  }

  // Apply the object1 information to the summary properties
  setSummaryPropertiesForEntity(i18nDynamicValues, 'object1', object1);

  // Prepare the target-related variables that will be present in the i18n keys
  let target1Obj = null;

  if (hasTargets(activityItem)) {
    i18nDynamicValues.targetCount = 1;
    if (hasPrimaryTarget(activityItem)) {
      target1Obj = activityItem.getPrimaryTarget();
      if (hasSecondaryTarget(activityItem)) {
        // Apply the target count information to the summary properties
        i18nDynamicValues.targetCount = numberOfTargets(activityItem);
        i18nDynamicValues.targetCountMinusOne = i18nDynamicValues.targetCount - 1;

        // Apply additional target information
        setSummaryPropertiesForEntity(i18nDynamicValues, 'target2', activityItem.getSecondaryTarget());
      }
    } else {
      target1Obj = activityItem.getPrimaryTarget();
    }

    // Apply the target1 information to the summary properties
    setSummaryPropertiesForEntity(i18nDynamicValues, 'target1', target1Obj);
  }

  /**
   * Depending on the activity type, we render a different template that is specific to that activity,
   * to make sure that the summary is as accurate and descriptive as possible
   */

  if (activityIs('content-add-to-library')) {
    return generateContentAddToLibrarySummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('content-comment')) {
    return generateContentCommentSummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('content-create')) {
    return generateContentCreateSummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('content-restored-revision')) {
    return generateContentRestoredRevision(activityItem, i18nDynamicValues);
  }

  if (activityIs('content-revision')) {
    return generateContentRevisionSummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('content-share')) {
    return generateContentShareSummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('content-update')) {
    return generateContentUpdateSummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('content-update-member-role')) {
    return generateContentUpdateMemberRoleSummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('content-update-visibility')) {
    return generateContentUpdateVisibilitySummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('discussion-add-to-library')) {
    return generateDiscussionAddToLibrarySummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('discussion-create')) {
    return generateDiscussionCreateSummary(me, activityItem, i18nDynamicValues);
  }

  if (activityIs('discussion-message')) {
    return generateDiscussionMessageSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('discussion-share')) {
    return generateDiscussionShareSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('discussion-update')) {
    return generateDiscussionUpdateSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('discussion-update-member-role')) {
    return generateDiscussionUpdateMemberRoleSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('discussion-update-visibility')) {
    return generateDiscussionUpdateVisibilitySummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-add-to-folder')) {
    return generateFolderAddToFolderSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-add-to-library')) {
    return generateFolderAddToLibrarySummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-comment')) {
    return generateFolderCommentSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-create')) {
    return generateFolderCreateSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-share')) {
    return generateFolderShareSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-update')) {
    return generateFolderUpdateSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-update-member-role')) {
    return generateFolderUpdateMemberRoleSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('folder-update-visibility')) {
    return generateFolderUpdateVisibilitySummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('following-follow')) {
    return generateFollowingSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('group-add-member')) {
    return generateGroupAddMemberSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('group-create')) {
    return generateGroupCreateSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('group-join')) {
    return generateGroupJoinSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('group-update')) {
    return generateGroupUpdateSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('group-update-member-role')) {
    return generateGroupUpdateMemberRoleSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('group-update-visibility')) {
    return generateGroupUpdateVisibilitySummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('invite') || activityIs('invitation-accept')) {
    return generateInvitationSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('meeting-jitsi-create')) {
    return generateMeetingJitsiCreateSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('meeting-jitsi-message')) {
    return generateMeetingJitsiMessageSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('meeting-jitsi-share')) {
    return generateMeetingJitsiShareSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('meeting-jitsi-update')) {
    return generateMeetingJitsiUpdateSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('meeting-jitsi-update-member-role')) {
    return generateMeetingJitsiUpdateMemberRoleSummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('meeting-jitsi-update-visibility')) {
    return generateMeetingJitsiUpdateVisibilitySummary(me, activityItem, i18nDynamicValues);
  } else if (activityIs('request-to-join-group')) {
    return generateRequestToJoinGroupSummary(me, activityItem, i18nDynamicValues);
    // Fall back on the default activity summary if no specific template is found for the activity type
  } else if (activityIs('request-to-join-group-rejected')) {
    return generateRejectedRequestToJoinGroup(me, activityItem, i18nDynamicValues);
  } else {
    return generateDefaultSummary(me, activityItem, i18nDynamicValues);
  }
};

/**
 * Render the end-user friendly, internationalized summary of an add to content library activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to content library activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {Object}                    A summary object
 * @api private
 */
const generateContentAddToLibrarySummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  const isCollabdoc = objectSubTypeIs(activity, COLLABDOC);
  const isCollabsheet = objectSubTypeIs(activity, COLLABSHEET);
  const isFile = objectSubTypeIs(activity, FILE);
  const isLink = objectSubTypeIs(activity, LINK);

  switch (true) {
    case singleObject:
      switch (true) {
        case isCollabdoc:
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_COLLABDOC__';
          break;
        case isCollabsheet:
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_COLLABSHEET__';
          break;
        case isFile:
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_FILE__';
          break;
        case isLink:
          i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_LINK__';
          break;
      }
      break;
    case coupleObjects:
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2__';
      break;
    default:
      i18nKey = '__MSG__ACTIVITY_CONTENT_ADD_LIBRARY_2+__';
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content comment activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content comment activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {Object}                    A summary object
 * @api private
 */
const generateContentCommentSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  const targetIsCollabdoc = targetSubTypeIs(activity)(COLLABDOC);
  const targetIsCollabsheet = targetSubTypeIs(activity)(COLLABSHEET);
  const targetIsFile = targetSubTypeIs(activity)(FILE);
  const targetIsLink = targetSubTypeIs(activity)(LINK);

  switch (true) {
    case targetIsCollabdoc:
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABDOC_2+__';
          break;
      }
      break;
    case targetIsCollabsheet:
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_COLLABSHEET_2+__';
          break;
      }
      break;
    case targetIsFile:
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_FILE_2+__';
          break;
      }
      break;
    case targetIsLink:
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_COMMENT_LINK_2+__';
          break;
      }
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {Object}                    A summary object
 * @api private
 */
const generateContentCreateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  const singleTarget = countIsOne(TARGET_COUNT, properties);

  const targetTypeIs = typeIs(TARGET, activity);
  const objectTypeIs = objectSubTypeIs(activity);

  const targetIsTheCurrentUser = isTargetTheCurrentUser(activity, me.id);
  const targetIsNotTheCurrentUser = not(targetIsTheCurrentUser);

  /**
   * Add the target to the activity summary when a target is present on the
   * activity and the target is not a user different from the current user
   */
  if (singleTarget && not(and(targetTypeIs(USER), targetIsNotTheCurrentUser))) {
    if (targetIsTheCurrentUser) {
      if (singleObject) {
        if (objectTypeIs(COLLABDOC)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_YOU__';
        } else if (objectTypeIs(COLLABSHEET)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET_YOU__';
        } else if (objectTypeIs(FILE)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_YOU__';
        } else if (objectTypeIs(LINK)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_YOU__';
        }
      } else if (coupleObjects) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_YOU__';
      }
    } else if (targetTypeIs(FOLDER)) {
      if (singleObject) {
        if (objectTypeIs(COLLABDOC)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_FOLDER__';
        } else if (objectTypeIs(COLLABSHEET)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET_FOLDER__';
        } else if (objectTypeIs(FILE)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_FOLDER__';
        } else if (objectTypeIs(LINK)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_FOLDER__';
        }
      } else if (coupleObjects) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_FOLDER__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_FOLDER__';
      }
    } else if (targetTypeIs(GROUP)) {
      if (singleObject) {
        if (objectTypeIs(COLLABDOC)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC_GROUP__';
        } else if (objectTypeIs(COLLABSHEET)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET_GROUP__';
        } else if (objectTypeIs(FILE)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE_GROUP__';
        } else if (objectTypeIs(LINK)) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK_GROUP__';
        }
      } else if (coupleObjects) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2_GROUP__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+_GROUP__';
      }
    }
  } else if (singleObject) {
    if (objectTypeIs(COLLABDOC)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABDOC__';
    } else if (objectTypeIs(COLLABSHEET)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_COLLABSHEET__';
    } else if (objectTypeIs(FILE)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_FILE__';
    } else if (objectTypeIs(LINK)) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_LINK__';
    }
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_CONTENT_CREATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a restored content revision activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the restore content revision activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentRestoredRevision = function (activity, properties) {
  let i18nKey = null;

  const activityObjectTypeIs = objectSubTypeIs(activity);

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  switch (true) {
    case activityObjectTypeIs(COLLABDOC):
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABDOC_2+__';
          break;
      }
      break;
    case activityObjectTypeIs(COLLABSHEET):
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_COLLABSHEET_2+__';
          break;
      }
      break;
    case activityObjectTypeIs(FILE):
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_RESTORED_FILE_2+__';
          break;
      }
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a new content version activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content revision creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentRevisionSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  const objectTypeIs = objectSubTypeIs(activity);

  switch (true) {
    case objectTypeIs(COLLABDOC):
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABDOC_2+__';
          break;
      }
      break;
    case objectTypeIs(COLLABSHEET):
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_COLLABSHEET_2+__';
          break;
      }
      break;
    case objectTypeIs(FILE):
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_FILE_2+__';
          break;
      }
      break;
    case objectTypeIs(LINK):
      switch (true) {
        case singleActor:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_1__';
          break;
        case coupleActors:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_REVISION_LINK_2+__';
          break;
      }
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentShareSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  const singleTarget = countIsOne(TARGET_COUNT, properties);
  const coupleTargets = countIsTwo(TARGET_COUNT, properties);

  const objectTypeIs = objectSubTypeIs(activity);

  const activityTargetIsCurrentUser = isTargetTheCurrentUser(activity, me.id);

  if (singleObject) {
    if (objectTypeIs(COLLABDOC)) {
      if (singleTarget) {
        if (activityTargetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_1__';
        }
      } else if (coupleTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABDOC_2+__';
      }
    } else if (objectTypeIs(COLLABSHEET)) {
      if (singleTarget) {
        if (activityTargetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_1__';
        }
      } else if (coupleTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_COLLABSHEET_2+__';
      }
    } else if (objectTypeIs(FILE)) {
      if (singleTarget) {
        if (activityTargetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_1__';
        }
      } else if (coupleTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_FILE_2+__';
      }
    } else if (objectTypeIs(LINK)) {
      if (singleTarget) {
        if (activityTargetIsCurrentUser) {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_YOU__';
        } else {
          i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_1__';
        }
      } else if (coupleTargets) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_2__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_LINK_2+__';
      }
    }
  } else if (coupleObjects) {
    if (activityTargetIsCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_YOU_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_2__';
    }
  } else if (activityTargetIsCurrentUser) {
    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_YOU_2+__';
  } else {
    i18nKey = '__MSG__ACTIVITY_CONTENT_SHARE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content members update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;

  const targetTypeIs = targetSubTypeIs(activity);
  const singleObject = isOne(properties.objectCount);
  const coupleObjects = isTwo(properties.objectCount);

  if (targetTypeIs(COLLABDOC)) {
    if (singleObject) {
      if (objectIsCurrentUser(activity, me.id)) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_1__';
      }
    } else if (coupleObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABDOC_2+__';
    }
  } else if (targetTypeIs(COLLABSHEET)) {
    if (singleObject) {
      if (objectIsCurrentUser(activity, me.id)) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_1__';
      }
    } else if (coupleObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_COLLABSHEET_2+__';
    }
  } else if (targetTypeIs(FILE)) {
    if (singleObject) {
      if (objectIsCurrentUser(activity, me.id)) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_1__';
      }
    } else if (coupleObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_FILE_2+__';
    }
  } else if (targetTypeIs(LINK)) {
    if (singleObject) {
      if (objectIsCurrentUser(activity, me.id)) {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_1__';
      }
    } else if (coupleObjects) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_MEMBER_ROLE_LINK_2+__';
    }
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

const generateRejectedRequestToJoinGroup = function (me, activity, properties) {
  let i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_REJECTED__';
  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of request activity to join a group.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateRequestToJoinGroupSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  const isActorTheCurrentUser = actorIsCurrentUser(activity, me.id);

  if (singleActor) {
    if (isActorTheCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_1__';
    }
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_REQUEST_TO_JOIN_GROUP_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a meeting.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectIsPublic = pipe(visibilityOf, isPublic)(activity.getPrimaryObject());
  const objectIsLoggedIn = pipe(visibilityOf, isLoggedIn)(activity.getPrimaryObject());

  if (objectIsPublic) {
    i18nKey = '__MSG__ACTIVITY_MEETING_VISIBILITY_PUBLIC__';
  } else if (objectIsLoggedIn) {
    i18nKey = '__MSG__ACTIVITY_MEETING_VISIBILITY_LOGGEDIN__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_VISIBILITY_PRIVATE__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);
  const isObjectTheCurrentUser = objectIsCurrentUser(activity, me.id);

  if (singleObject) {
    if (isObjectTheCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_MEMBER_ROLE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (singleActor) {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_1__';
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_UPDATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting post activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting message activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiMessageSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (singleActor) {
    i18nKey = '__MSG__ACTIVITY_MEETING_MESSAGE_1__';
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_MEETING_MESSAGE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_MESSAGE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a content update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectTypeIs = objectSubTypeIs(activity);
  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (objectTypeIs(COLLABDOC)) {
    if (singleActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_1__';
    } else if (coupleActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABDOC_2+__';
    }
  } else if (objectTypeIs(COLLABSHEET)) {
    if (singleActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABSHEET_1__';
    } else if (coupleActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABSHEET_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_COLLABSHEET_2+__';
    }
  } else if (objectTypeIs(FILE)) {
    if (singleActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_1__';
    } else if (coupleActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_FILE_2+__';
    }
  } else if (objectTypeIs(LINK)) {
    if (singleActor) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_1__';
    } else if (coupleActors) {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_CONTENT_UPDATE_LINK_2+__';
    }
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for content.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the content visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateContentUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectTypeIs = objectSubTypeIs(activity);
  const primaryObjectIsPublic = pipe(visibilityOf, isPublic)(activity.getPrimaryObject());
  const primaryObjectIsLoggedIn = pipe(visibilityOf, isLoggedIn)(activity.getPrimaryObject());

  switch (true) {
    case objectTypeIs(COLLABDOC):
      switch (true) {
        case primaryObjectIsPublic:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PUBLIC__';
          break;
        case primaryObjectIsLoggedIn:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABDOC_PRIVATE__';
          break;
      }
      break;
    case objectTypeIs(COLLABSHEET):
      switch (true) {
        case primaryObjectIsPublic:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_PUBLIC__';
          break;
        case primaryObjectIsLoggedIn:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_COLLABSHEET_PRIVATE__';
          break;
      }
      break;
    case objectTypeIs(FILE):
      switch (true) {
        case primaryObjectIsPublic:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PUBLIC__';
          break;
        case primaryObjectIsLoggedIn:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_FILE_PRIVATE__';
          break;
      }
      break;
    case objectTypeIs(LINK):
      switch (true) {
        case primaryObjectIsPublic:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PUBLIC__';
          break;
        case primaryObjectIsLoggedIn:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_LOGGEDIN__';
          break;
        default:
          i18nKey = '__MSG__ACTIVITY_CONTENT_VISIBILITY_LINK_PRIVATE__';
          break;
      }
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiCreateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleTarget = countIsOne(TARGET_COUNT, properties);
  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  const targetTypeIs = typeIs(TARGET, activity);

  const activityTargetIsCurrentUser = isTargetTheCurrentUser(activity, me.id);
  const targetIsNotTheCurrentUser = not(activityTargetIsCurrentUser);

  /**
   * Add the target to the activity summary when a target is present on the
   *  activity and the target is not an user different from the current user
   */
  if (singleTarget && not(targetTypeIs(USER) && targetIsNotTheCurrentUser)) {
    if (activityTargetIsCurrentUser) {
      if (singleObject) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_1_YOU__';
      } else if (coupleObjects) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2+_YOU__';
      }
    } else if (targetTypeIs(GROUP)) {
      if (singleObject) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_1_GROUP__';
      } else if (coupleObjects) {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2_GROUP__';
      } else {
        i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2+_GROUP__';
      }
    }
  } else if (singleObject) {
    i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_1__';
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETING_CREATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a meeting share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the meeting share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateMeetingJitsiShareSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  const singleTarget = countIsOne(TARGET_COUNT, properties);
  const coupleTargets = countIsTwo(TARGET_COUNT, properties);

  const activityTargetIsCurrentUser = isTargetTheCurrentUser(activity, me.id);

  if (singleObject) {
    if (singleTarget) {
      if (activityTargetIsCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_1__';
      }
    } else if (coupleTargets) {
      i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_MEETING_SHARE_2+__';
    }
  } else if (coupleObjects) {
    if (activityTargetIsCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2__';
    }
  } else if (activityTargetIsCurrentUser) {
    i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2+_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_MEETINGS_SHARE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of an activity for which no specific handling is available. This will
 * use the activity verb to construct the summary.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the unrecognized activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDefaultSummary = function (me, activity, properties) {
  let i18nKey = null;
  properties.verb = activity.verb;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  switch (true) {
    case singleActor:
      i18nKey = '__MSG__ACTIVITY_DEFAULT_1__';
      break;
    case coupleActors:
      i18nKey = '__MSG__ACTIVITY_DEFAULT_2__';
      break;
    default:
      i18nKey = '__MSG__ACTIVITY_DEFAULT_2+__';
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of an add to library activity for a discussion.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to discussion library activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionAddToLibrarySummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  switch (true) {
    case singleObject:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY__';
      break;
    case coupleObjects:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY_2__';
      break;
    default:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_ADD_LIBRARY_2+__';
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a discussion creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionCreateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  switch (true) {
    case singleObject:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_1__';
      break;
    case coupleObjects:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_2__';
      break;
    default:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_CREATE_2+__';
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a discussion post activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion message activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionMessageSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  switch (true) {
    case singleActor:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_1__';
      break;
    case coupleActors:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_2__';
      break;
    default:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_MESSAGE_2+__';
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a discussion share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionShareSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);
  const singleTarget = countIsOne(TARGET_COUNT, properties);
  const coupleTargets = countIsTwo(TARGET_COUNT, properties);
  const activityTargetIsCurrentUser = isTargetTheCurrentUser(activity, me.id);

  if (singleObject) {
    if (singleTarget) {
      if (activityTargetIsCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_1__';
      }
    } else if (coupleTargets) {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_SHARE_2+__';
    }
  } else if (coupleObjects) {
    if (activityTargetIsCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2__';
    }
  } else if (activityTargetIsCurrentUser) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2+_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSIONS_SHARE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a discussion member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);
  const primaryObjectIsCurrentUser = objectIsCurrentUser(activity, me.id);

  if (singleObject) {
    if (primaryObjectIsCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_MEMBER_ROLE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a discussion update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (singleActor) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_1__';
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_DISCUSSION_UPDATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a discussion.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the discussion visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateDiscussionUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;
  const primaryObjectIsPublic = pipe(visibilityOf, isPublic)(activity.getPrimaryObject());
  const primaryObjectIsLoggedIn = pipe(visibilityOf, isLoggedIn)(activity.getPrimaryObject());

  switch (true) {
    case primaryObjectIsPublic:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_PUBLIC__';
      break;
    case primaryObjectIsLoggedIn:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_LOGGEDIN__';
      break;
    default:
      i18nKey = '__MSG__ACTIVITY_DISCUSSION_VISIBILITY_PRIVATE__';
      break;
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of an add to folder activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to folder activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderAddToFolderSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);
  const objectTypeIs = objectSubTypeIs(activity);

  if (singleObject) {
    if (objectTypeIs(COLLABDOC)) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_COLLABDOC__';
    } else if (objectTypeIs(FILE)) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_FILE__';
    } else if (objectTypeIs(LINK)) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_LINK__';
    }
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_FOLDER_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of an add to library activity for a folder.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add to folder library activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderAddToLibrarySummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  if (singleObject) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY__';
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_ADD_LIBRARY_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a folder comment activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder comment activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderCommentSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (singleActor) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_1__';
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_COMMENT_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a folder creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderCreateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);
  const singleTarget = countIsOne(TARGET_COUNT, properties);
  const targetTypeIs = typeIs(TARGET, activity);
  const targetIsTheCurrentUser = isTargetTheCurrentUser(activity, me.id);
  const targetIsNotTheCurrentUser = not(targetIsTheCurrentUser);

  /**
   * Add the target to the activity summary when a target is present on the
   * activity and the target is not a user different from the current user
   */
  if (singleTarget && not(targetTypeIs(USER) && targetIsNotTheCurrentUser)) {
    if (targetIsTheCurrentUser) {
      if (singleObject) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1_YOU__';
      } else if (coupleObjects) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+_YOU__';
      }
    } else if (targetTypeIs(GROUP)) {
      if (singleObject) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1_GROUP__';
      } else if (coupleObjects) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2_GROUP__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+_GROUP__';
      }
    }
  } else if (singleObject) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_1__';
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_CREATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a folder share activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder share activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderShareSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);
  const singleTarget = countIsOne(TARGET_COUNT, properties);
  const coupleTargets = countIsTwo(TARGET_COUNT, properties);

  const targetIsTheCurrentUser = isTargetTheCurrentUser(activity, me.id);

  if (singleObject) {
    if (singleTarget) {
      if (targetIsTheCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_1__';
      }
    } else if (coupleTargets) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLDER_SHARE_2+__';
    }
  } else if (coupleObjects) {
    if (targetIsTheCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2__';
    }
  } else if (targetIsTheCurrentUser) {
    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2+_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDERS_SHARE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a folder update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (singleActor) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_1__';
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a folder member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  const objectIsTheCurrentUser = objectIsCurrentUser(activity, me.id);

  if (singleObject) {
    if (objectIsTheCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_UPDATE_MEMBER_ROLE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a folder.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the folder visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFolderUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectIsPublic = pipe(visibilityOf, isPublic)(activity.getPrimaryObject());
  const objectIsLoggedIn = pipe(visibilityOf, isLoggedIn)(activity.getPrimaryObject());

  if (objectIsPublic) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_PUBLIC__';
  } else if (objectIsLoggedIn) {
    i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_LOGGEDIN__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLDER_VISIBILITY_PRIVATE__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of an update for a user following another user
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the following activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateFollowingSummary = function (me, activity, properties) {
  let i18nKey = null;

  const multipleActors = countIsMoreThanOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  const multipleObjects = countIsMoreThanOne(OBJECT_COUNT, properties);
  const objectIsTheCurrentUser = objectIsCurrentUser(activity, me.id);

  if (multipleActors) {
    if (coupleActors) {
      if (objectIsTheCurrentUser) {
        i18nKey = '__MSG__ACTIVITY_FOLLOWING_2_YOU__';
      } else {
        i18nKey = '__MSG__ACTIVITY_FOLLOWING_2_1__';
      }
    } else if (objectIsTheCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_2+_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_2+_1__';
    }
  } else if (multipleObjects) {
    if (properties.objectCount === 2) {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_2__';
    } else {
      i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_2+__';
    }
  } else if (objectIsTheCurrentUser) {
    i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_YOU__';
  } else {
    i18nKey = '__MSG__ACTIVITY_FOLLOWING_1_1__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a group member add activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the add group member activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupAddMemberSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);
  const objectIsTheCurrentUser = objectIsCurrentUser(activity, me.id);

  if (singleObject) {
    if (objectIsTheCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_1__';
    }
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_ADD_MEMBER_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a group member role update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group member update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupUpdateMemberRoleSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  const objectIsTheCurrentUser = objectIsCurrentUser(activity, me.id);

  if (singleObject) {
    if (objectIsTheCurrentUser) {
      i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_YOU__';
    } else {
      i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_1__';
    }
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_MEMBER_ROLE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a group creation activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group creation activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupCreateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleObject = countIsOne(OBJECT_COUNT, properties);
  const coupleObjects = countIsTwo(OBJECT_COUNT, properties);

  if (singleObject) {
    i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_1__';
  } else if (coupleObjects) {
    i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_CREATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a group join activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group join activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupJoinSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (singleActor) {
    i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_1__';
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_JOIN_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a group update activity.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupUpdateSummary = function (me, activity, properties) {
  let i18nKey = null;

  const singleActor = countIsOne(ACTOR_COUNT, properties);
  const coupleActors = countIsTwo(ACTOR_COUNT, properties);

  if (singleActor) {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_1__';
  } else if (coupleActors) {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_2__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_UPDATE_2+__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary of a visibility update activity for a group.
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the group visibility update activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
const generateGroupUpdateVisibilitySummary = function (me, activity, properties) {
  let i18nKey = null;

  const objectIsPublic = pipe(visibilityOf, isPublic)(activity.getPrimaryObject());
  const objectIsLoggedIn = pipe(visibilityOf, isLoggedIn)(activity.getPrimaryObject());

  if (objectIsPublic) {
    i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_PUBLIC__';
  } else if (objectIsLoggedIn) {
    i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_LOGGEDIN__';
  } else {
    i18nKey = '__MSG__ACTIVITY_GROUP_VISIBILITY_PRIVATE__';
  }

  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

/**
 * Render the end-user friendly, internationalized summary related to invitation activities. The
 * blueprint for the invitation activity should be of the form:
 *
 *  * Only one actor
 *  * Only one object, it must be a user (either who is invited, or who is accepting)
 *  * Multiple targets of the same resource type (either the resources to which a user is being
 *    invited, or is accepting an invitation)
 *
 * The resulting summary will have the standard actor/object/target properties, as well as a
 * summary i18n key of the form:
 *
 *  `ACTIVITY_${activityLabel}_${whoLabel}_${resourceType}_${numTargets}`
 *
 * Which renders all the following i18n key possibilities:
 *
 *  * ACTIVITY_INVITE_COLLABDOC_1
 *  * ACTIVITY_INVITE_FILE_1
 *  * ACTIVITY_INVITE_LINK_1
 *  * ACTIVITY_INVITE_CONTENT_2
 *  * ACTIVITY_INVITE_CONTENT_2+
 *  * ACTIVITY_INVITE_DISCUSSION_1
 *  * ACTIVITY_INVITE_DISCUSSION_2
 *  * ACTIVITY_INVITE_DISCUSSION_2+
 *  * ACTIVITY_INVITE_FOLDER_1
 *  * ACTIVITY_INVITE_FOLDER_2
 *  * ACTIVITY_INVITE_FOLDER_2+
 *  * ACTIVITY_INVITE_GROUP_1
 *  * ACTIVITY_INVITE_GROUP_2
 *  * ACTIVITY_INVITE_GROUP_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_COLLABDOC_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FILE_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_LINK_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_CONTENT_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_CONTENT_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_DISCUSSION_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_FOLDER_2+
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_1
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_2
 *  * ACTIVITY_INVITATION_ACCEPT_YOU_OTHER_GROUP_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_COLLABDOC_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FILE_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_LINK_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_CONTENT_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_CONTENT_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_DISCUSSION_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_FOLDER_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_YOU_GROUP_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_COLLABDOC_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FILE_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_LINK_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_CONTENT_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_CONTENT_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_DISCUSSION_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_FOLDER_2+
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_1
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_2
 *  * ACTIVITY_INVITATION_ACCEPT_OTHER_OTHER_GROUP_2+
 *
 * @param  {User}                   me              The currently loggedin user
 * @param  {Activity}               activity        Standard activity object as specified by the activitystrea.ms specification, representing the invite activity, for which to generate the activity summary
 * @param  {Object}                 properties      A set of properties that can be used to determine the correct summary
 * @return {ActivityItem}                    A summary object
 * @api private
 */
// TODO refactor this one
const generateInvitationSummary = function (me, activity, properties) {
  const labels = ['ACTIVITY'];
  const activityType = activity.activityType;
  const actorId = activity.actor.id;
  const objectId = activity.primaryObject.id;

  if (activityType === 'invite') {
    labels.push('INVITE');
  } else if (activityType === 'invitation-accept') {
    labels.push('INVITATION_ACCEPT');

    /**
     * Find the "who" label, which indicates if the current user in context is either the
     * inviter or the invited user. When that is the case, we alter the language to be in
     * the form "You"/"Your" as opposed to the display name of the user. This is only
     * applicable for the invitation accept activity because the invite is only seen by the user who was invited
     */
    if (me.id === actorId) {
      labels.push('YOU_OTHER');
    } else if (me.id === objectId) {
      labels.push('OTHER_YOU');
    } else {
      labels.push('OTHER_OTHER');
    }
  } else {
    throw new Error('Invalid activity type provided for invitation activity: ' + activityType);
  }

  // Find the count label
  let countLabel = properties.targetCount;
  if (countLabel > 2) {
    countLabel = '2+';
  }

  // Find any target object so we can inspect its `objectType` or `resourceSubType`
  let target = null;
  if (countLabel === 1) {
    target = activity.target;
  } else {
    target = activity.target['oae:collection'][0];
  }

  // Find the type label (e.g., LINK, DISCUSSION, GROUP, etc...)
  let typeLabel = target.objectType.toUpperCase();
  if (typeLabel === 'CONTENT' && countLabel === 1) {
    typeLabel = target.subType.toUpperCase();
  }

  // Gather the rest of the labels together to form the i18n key
  labels.push(typeLabel);
  labels.push(countLabel);

  // Generate the activity i18n key according to the labels we determined
  let i18nKey = '__MSG__' + labels.join('_') + '__';
  i18nKey = transformKey(i18nKey);
  return { i18nKey, properties };
};

export { generateSummary };
