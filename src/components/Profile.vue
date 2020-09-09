<template>
	<b-container>
		<h2>Hi, {{ this.$store.state.userProfile.first_name }}!</h2>

		<!-- Events -->

		<!-- Event Modal -->
		<EventModal
			v-if="eventModalVisible"
			v-on:close-modal="eventModalVisible = false"
			:event="selectedEvent"
		/>

		<!-- Confirmed -->

			<b-row class="p-3">
				<h4 v-if="userConfirmedEvents.length > 0">Here are your upcoming walks!</h4>
				<h4 v-else>No confirmed upcoming walks :(</h4>
			</b-row>
			<b-row class="p-3" v-if="userConfirmedEvents.length > 0">
				<b-col
					cols="12"
					sm="6"
					md="4"
					lg="3"
					v-for="event in userConfirmedEvents"
					:key="event._id.$oid"
				>
					<Event v-bind:event="event" v-on:open-modal="openEventModal(event)" />
				</b-col>
			</b-row>


		<!-- Invited -->

			<b-row class="p-3">
				<h4>{{ userInvitedEvents.length > 0 ? 'Invites received from other users' : 'No invites received :(' }}</h4>
			</b-row>
			<b-row class="p-3" v-if="userInvitedEvents.length > 0">
				<b-col cols="12" sm="6" md="4" lg="3" v-for="event in userInvitedEvents" :key="event._id.$oid">
					<Event v-bind:event="event" v-on:open-modal="openEventModal(event)" />
				</b-col>
			</b-row>


		<!-- Pending -->

			<b-row class="p-3">
				<h4>{{ userAwaitingEvents.length > 0 ? 'Pending response from other user' : 'You have no requests pending :(' }}</h4>
			</b-row>
			<b-row class="p-3" v-if="userAwaitingEvents.length > 0">
				<b-col cols="12" sm="6" md="4" lg="3" v-for="event in userAwaitingEvents" :key="event._id.$oid">
					<Event v-bind:event="event" v-on:open-modal="openEventModal(event)" />
				</b-col>
			</b-row>


		<!-- Dogs -->

		<!-- Dog Modal -->
		<DogModal v-if="addDogModalVisible" v-on:close-modal="addDogModalVisible = false" />


			<!-- Add Dog Button -->
			<b-row class="p-3">
				<b-col>
					<b-btn @click="addDogModalVisible = true">Add new dog</b-btn>
				</b-col>
			</b-row>

			<!-- Dogs -->
			<b-row class="justify-content-center p-3">
				<b-col cols="12" sm="6" md="4" lg="3" v-for="dog in this.$store.state.userProfile.dogs" :key="dog._id.$oid">
					<Dog v-bind:dog="dog" />
				</b-col>
			</b-row>

	</b-container>
</template>

<script>
	import Event from "./Profile/Event";
	import EventModal from "./Profile/EventModal";
	import Dog from "./Profile/Dog";
	import DogModal from "./Profile/DogModal";

	export default {
		name: "Profile",
		components: {
			Event,
			EventModal,
			Dog,
			DogModal
		},
		data() {
			return {
				selectedEvent: null,
				selectedDog: null,
				eventModalVisible: false,
				addDogModalVisible: false
			};
		},
		computed: {
			loggedIn() {
				return this.$store.getters.loggedIn;
			},
			userAwaitingEvents() {
				if (this.$store.state.userProfile.events) {
					return this.$store.state.userProfile.events
						.filter(
							event =>
								event.status == "pending" &&
								event.proposer._id.$oid == this.$store.state.userProfile._id.$oid
						)
						.sort((x, y) => x.time.$date - y.time.$date);
				}
				return [];
			},
			userInvitedEvents() {
				if (this.$store.state.userProfile.events) {
					return this.$store.state.userProfile.events.filter(
						event =>
							event.status == "pending" &&
							event.invited._id.$oid == this.$store.state.userProfile._id.$oid
					);
				}
				return [];
			},
			userConfirmedEvents() {
				if (this.$store.state.userProfile.events) {
					return this.$store.state.userProfile.events
						.filter(event => event.status == "accepted")
						.sort((x, y) => x.time.$date - y.time.$date);
				}
				return [];
			}
		},
		methods: {
			openEventModal(event) {
				this.selectedEvent = event;
				this.eventModalVisible = true;
			}
		},
		mounted() {
			this.$store.dispatch("retrieveUserProfile");
		}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.container {
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 8px;
		margin-bottom: 20px;
	}
</style>