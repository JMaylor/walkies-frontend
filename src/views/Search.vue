<template>
	<b-container>
		<b-row>
			<h3>
				Hi, {{ $store.state.userProfile.first_name }}. Find a
				<span class="main-branding">Walkies</span> buddy!
			</h3>
		</b-row>
		<b-row>
			<!-- Dropdown to select the radius to search -->
			<b-dropdown
				:text="$store.state.searchParameters.distance.options[$store.state.searchParameters.distance.selected]"
				class="m-2"
			>
				<b-dropdown-item-button
					v-for="distance in Object.keys($store.state.searchParameters.distance.options)"
					:key="distance"
					@click="changeSearchDistance(distance)"
					:variant="$store.state.searchParameters.distance.selected == distance ? 'success' : ''"
				>{{ $store.state.searchParameters.distance.options[distance] }}</b-dropdown-item-button>
			</b-dropdown>
		</b-row>
		<b-row>
			<!-- List of users returned from query -->
				<User v-for="user in $store.state.searchResults" :key="user._id.$oid" v-bind:user="user" v-on:open-modal="openMeetupModal(user)" />
		</b-row>

		<!-- NewEventModal -->
		<NewEventModal v-if="meetupModalVisible == true" v-on:close-modal="meetupModalVisible = false" />
	</b-container>
</template>

<script>
	// @ is an alias to /src
	import User from "@/components/Search/User";
	import NewEventModal from "@/components/Search/NewEventModal";

	export default {
		name: "Search",
		components: {
			User,
			NewEventModal
		},
		data() {
			return {
				selectedUser: "",
				meetupModalVisible: false
			};
		},
		methods: {
			changeSearchDistance(distance) {
				this.$store.commit("setSearchDistance", distance);
				this.$store.dispatch("searchUsers");
			},
			openMeetupModal(user) {
				this.selectedUser = user;
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
