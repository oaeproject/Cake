<script>
  import Sidebar from '../components/Sidebar.svelte';
  import MainTopBar from '../components/MainTopBar.svelte';
</script>

<div class="container main-container">
  <div class="column sidebar">
    <div class="menu sticky">
      <Sidebar />
    </div>
  </div>
  <div class="column is-three-fifths main-wrapper">
    <div class="column main-content">
      <div class="sticky-topBar">
        <MainTopBar />
      </div>
      <slot />
    </div>
  </div>
  <div class="column right-sidebar" />
</div>

<style lang="scss">
  .right-sidebar {
    position: sticky;
  }
</style>
