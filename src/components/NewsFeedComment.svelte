<script>
  /**
   * TODOs
   * - [ ] instead of fetching comment author over and over, cache it somehow
   * - [x] use avatar placeholder in comment (nothing shows when not defined)
   */

  import { formatDistance } from 'date-fns';
  import { onMount } from 'svelte';
  import { set, lensProp } from 'ramda';
  import { User } from '../models/user';

  export let comment;

  const AUTHOR = 'author';

  const updateCommentAuthor = userData => set(lensProp(AUTHOR), new User(userData));

  onMount(async () => {
    /**
     * Attempt to fetch the commenters profile and avatar picture
     */
    let userData = await fetch(comment.author.apiUrl);
    userData = await userData.json();
    comment = updateCommentAuthor(userData)(comment);
  });
</script>

<section class="comment-section">
  {#if comment.author.smallPicture}
    <img alt="avatar" src={comment?.author?.smallPicture} />
  {:else}
    <img alt="avatar" src="assets/images/avatar.jpg" class="commenter-avatar" />
  {/if}
  <a href={comment.author.profilePath}>
    {comment.author.displayName}
  </a>
  <span class="level{comment.level}-indentation">{comment.content}</span>
  <span class="smaller">
    {formatDistance(comment.published, new Date(), { addSuffix: true })}
  </span>
</section>

<style lang="scss">
  .commenter-avatar {
    max-height: 40px;
    max-width: 40px;
  }

  .comment-section {
    margin-top: 20px;
    border: dashed #035 1px;
  }

  .level0-indentation {
    padding-left: 20px;
  }

  .level1-indentation {
    padding-left: 40px;
  }

  .smaller {
    font-size: smaller;
  }
</style>
