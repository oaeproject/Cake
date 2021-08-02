<script>
  import Sidebar from '../components/Sidebar.svelte';
  import MainTopBar from '../components/MainTopBar.svelte';
</script>

<MainTopBar />
<div class="container main-container">
  <div class="column sidebar">
    <div class="menu sticky">
      <Sidebar />
    </div>
  </div>
  <div class="column is-three-fifths main-wrapper">
    <div class="column main-content">
      <slot />
    </div>
  </div>
  <div class="column right-sidebar" />
</div>

<style lang="scss">
  .sidebar {
    border-right: 1px solid #d7d7d7 !important;
  }

  .right-sidebar {
    position: sticky;
  }
</style>
