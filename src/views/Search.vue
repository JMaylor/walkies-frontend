<template>
  <b-container class="p-3">
    <b-row class="p-3">
      <h2>
        Hi, {{ $store.state.userProfile.first_name }}. Find a
        <span class="main-branding">Walkies</span> buddy!
      </h2>
    </b-row>
    <b-row class="p-3">
      <!-- Dropdown for distance -->
      <b-dropdown
        :text="
          $store.state.searchParameters.distance.options[
            $store.state.searchParameters.distance.selected
          ]
        "
        class="m-2"
        variant="warning"
      >
        <b-dropdown-item-button
          v-for="distance in Object.keys(
            $store.state.searchParameters.distance.options
          )"
          :key="distance"
          @click="changeSearchDistance(distance)"
          :variant="
            $store.state.searchParameters.distance.selected == distance
              ? 'success'
              : ''
          "
          >{{
            $store.state.searchParameters.distance.options[distance]
          }}</b-dropdown-item-button
        >
      </b-dropdown>

      <!-- Dropdown for genders -->
      <!-- <b-dropdown text="Genders" class="m-2" variant="warning">
				<b-dropdown-form>
					<b-form-checkbox-group v-model="selectedGenders" :options="genderOptions"></b-form-checkbox-group>
				</b-dropdown-form>
			</b-dropdown>-->
    </b-row>

    <b-row class="p-3">
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        per-page="5"
        size="md"
        class="m-2"
      ></b-pagination>
    </b-row>

    <b-row class="p-4">
      <b-table
        :fields="fields"
        :items="$store.state.searchResults"
        hover
        responsive
        dark
        striped
        per-page="5"
        :current-page="currentPage"
        sort-icon-left
        tbody-tr-class="my-auto py-auto"
      >
        <template v-slot:cell(first_name)="data">
          <b-avatar variant="warning" size="sm" class="mr-3"></b-avatar>
          {{ data.value.charAt(0).toUpperCase() + data.value.slice(1) }}
        </template>
        <template v-slot:cell(date_of_birth)="data">{{
          calculateAge(data.value)
        }}</template>
        <template v-slot:cell(dogs)="data">
          <font-awesome-icon icon="dog" />
          {{ data.value.length }}
          <!-- <span class="text-left m-0" :id="`popover-target-${user._id.$oid}-1`">
						<font-awesome-icon icon="dog" />
						{{ data.value.length }}
					</span>
					<b-popover
						:target="`popover-target-${user._id.$oid}-1`"
						triggers="hover"
						placement="rightbottom"
					>
						<b-table striped :items="data.value" :fields="dogFields"></b-table>
					</b-popover>-->
        </template>
        <template v-slot:cell(distance)="data">{{
          Math.round(data.value * 10) / 10
        }}</template>
        <template v-slot:cell(event)="data">
          <b-button size="sm" @click="createEvent(data.item)">Invite</b-button>
        </template>
      </b-table>
    </b-row>

    <!-- NewEventModal -->
    <NewEventModal
      v-if="meetupModalVisible == true"
      v-on:close-modal="meetupModalVisible = false"
    />
  </b-container>
</template>

<script>
// @ is an alias to /src
import NewEventModal from "@/components/Search/NewEventModal";

export default {
  name: "Search",
  components: {
    NewEventModal
  },
  data() {
    return {
      meetupModalVisible: false,
      fields: [
        { key: "first_name", label: "Name" },
        { key: "date_of_birth", label: "Age", sortable: true },
        { key: "dogs", sortable: true },
        { key: "gender", sortable: true },
        { key: "distance", label: "Distance", sortable: true },
        { key: "event", label: "", sortable: false }
      ],
      dogFields: ["name", "breed"],
      selectedGenders: ["Male", "Female"],
      genderOptions: ["Male", "Female"],
      currentPage: 1
    };
  },
  computed: {
    totalRows() {
      return this.$store.state.searchResults.length;
    }
  },
  methods: {
    changeSearchDistance(distance) {
      this.$store.commit("setSearchDistance", distance);
      this.$store.dispatch("searchUsers");
    },
    calculateAge(date) {
      const currentDate = new Date();
      const birhDate = new Date(date["$date"]);
      return Math.floor((currentDate - birhDate) / 31557600000);
    },
    createEvent(user) {
      this.$store.commit("selectUser", user);
      this.meetupModalVisible = true;
    }
  },
  mounted() {
    if (!this.$store.state.userProfile.events) {
      this.$store
        .dispatch("retrieveUserProfile")
        .then(this.$store.dispatch("searchUsers"));
    } else {
      this.$store.dispatch("searchUsers");
    }
  }
};
</script>

<style>
.container {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>
