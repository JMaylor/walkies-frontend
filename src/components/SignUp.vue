<template>
	<div>
		<!-- nav button -->
		<b-nav-item @click="toggleModal">Register</b-nav-item>

		<!-- Sign Up Modal -->
		<b-modal ref="sign-up-modal" id="sign-up-modal" static>
			<template v-slot:modal-title>Register for Walkies!</template>
			<b-form id="sign-up-form" @submit="submitSignUpForm">
				<!-- Email -->
				<label for="email-input">Email Address</label>
				<b-input
					@focus="emailTaken = true"
					v-model="email"
					:state="emailValidation && emailTaken"
					id="email-input"
					class="text-center"
				></b-input>
				<br />

				<!-- First Name -->
				<label for="first-name-input">First Name</label>
				<b-input
					v-model="first_name"
					:state="firstNameValidation"
					id="first-name-input"
					class="text-center"
				></b-input>
				<br />

				<!-- Surname -->
				<label for="last-name-input">Last Name</label>
				<b-input
					v-model="last_name"
					:state="lastNameValidation"
					id="last-name-input"
					class="text-center"
				></b-input>
				<br />

				<!-- Password -->
				<label for="password-input">Password</label>
				<b-input
					v-model="password"
					:state="passwordValidation"
					id="password-input"
					class="text-center"
					type="password"
					aria-describedby="password-help-block"
				></b-input>
				<b-form-text
					id="password-help-block"
				>Must be 8-20 characters long, and contain at least one lowercase letter, uppercase letter, number and special character.</b-form-text>
				<br />

				<!-- Confirm Password -->
				<label for="confirm-password-input">Confirm Password</label>
				<b-input
					v-model="confirmPassword"
					:state="confirmPasswordValidation"
					id="confirm-password-input"
					class="text-center"
					type="password"
				></b-input>
				<br />

				<!-- Location -->
				<label for="location-input">Your Location - Select On Map</label>
				<b-input
					v-model="locationString"
					:state="locationValidation"
					id="location-input"
					class="text-center mb-2"
					disabled
				></b-input>
				<div id="mapContainer"></div>
			</b-form>
			{{ formError }}
			<template v-slot:modal-footer>
				<b-button @click="$bvModal.hide('sign-up-modal')">Cancel</b-button>
				<b-button
					variant="outline-info"
					type="submit"
					form="sign-up-form"
					:disabled="formValidation"
				>Register</b-button>
			</template>
		</b-modal>
	</div>
</template>

