<script>
  /**
   * TODOs
   * - [ ] instead of fetching comment author over and over, cache it somehow
   * - [ ] use avatar placeholder in comment (nothing shows when not defined)
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
  <img alt="avatar" src={comment?.author?.smallPicture} />
  <span>{comment.author.displayName}</span>
  <span class="level{comment.level}-indentation">{comment.content}</span>
  <span class="smaller">
    {formatDistance(comment.published, new Date(), { addSuffix: true })}
  </span>
</section>

<style lang="scss">
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
