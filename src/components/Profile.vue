<template>
	<div>
		<h2>Hi, {{ userProfile.first_name }}!</h2>

		<!-- Events -->

		<b-container>
			<!-- Confirmed -->

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
							<p>{{
							Math.round(
							getDistanceFromLatLonInKm(
							event.location.coordinates[1],
							event.location.coordinates[0],
							userProfile.location.coordinates[1],
							userProfile.location.coordinates[0]
							) * 10
							) / 10
							}}km away</p>
							<a target="_blank" :href="`https://www.google.com/maps?saddr=${userProfile.location.coordinates[1]},${userProfile.location.coordinates[0]}&daddr=${event.location.coordinates[1]},${event.location.coordinates[0]}`">Get directions</a>
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
							<div>
								<div id="event-map"></div>
								<div class="map-overlay" id="legend"></div>
							</div>
						</b-form-group>
					</form>

					<template v-slot:modal-footer>
						<b-container>
							<b-row align-h="around">
								<b-button
									@click="declineEvent"
									v-if="
                    userConfirmedEvents.filter(
                      (event) => event._id.$oid == meetupEvent._id.$oid
                    ).length > 0 ||
                      userAwaitingEvents.filter(
                        (event) => event._id.$oid == meetupEvent._id.$oid
                      )
                  "
									variant="outline-danger"
								>Cancel Event</b-button>
								<b-button @click="updateEvent" v-if="formEnabled" variant="outline-info">Send request</b-button>
								<b-button
									@click="acceptEvent"
									v-if="
                    !formEnabled &&
                      userInvitedEvents.filter(
                        (event) => event._id.$oid == meetupEvent._id.$oid
                      ).length > 0
                  "
									variant="outline-success"
								>Accept</b-button>
								<b-button
									@click="declineEvent"
									v-if="
                    !formEnabled &&
                      userInvitedEvents.filter(
                        (event) => event._id.$oid == meetupEvent._id.$oid
                      ).length > 0
                  "
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
							<p>{{
							Math.round(
							getDistanceFromLatLonInKm(
							event.location.coordinates[1],
							event.location.coordinates[0],
							userProfile.location.coordinates[1],
							userProfile.location.coordinates[0]
							) * 10
							) / 10
							}}km away</p>
							<a target="_blank" :href="`https://www.google.com/maps?saddr=${userProfile.location.coordinates[1]},${userProfile.location.coordinates[0]}&daddr=${event.location.coordinates[1]},${event.location.coordinates[0]}`">Get directions</a>
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

		<!-- Pending responses -->

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
							<p>{{
							Math.round(
							getDistanceFromLatLonInKm(
							event.location.coordinates[1],
							event.location.coordinates[0],
							userProfile.location.coordinates[1],
							userProfile.location.coordinates[0]
							) * 10
							) / 10
							}}km away</p>
							<a target="_blank" :href="`https://www.google.com/maps?saddr=${userProfile.location.coordinates[1]},${userProfile.location.coordinates[0]}&daddr=${event.location.coordinates[1]},${event.location.coordinates[0]}`">Get directions</a>
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

		<!-- Dogs -->

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
				<b-col cols="12" sm="6" md="4" lg="3" v-for="dog in userProfile.dogs" :key="dog._id.$oid">
					<b-card header-bg-variant="secondary" header-text-variant="white">
						<template v-slot:header>{{ dog.name }}</template>
						<b-card-sub-title>{{ formatDate(dog.date_of_birth) }}</b-card-sub-title>
						<b-card-body>{{ dog.breed }}</b-card-body>
						<template v-slot:footer>
							<b-button @click="showMsgBox" :id="dog._id.$oid" variant="outline-danger">Remove</b-button>
						</template>
					</b-card>
				</b-col>
			</b-row>
		</b-container>
	</div>
</template>