<script>
	const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
	const axios = require("axios");
	const validator = require("validator");
	const passwordValidator = require("password-validator");

	// schema for the password validator
	const schema = new passwordValidator();
	schema
		.is()
		.min(8)
		.is()
		.max(20)
		.has()
		.uppercase()
		.has()
		.lowercase()
		.has()
		.digits()
		.has()
		.symbols();

	export default {
		name: "SignUp",
		data() {
			return {
				email: "",
				password: "",
				confirmPassword: "",
				first_name: "",
				last_name: "",
				location: {
					type: "Point",
					coordinates: []
				},
				// emailTaken is set to false if the register request throws back an EmailAlreadyTaken error
				emailTaken: true,
				formError: ""
			};
		},
		computed: {
			mapboxKey() {
				return this.$store.getters.getMapboxKey;
			},
			emailValidation() {
				return validator.isEmail(this.email);
			},
			firstNameValidation() {
				return validator.isAlpha(this.first_name);
			},
			lastNameValidation() {
				return validator.isAlpha(this.last_name);
			},
			passwordValidation() {
				return schema.validate(this.password);
			},
			confirmPasswordValidation() {
				if (this.password.length == 0) {
					return null;
				} else {
					return this.confirmPassword === this.password;
				}
			},
			locationString() {
				return this.location.coordinates.toString();
			},
			locationValidation() {
				return this.location.coordinates.length > 0;
			},
			formValidation() {
				return !(
					this.emailValidation &&
					this.firstNameValidation &&
					this.lastNameValidation &&
					this.passwordValidation &&
					this.confirmPasswordValidation &&
					this.locationValidation
				);
			}
		},
		methods: {
			submitSignUpForm(e) {
				e.preventDefault();
				this.createNewUser();
			},
			createNewUser() {
				axios
					.post("https://walkies-api.herokuapp.com/api/auth/signup", {
						email: this.email,
						password: this.password,
						first_name: this.first_name,
						last_name: this.last_name,
						location: this.location
					})
					.then(response => {
						// If user sign-up is successful, hide the sign-up modal and then log in and retreive token straight away
						this.$bvModal.hide("sign-up-modal");
						this.$store.dispatch("retrieveToken", {
							email: this.email,
							password: this.password
						});
						return response;
					})
					.catch(error => {
						// Almost all validation on this form matches the MongoDB model specification.
						// Only thing we have to wait for response for is if the email is in use.
						// If it is, then set email taken, which adds feedback to the email input field.
						if (
							error.response.data.message ===
							"User with given email address already exists"
						) {
							this.emailTaken = false;
						}
						alert(error.response.data.message);
					});
			},
			createSignUpMaxBox() {
				mapboxgl.accessToken = this.mapboxKey;

				// Create the mapbox map to select location
				const map = new mapboxgl.Map({
					container: "mapContainer",
					style: "mapbox://styles/mapbox/outdoors-v11",
					// Center is London area, or user location if supplied
					center: [-0.496934, 51.437032],
					// Zoom up close if user accepted giving coordinates
					zoom: 5,
					// Bounds are a square containing roughly the M25.
					// maxBounds: [
					// 	[-0.570532, 51.232299],
					// 	[0.283078, 51.707375]
					// ]
				});

				// Request to get the user's current location
				window.navigator.geolocation.getCurrentPosition(
					position => {
						// get the latitude and longitude returned
						const lat = position.coords.latitude;
						const long = position.coords.longitude;

						// set the location data
						this.location.coordinates = [
							Math.round(long * 10000) / 10000,
							Math.round(lat * 10000) / 10000
						];

						// add marker on map for their location
						new mapboxgl.Marker({ color: "red" })
							.setLngLat({
								lng: long,
								lat: lat
							})
							.addTo(map);

						// fly there on the map
						map.flyTo({
							center: [long, lat],
							zoom: 12
						})
					},

					// if user says no, then log error to console.
					console.log
				);
		

				// Once map is loaded, resize it to fit the width of the modal, which is repsonse to device.
				map.on("load", function() {
					map.resize();
				});

				// Adds basic zoom and rotate control
				const nav = new mapboxgl.NavigationControl();
				map.addControl(nav, "top-right");

				// Request to get the user's current location
				window.navigator.geolocation.getCurrentPosition(
					position => {
						// get the latitude and longitude returned
						const lat = position.coords.latitude;
						const long = position.coords.longitude;
						// set the location equal to this
						this.location.coordinates = [
							Math.round(long * 10000) / 10000,
							Math.round(lat * 10000) / 10000
						];
						// add marker on map for their location
						const marker = new mapboxgl.Marker({ color: "red" })
							.setLngLat({
								lng: long,
								lat: lat
							})
							.addTo(map);
						return marker;
					},
					// if user says no, then log error to console.
					console.log,
					{
						enableHighAccuracy: true,
						maximumAge: 0
					}
				);

				// When user clicks on the map, the location is stored in a data variable
				map.on("click", e => {
					this.location.coordinates = [
						Math.round(e.lngLat.lng * 10000) / 10000,
						Math.round(e.lngLat.lat * 10000) / 10000
					];

					// Remove any old markers on the map that they previously set
					const oldMarker = document.querySelector(".mapboxgl-marker");
					if (oldMarker) {
						oldMarker.parentElement.removeChild(oldMarker);
					}

					// Add the new marker
					const marker = new mapboxgl.Marker({ color: "red" })
						.setLngLat(e.lngLat)
						.addTo(map);

					console.log(e.lngLat);
					return marker;
				});
			},
			toggleModal() {
				// opens the signup modal and initialises the mapbox.
				this.$refs["sign-up-modal"].toggle();
				this.createSignUpMaxBox();
			}
		}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	#mapContainer {
		width: 100%;
		height: 300px;
	}
</style>
