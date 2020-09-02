<template>
	<div>
		<h2>Hi, {{ userProfile.first_name }}!</h2>

		<!-- Events -->

		<b-container>
			<!-- <Confirmed /> -->

			<b-row class="p-3">
				<h2>Upcoming Walkies</h2>
			</b-row>
			<b-row class="p-3">
				<b-col
					cols="12"
					sm="6"
					md="4"
					lg="3"
					v-for="event in userConfirmedEvents"
					:key="event._id.$oid"
				>
					<b-card header-bg-variant="success" header-text-variant="white">
						<template v-slot:header>
							<div class="float-left">{{ getOtherUser(event).first_name }}</div>
							<div class="float-right">
								<p class="text-right m-0" :id="`popover-target-${event._id.$oid}`">
									<font-awesome-icon icon="dog" />
									{{ getOtherUser(event).dogs.length }}
								</p>
								<b-popover
									:target="`popover-target-${event._id.$oid}`"
									triggers="hover"
									placement="rightbottom"
								>
									<b-table striped :items="getOtherUser(event).dogs" :fields="dogFields"></b-table>
								</b-popover>
							</div>
						</template>
						<b-card-sub-title>
							{{
							formatDate(event.time.$date)
							}}
						</b-card-sub-title>
						<b-card-body>
							{{
							Math.round(
							getDistanceFromLatLonInKm(
							event.location.coordinates[1],
							event.location.coordinates[0],
							userProfile.location.coordinates[1],
							userProfile.location.coordinates[0]
							) * 10
							) / 10
							}}km
						</b-card-body>
						<template v-slot:footer>
							<b-row>
								<b-col>
									<b-btn
										variant="outline-success"
										:id="event._id.$oid"
										@click="toggleEventModal"
									>View Details</b-btn>
								</b-col>
							</b-row>
						</template>
					</b-card>
				</b-col>
				<b-modal ref="event-modal" id="event-modal" static>
					<template v-slot:modal-title>Walkies</template>
					<form>
						<b-form-group>
							<b-form-checkbox v-model="formEnabled" @input="resetForm">
								<span v-if="!formEnabled">Check to make changes</span>
								<span v-else>Untick to see original details</span>
							</b-form-checkbox>
						</b-form-group>
						<b-form-group
							label="Date"
							label-for="meetup-date-input"
							invalid-feedback="Pleae choose a date."
						>
							<b-form-datepicker
								:disabled="!formEnabled"
								:min="minDate"
								id="meetup-date-input"
								v-model="meetupDate"
							></b-form-datepicker>
						</b-form-group>
						<b-form-group
							label="Time"
							label-for="meetup-time-input"
							invalid-feedback="Pleae choose a time."
						>
							<b-form-timepicker :disabled="!formEnabled" id="meetup-time-input" v-model="meetupTime"></b-form-timepicker>
						</b-form-group>
						<b-form-group
							label="Duration"
							label-for="meetup-duration-input"
							invalid-feedback="Duration is required"
						>
							<b-form-select
								:disabled="!formEnabled"
								class="text-center"
								id="meetup-duration-input"
								v-model="meetupDuration"
								:options="durationOptions"
							></b-form-select>
						</b-form-group>
						<b-form-group
							label="Location"
							label-for="event-map"
							invalid-feedback="Please select suggested location on the map"
						>
							<div id="event-map"></div>
						</b-form-group>
					</form>

					<template v-slot:modal-footer>
						<b-container>
							<b-row align-h="around">
								<b-button
									@click="declineEvent"
									v-if="(userConfirmedEvents.filter(event => event._id.$oid == meetupEvent._id.$oid).length > 0) || (userAwaitingEvents.filter(event => event._id.$oid == meetupEvent._id.$oid))"
									variant="outline-danger"
								>Cancel Event</b-button>
								<b-button @click="updateEvent" v-if="formEnabled" variant="outline-info">Send request</b-button>
								<b-button
									@click="acceptEvent"
									v-if="!formEnabled && userInvitedEvents.filter(event => event._id.$oid == meetupEvent._id.$oid).length > 0"
									variant="outline-success"
								>Accept</b-button>
								<b-button
									@click="declineEvent"
									v-if="!formEnabled && userInvitedEvents.filter(event => event._id.$oid == meetupEvent._id.$oid).length > 0"
									variant="outline-danger"
								>Decline</b-button>
							</b-row>
						</b-container>
					</template>
				</b-modal>
			</b-row>
		</b-container>

		<!-- Invited -->
		<b-container>
			<b-row class="p-3">
				<h2>Invites received from other users!</h2>
			</b-row>
			<b-row class="p-3">
				<b-col cols="12" sm="6" md="4" lg="3" v-for="event in userInvitedEvents" :key="event._id.$oid">
					<b-card header-bg-variant="warning">
						<template v-slot:header>
							<div class="float-left">{{ event.proposer.first_name }}</div>
							<div class="float-right">
								<p class="text-right m-0" :id="`popover-target-${event._id.$oid}`">
									<font-awesome-icon icon="dog" />
									{{ event.proposer.dogs.length }}
								</p>
								<b-popover
									:target="`popover-target-${event._id.$oid}`"
									triggers="hover"
									placement="rightbottom"
								>
									<b-table striped :items="event.proposer.dogs" :fields="dogFields"></b-table>
								</b-popover>
							</div>
						</template>
						<b-card-sub-title>
							{{
							formatDate(event.time.$date)
							}}
						</b-card-sub-title>
						<b-card-body>
							{{
							Math.round(
							getDistanceFromLatLonInKm(
							event.location.coordinates[1],
							event.location.coordinates[0],
							userProfile.location.coordinates[1],
							userProfile.location.coordinates[0]
							) * 10
							) / 10
							}}km
						</b-card-body>
						<template v-slot:footer>
							<b-row>
								<b-col>
									<b-btn
										variant="outline-warning"
										:id="event._id.$oid"
										@click="toggleEventModal"
									>View Details</b-btn>
								</b-col>
							</b-row>
						</template>
					</b-card>
				</b-col>
			</b-row>
		</b-container>
		<b-container>
			<b-row class="p-3">
				<h2>Pending response from other user:</h2>
			</b-row>
			<b-row class="p-3">
				<b-col cols="12" sm="6" md="4" lg="3" v-for="event in userAwaitingEvents" :key="event._id.$oid">
					<b-card header-bg-variant="info">
						<template v-slot:header>
							<div class="float-left">{{ event.invited.first_name }}</div>
							<div class="float-right">
								<p class="text-right m-0" :id="`popover-target-${event._id.$oid}`">
									<font-awesome-icon icon="dog" />
									{{ event.invited.dogs.length }}
								</p>
								<b-popover
									:target="`popover-target-${event._id.$oid}`"
									triggers="hover"
									placement="rightbottom"
								>
									<b-table striped :items="event.invited.dogs" :fields="dogFields"></b-table>
								</b-popover>
							</div>
						</template>
						<b-card-sub-title>
							{{
							formatDate(event.time.$date)
							}}
						</b-card-sub-title>
						<b-card-body>
							{{
							Math.round(
							getDistanceFromLatLonInKm(
							event.location.coordinates[1],
							event.location.coordinates[0],
							userProfile.location.coordinates[1],
							userProfile.location.coordinates[0]
							) * 10
							) / 10
							}}km
						</b-card-body>
						<template v-slot:footer>
							<b-row>
								<b-col>
									<b-btn variant="outline-info" :id="event._id.$oid" @click="toggleEventModal">View Details</b-btn>
								</b-col>
							</b-row>
						</template>
					</b-card>
				</b-col>
			</b-row>
		</b-container>
		<b-container>
			<b-row class="p-3">
				<b-col>
					<b-btn @click="toggleDogModal">Add new dog</b-btn>
					<b-modal ref="dog-modal" id="dog-modal" static>
						<template v-slot:modal-title>Add a new dog!</template>
						<form>
							<b-form-group
								label="Name"
								label-for="dog-name-input"
								invalid-feedback="Dog name is required"
							>
								<b-form-input class="text-center" id="dog-name-input" v-model="dogName" required></b-form-input>
							</b-form-group>
							<b-form-group
								label="Breed"
								label-for="dog-breed-input"
								invalid-feedback="Dog Breed is required"
							>
								<b-form-select
									class="text-center"
									id="dog-breed-input"
									v-model="dogBreed"
									required
									:options="breedOptions"
								></b-form-select>
							</b-form-group>
							<b-form-group
								label="Date of Birth"
								label-for="dog-birth-date-input"
								invalid-feedback="Please provide a date of birth"
							>
								<b-form-datepicker id="dog-birth-date-input" v-model="dogBirthDate"></b-form-datepicker>
							</b-form-group>
						</form>

						<template v-slot:modal-footer>
							<b-button @click="$bvModal.hide('dog-modal')">Cancel</b-button>
							<b-button variant="outline-dark" @click="addDog">Add Dog</b-button>
						</template>
					</b-modal>
				</b-col>
			</b-row>
			<b-row class="justify-content-center p-3">
				<b-col cols="12" sm="6" md="4" lg="3" v-for="dog in userDogs" :key="dog._id.$oid">
					<p :id="dog.name">{{ dog.name }}</p>
					<b-button @click="showMsgBox" :id="dog._id.$oid" variant="outline-danger">Remove</b-button>
				</b-col>
			</b-row>
		</b-container>
	</div>
