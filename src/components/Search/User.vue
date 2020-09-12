<template>
  <!-- <b-col cols="12" md="6" lg="4" class="p-3">
		<div class="shader p-3 rounded">
			<div class="d-flex align-items-center">
				<b-avatar variant="warning" size="4rem" class="mr-3"></b-avatar>
				<span class="mr-3">
					<h4 style="display: inline">{{ user.first_name }}</h4>
				</span>
				<p class="text-right m-0" :id="`popover-target-${user._id.$oid}`">
					<font-awesome-icon icon="dog" />
					{{ user.dogs.length }}
				</p>
				<b-popover :target="`popover-target-${user._id.$oid}`" triggers="hover" placement="rightbottom">
					<b-table striped :items="user.dogs" :fields="dogFields"></b-table>
				</b-popover>
			</div>
			<div>
				<p>Lives {{ Math.round(user.distance * 10) / 10 }}km away from you</p>
				<b-btn variant="outline-secondary" @click="toggleMeetupModal" :id="user._id.$oid">Go walkies!</b-btn>
			</div>
		</div>
	</b-col>-->
  <b-tr>
    <b-td>
      <b-avatar variant="warning" class="mr-3"></b-avatar>
      {{ user.first_name }}
    </b-td>
    <b-td>25</b-td>
    <b-td>
      <span class="text-left m-0" :id="`popover-target-${user._id.$oid}`">
        <font-awesome-icon icon="dog" />
        {{ user.dogs.length }}
      </span>
      <b-popover
        :target="`popover-target-${user._id.$oid}`"
        triggers="hover"
        placement="rightbottom"
      >
        <b-table striped :items="user.dogs" :fields="dogFields"></b-table>
      </b-popover>
    </b-td>
    <b-td>Gender</b-td>
    <b-td>{{ Math.round(user.distance * 10) / 10 }}</b-td>
  </b-tr>
</template>

<script>
export default {
  props: ["user"],
  data() {
    return {
      dogFields: ["name", "breed"]
    };
  },
  methods: {
    searchUsers() {
      this.$store.dispatch("searchUsers");
    },
    deg2rad(deg) {
      return deg * (Math.PI / 180);
    },
    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2 - lat1);
      var dLon = this.deg2rad(lon2 - lon1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) *
          Math.cos(this.deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
    },
    toggleMeetupModal() {
      this.$store.commit("selectUser", this.user);
      this.$emit("open-modal");
    }
  },
  computed: {
    userProfile() {
      return this.$store.getters.getUserProfile;
    },
    search() {
      return this.$store.getters.getSearchResults;
    },
    mapboxKey() {
      return this.$store.getters.getMapboxKey;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.shader {
  background: rgba(255, 255, 255, 0.75);
}
</style>
