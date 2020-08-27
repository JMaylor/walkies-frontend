<template>
	<div>
		<h3>Hi, {{ userProfile.first_name }}. Here are some people looking for walkies!</h3>
		<b-btn @click="searchUsers" class="mb-2">Search</b-btn>
		<b-container>
			<b-row>
				<b-col cols="3" v-for="user in users" :key="user._id.$oid">
					<b-card>
						<template v-slot:header>
							<h4 class="mb-0">{{ user.first_name }}</h4>
						</template>
						<b-card-text>
							<p>{{user.dogs.length}} dogs total</p>
							<p v-for="dog in user.dogs" :key="dog._id.$oid">{{ dog.name }}, the {{ dog.breed }}</p>
							{{ Math.round(getDistanceFromLatLonInKm(user.location.coordinates[1], user.location.coordinates[0], userProfile.location.coordinates[1], userProfile.location.coordinates[0])*10)/10 }}km
						</b-card-text>
						<template v-slot:footer>
							<b-btn variant="success" @click="toggleMeetupModal" :id="user._id.$oid">Go walkies!</b-btn>
						</template>
					</b-card>
				</b-col>
				<b-modal ref="meetup-modal" id="meetup-modal" static>
					<template v-slot:modal-title>Go walkies!</template>
					<form>
						<b-form-group
							label="Date"
							label-for="meetup-date-input"
							invalid-feedback="Pleae choose a date."
						>
							<b-form-datepicker :min="minDate" id="meetup-date-input" v-model="meetupDate"></b-form-datepicker>
						</b-form-group>
						<b-form-group
							label="Time"
							label-for="meetup-time-input"
							invalid-feedback="Pleae choose a time."
						>
							<b-form-timepicker id="meetup-time-input" v-model="meetupTime"></b-form-timepicker>
						</b-form-group>
					</form>

					<template v-slot:modal-footer>
						<b-button @click="$bvModal.hide('meetup-modal')">Cancel</b-button>
						<b-button variant="outline-info" @click="sendMeetingInvite">Request</b-button>
					</template>
				</b-modal>
			</b-row>
		</b-container>
	</div>
</template>

<script>
	// const axios = require("axios");

	export default {
		name: "UserSearch",
		data() {
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			return {
				meetupDate: '',
				meetupTime: '',
				minDate: tomorrow,
				meetupUser: ''
			};
		},
		methods: {
			toggleMeetupModal(e) {
				this.$refs["meetup-modal"].toggle();
				this.meetupUser = e.target.id;
			},
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
			sendMeetingInvite() {}
		},
		computed: {
			userProfile() {
				return this.$store.getters.getUserProfile;
			},
			users() {
				return this.$store.getters.getSearchResults;
			}
		},
		created() {
			this.$store.dispatch("retrieveUserProfile");
			this.$store.dispatch("searchUsers");
		}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