</template>

<script>
	const axios = require("axios");
	const dateFormat = require("dateformat");
	const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");

	export default {
		name: "Profile",
		components: {},
		data() {
			const today = new Date();
			return {
				formEnabled: false,
				minDate: today,
				meetupEvent: "",
				meetupDate: "",
				meetupTime: "",
				meetupDuration: "",
				meetupLocation: {
					type: "Point",
					coordinates: []
				},
				durationOptions: ["30 mins", "1 hour", "2 hours or more"],
				dogFields: ["name", "breed"],
				dogName: "",
				dogBreed: "",
				dogBirthDate: "",
				breedOptions: [
					"Labrador",
					"Border Collie",
					"German Shepherd",
					"Dachshund",
					"Cocker Spaniel",
					"Other"
				]
			};
		},
		computed: {
			disabled() {
				return this.state === "disabled";
			},
			loggedIn() {
				return this.$store.getters.loggedIn;
			},
			userProfile() {
				return this.$store.getters.getUserProfile;
			},
			userDogs() {
				return this.$store.getters.getUserDogs;
			},
			userEvents() {
				return this.$store.getters.getUserEvents;
			},
			userAwaitingEvents() {
				return this.userEvents.filter(
					event =>
						event.status == "pending" &&
						event.proposer._id.$oid == this.userProfile._id.$oid
				);
			},
			userInvitedEvents() {
				return this.userEvents.filter(
					event =>
						event.status == "pending" &&
						event.invited._id.$oid == this.userProfile._id.$oid
				);
			},
			userConfirmedEvents() {
				return this.userEvents.filter(event => event.status == "accepted");
			},
			mapboxKey() {
				return this.$store.getters.getMapboxKey;
			}
		},
		methods: {
			resetForm() {
				if (this.formEnabled == false) {
					this.setModalDetails();
					this.createEventMapbox();
				}
			},
			setModalDetails() {
				this.meetupDate = dateFormat(
					this.meetupEvent.time.$date,
					"yyyy-mm-dd"
				);
				this.meetupTime = dateFormat(
					this.meetupEvent.time.$date,
					"hh:MM:ss"
				);
				this.meetupDuration = this.meetupEvent.length;
				this.meetupLocation = {
					type: "Point",
					coordinates: []
				};
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
			toggleEventModal(e) {
				this.formEnabled = false;
				this.meetupEvent = this.userEvents.filter(
					event => e.target.id == event._id.$oid
				)[0];
				this.meetupDate = dateFormat(
					this.meetupEvent.time.$date,
					"yyyy-mm-dd"
				);
				this.meetupTime = dateFormat(
					this.meetupEvent.time.$date,
					"hh:MM:ss"
				);
				this.meetupDuration = this.meetupEvent.length;
				this.$refs["event-modal"].toggle();

				setTimeout(() => {
					this.createEventMapbox();
				}, 100);
			},
			createEventMapbox() {
				mapboxgl.accessToken = this.mapboxKey;
				const map = new mapboxgl.Map({
					container: "event-map",
					style: "mapbox://styles/mapbox/outdoors-v11",
					center: this.meetupEvent.location.coordinates,
					zoom: 10,
					maxBounds: [
						[-3.606773, 48.233686],
						[3.346901, 54.707793]
					]
				});

				map.on("load", function() {
					map.resize();
				});

				new mapboxgl.Marker({ color: "gray" })
					.setLngLat({
						lng: this.meetupEvent.invited.location.coordinates[0],
						lat: this.meetupEvent.invited.location.coordinates[1]
					})
					.addTo(map);

				new mapboxgl.Marker({ color: "gray" })
					.setLngLat({
						lng: this.meetupEvent.proposer.location.coordinates[0],
						lat: this.meetupEvent.proposer.location.coordinates[1]
					})
					.addTo(map);

				new mapboxgl.Marker({ color: "gold" })
					.setLngLat({
						lng: this.meetupEvent.location.coordinates[0],
						lat: this.meetupEvent.location.coordinates[1]
					})
					.addTo(map)
					.getElement()
					.classList.add("proposed-marker");

				const nav = new mapboxgl.NavigationControl();
				map.addControl(nav, "top-right");
				map.on("click", e => {
					if (this.formEnabled == false) {
						return;
					}
					// remove any old markers previously added by user
					const oldMarkers = document.querySelectorAll(
						".proposed-marker"
					);
					if (oldMarkers) {
						oldMarkers.forEach(node =>
							node.parentElement.removeChild(node)
						);
					}

					// round the coordinates of the selected location on map to 4dp
					// and store them to the component data
					this.meetupLocation.coordinates = [
						Math.round(e.lngLat.lng * 10000) / 10000,
						Math.round(e.lngLat.lat * 10000) / 10000
					];

					new mapboxgl.Marker({ color: "gold" })
						.setLngLat(e.lngLat)
						.addTo(map)
						.getElement()
						.classList.add("proposed-marker");
				});
			},
			formatDate(date) {
				return dateFormat(date, "ddd, mmm dS, hh:MM TT");
			},
			updateEvent() {
				this.$store.dispatch("updateEvent", {
					id: this.meetupEvent._id.$oid,
					location:
						this.meetupLocation.coordinates.length == 0
							? this.meetupEvent.location
							: this.meetupLocation,
					time: `${this.meetupDate} ${this.meetupTime}`,
					length: this.meetupDuration,
					proposer: this.userProfile._id.$oid,
					invited:
						this.meetupEvent.proposer._id.$oid ==
						this.userProfile._id.$oid
							? this.meetupEvent.invited._id.$oid
							: this.meetupEvent.proposer._id.$oid
				});
				this.$refs["event-modal"].toggle();
				this.$store.dispatch("retrieveUserProfile");
			},
			acceptEvent() {
				this.$store.dispatch("acceptEvent", this.meetupEvent._id.$oid);
				this.$refs["event-modal"].toggle();
			},
			declineEvent() {
				this.$store.dispatch("declineEvent", this.meetupEvent._id.$oid);
			},
			getOtherUser(event) {
				if (event.invited._id.$oid == this.userProfile._id.$oid) {
					return event.proposer;
				} else {
					return event.invited;
				}
			},
			toggleDogModal() {
				this.$refs["dog-modal"].toggle();
			},
			addDog() {
				console.log(this.$store.getters.getToken);
				axios
					.post(
						"https://walkies-api.herokuapp.com/api/dogs",
						{
							name: this.dogName,
							breed: this.dogBreed,
							date_of_birth: this.dogBirthDate
						},
						{
							headers: {
								Authorization:
									"Bearer " + this.$store.getters.getToken
							}
						}
					)
					.then(response => {
						console.log(response);
						this.$store.dispatch("retrieveUserDogs");
					});
			},
			showMsgBox(e) {
				this.$bvModal
					.msgBoxConfirm("Are you sure you want to remove this pupper?")
					.then(value => {
						if (value) {
							console.log("removing dog");
							this.$store
								.dispatch("removeDogFromProfile", e.target.id)
								.then(this.$forceUpdate());
						}
					})
					.catch(err => err);
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
		border-radius: 10px;
		margin-bottom: 20px;
	}
	#event-map {
		width: 100%;
		height: 300px;
	}
</style>
