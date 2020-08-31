<template>
  <div>
    <Navbar />
    <UserSearch />
	<div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from "@/components/Navbar.vue";
import UserSearch from "@/components/UserSearch.vue";

export default {
  name: "Search",
  components: {
    Navbar,
    UserSearch
  }
};
</script>