<script>
	const axios = require("axios");
	const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
	const moment = require("moment");

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
				return this.userProfile.events.filter(
					event =>
						event.status == "pending" &&
						event.proposer._id.$oid == this.userProfile._id.$oid
				);
			},
			userInvitedEvents() {
				return this.userProfile.events.filter(
					event =>
						event.status == "pending" &&
						event.invited._id.$oid == this.userProfile._id.$oid
				);
			},
			userConfirmedEvents() {
				return this.userProfile.events.filter(event => event.status == "accepted");
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
				const m = new moment(this.meetupEvent.time.$date);
				console.log(m.toISOString());
				this.meetupDate = m.format('YYYY-MM-DD')
				this.meetupTime = m.format('HH:mm:ss')
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
				this.meetupEvent = this.userProfile.events.filter(
					event => e.target.id == event._id.$oid
				)[0];
				const m = new moment(this.meetupEvent.time.$date);
				this.meetupDate = m.format('YYYY-MM-DD')
				this.meetupTime = m.format('HH:mm:ss')
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


				// Remove legend if it already exists
				document.getElementById("legend").innerHTML="";

				// Create the legend
				const layers = ["You", "Other User", "Suggested"];
				const svg = [
					'<svg display="block" height="20px" width="13px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="red"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>',
					'<svg display="block" height="20px" width="13px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="blue"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>',
					'<svg display="block" height="20px" width="13px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="green"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>'
				];
				for (let index = 0; index < layers.length; index++) {
					const layer = layers[index];
					const item = document.createElement("div");
					const value = document.createElement("span");
					const icon = document.createElement("div");
					value.innerHTML = layer;
					icon.style.cssText = "display: inline-block";
					icon.innerHTML = svg[index];
					item.appendChild(value).appendChild(icon);
					document.getElementById("legend").appendChild(item);
				}

				map.on("load", function() {
					map.resize();
				});

				new mapboxgl.Marker({ color: "red" })
					.setLngLat({
						lng: this.meetupEvent.invited.location.coordinates[0],
						lat: this.meetupEvent.invited.location.coordinates[1]
					})
					.addTo(map);

				new mapboxgl.Marker({ color: "blue" })
					.setLngLat({
						lng: this.meetupEvent.proposer.location.coordinates[0],
						lat: this.meetupEvent.proposer.location.coordinates[1]
					})
					.addTo(map);

				new mapboxgl.Marker({ color: "green" })
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

					new mapboxgl.Marker({ color: "green" })
						.setLngLat(e.lngLat)
						.addTo(map)
						.getElement()
						.classList.add("proposed-marker");
				});
			},
			formatDate(date) {
				const m = new moment(date);
				return m.format("ddd, MMM Do, HH:mm A");
			},
			updateEvent() {
				const m = new moment(`${this.meetupDate} ${this.meetupTime}`)
				const time = m.utc().format('YYYY-MM-DD HH:mm:ss')
				console.log(time);
				this.$store.dispatch("updateEvent", {
					id: this.meetupEvent._id.$oid,
					location:
						this.meetupLocation.coordinates.length == 0
							? this.meetupEvent.location
							: this.meetupLocation,
					time: time,
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
						this.$store.dispatch("retrieveUserProfile");
						return response;
					});
			},
			showMsgBox(e) {
				this.$bvModal
					.msgBoxConfirm("Are you sure you want to remove this pupper?")
					.then(value => {
						if (value) {
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

	.map-overlay {
		position: absolute;
		bottom: 196px;
		left: 0;
		background: rgba(255, 255, 255, 0.8);
		margin-left: 20px;
		font-family: Arial, sans-serif;
		overflow: auto;
		border-radius: 3px;
		text-align: left;
	}

	#legend {
		padding: 10px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		line-height: 18px;
		margin-bottom: 40px;
	}

	.legend-key {
		display: inline-block;
		border-radius: 20%;
		width: 20px;
		height: 10px;
		margin-right: 5px;
	}
</style>