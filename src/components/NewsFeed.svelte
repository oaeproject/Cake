<script>
  import '@polymer/iron-icons/iron-icons.js';
  import '@polymer/iron-icons/social-icons.js';
  import '@polymer/iron-icons/av-icons.js';
  import '@polymer/iron-icons/hardware-icons.js';
  import '@polymer/iron-icons/communication-icons.js';

  import NewsFeedComment from '../components/NewsFeedComment.svelte';
  import { _ } from 'svelte-i18n';
  import { formatDistance } from 'date-fns';
  import { onMount } from 'svelte';
  import { defaultToTemplateAvatar } from '../helpers/utils';
  import { user } from '../stores/user';
  import { cachedFetch } from '../stores/users';

  export let activityItem;
  let activitySummary;
  let actorAvatar;

  onMount(async () => {
    let activityActor = activityItem.getPrimaryActor();
    activityItem.summary = activityItem.getSummary($user);
    activitySummary = $_(activityItem.summary.i18nKey, { values: activityItem.summary.properties });
    actorAvatar = defaultToTemplateAvatar((await cachedFetch(activityActor.id, activityActor.apiUrl)).small);
  });
</script>

<div class="box box-feed">
  <div class="content news-feed">
    <nav class="level news-feed-top">
      <div class="level-left">
        <div class="level-item">
          <div class="column is-flex news-feed-nav">
            <figure class="image avatar-news-feed">
              <img alt="primary-actor" class="is-rounded avatar-news-feed" src={actorAvatar} />
            </figure>
            <section>
              <p class="user-info">
                {@html decodeURIComponent(activitySummary)}
              </p>
              <p>
                {formatDistance(activityItem.published, new Date(), {
                  addSuffix: true,
                })}
              </p>
            </section>
          </div>
        </div>
      </div>
      <div class="level-right" />
    </nav>
    {#if activityItem.allTargets}
      {#each activityItem.allTargets as eachTarget}
        <!-- I have no idea what the markup should be, so here it goes -->
        {#if eachTarget.image}
          <p>This image is {eachTarget.visibility}</p>
          <div>
            <img alt="target-thumbnail" src={eachTarget?.image?.url} />
          </div>
        {/if}
      {/each}
    {/if}

    {#each activityItem.allObjects as eachObject}
      <!-- I have no idea what the markup should be, so here it goes -->
      {#if eachObject.image}
        <p>This image is {eachObject.visibility}</p>
        <div>
          <img
            alt="object-thumbnail"
            max-height={eachObject?.image?.height}
            max-width={eachObject?.image?.width}
            src={eachObject?.image?.url}
          />
        </div>
      {/if}
    {/each}

    {#each activityItem.latestComments as eachComment}
      <NewsFeedComment comment={eachComment} />
    {/each}

    <!-- I'll just leave this here for @oakrita to remember the previous markup before deleting it -->
    {#if false}
      <nav class="level bottom-nav-news">
        <div class="level-left">
          <div class="level-item">
            <a href="/" class="button comments-button">
              <span class="comments-icon">
                <iron-icon icon="communication:forum" />
              </span>
              <span>View (25) comments</span>
            </a>
          </div>
          <div class="level-item">
            <a href="/" class="button reply-button">
              <span class="reply-icon">
                <iron-icon icon="communication:import-export" />
              </span>
              <span>Reply</span>
            </a>
          </div>
        </div>
      </nav>
    {/if}
  </div>
</div>

<style lang="scss">
  .box {
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      //box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
    }
  }

  .box-feed {
    margin-top: 25px;
    padding: 5px;
    border: none;
  }

  * {
    font-size: 1em;
  }

  // Avatar
  .avatar-news-feed img {
    height: 100%;
    object-fit: cover;
  }

  .content figure {
    margin-left: 0;
    margin-right: 1em;
  }

  // Avatar Info
  p.user-info {
    margin-bottom: 0;
  }

  .content p {
    font-size: 1em;
    margin-bottom: 0;
  }

  .news-feed {
    padding: 10px;
  }

  .news-feed-top {
    margin-bottom: 0;
  }

  .news-feed-message {
    margin-left: 65px;
    margin-right: 65px;
    margin-top: -3em;
    width: auto;
    background-color: #f9f8ff;
    border-radius: 5px;
    word-wrap: break-word;
  }

  .news-feed-message h5 {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .feed-user {
    text-decoration: none;
    color: #424242;
    font-weight: bold;

    &:hover {
      color: #2962ff;
      background-color: #f5f7ff;
      text-decoration: underline;
    }
  }

  .avatar-news-feed {
    width: 50px;
    height: 50px;
  }

  .bottom-nav-news {
    margin-left: 70px;
    margin-top: 2em;
    margin-bottom: 1em;
  }

  .news-feed-break {
    margin-top: 3em;
  }

  .comments-button {
    border: none;
    background-color: transparent;
    height: 5px;
    color: #424242;
    width: 0;
    margin-left: 55px;

    &:hover {
      color: #2962ff;
      text-decoration: underline;
    }
  }

  .reply-button {
    border: none;
    background-color: transparent;
    height: 5px;
    color: #424242;
    width: 0;
    margin-left: 90px;

    &:hover {
      color: #2962ff;
      text-decoration: underline;
    }
  }

  .comments-icon {
    color: #272b2e;
    margin-right: 5px;

    &:hover {
      color: #272b2e;
    }
  }

  .reply-icon {
    color: #272b2e;
    margin-right: 5px;

    &:hover {
      color: #272b2e;
    }
  }

  .icon-feed {
    color: #272b2e;
    margin-left: 5px;
  }

  .news-pin {
    margin-right: 15px;
    margin-top: -50px;
    border-radius: 25px;
    border: none;
    background-color: white;
    color: #424242;

    &:hover {
      color: #2962ff;
    }

    &:focus,
    :active {
      border: none;
    }
  }
</style>
