<template>
	<b-modal ref="sign-up-modal" @hidden="$emit('close-modal')" static>
		<template v-slot:modal-title>Register for Walkies!</template>
		<b-form id="sign-up-form" @submit="submitSignUpForm">
			<!-- Email -->
			<label class="float-left" for="email-input">Email Address</label>
			<b-input
				@focus="emailTaken = true"
				v-model="email"
				:state="emailValidation && emailTaken"
				id="email-input"
			></b-input>
			<br />

			<!-- First Name -->
			<label class="float-left" for="first-name-input">First Name</label>
			<b-input v-model="first_name" :state="firstNameValidation" id="first-name-input"></b-input>
			<br />

			<!-- Surname -->
			<label class="float-left" for="last-name-input">Last Name</label>
			<b-input v-model="last_name" :state="lastNameValidation" id="last-name-input"></b-input>
			<br />

			<!-- Password -->
			<label class="float-left" for="password-input">Password</label>
			<b-input
				v-model="password"
				:state="passwordValidation"
				id="password-input"
				type="password"
				aria-describedby="password-help-block"
			></b-input>
			<b-form-text
				id="password-help-block"
				class="text-left"
			>Must be 8-20 characters long, and contain at least one lowercase letter, uppercase letter, number and special character.</b-form-text>
			<br />

			<!-- Confirm Password -->
			<label class="float-left" for="confirm-password-input">Confirm Password</label>
			<b-input
				v-model="confirmPassword"
				:state="confirmPasswordValidation"
				id="confirm-password-input"
				type="password"
			></b-input>
			<br />

			<!-- Location -->
			<label class="float-left" for="location-input">Your Location - Select On Map</label>
			<b-input
				v-model="locationString"
				:state="locationValidation"
				id="location-input"
				class="mb-2"
				disabled
			></b-input>
			<div id="mapContainer"></div>
		</b-form>
		{{ formError }}
		<template v-slot:modal-footer>
			<b-button @click="$refs['sign-up-modal'].toggle()">Cancel</b-button>
			<b-button
				variant="outline-info"
				type="submit"
				form="sign-up-form"
				:disabled="formValidation"
			>Register</b-button>
		</template>
	</b-modal>
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
				return this.email.length == 0
					? null
					: validator.isEmail(this.email);
			},
			firstNameValidation() {
				return this.first_name.length == 0
					? null
					: validator.isAlpha(this.first_name);
			},
			lastNameValidation() {
				return this.last_name.length == 0
					? null
					: validator.isAlpha(this.last_name);
			},
			passwordValidation() {
				return this.password.length == 0
					? null
					: schema.validate(this.password);
			},
			confirmPasswordValidation() {
				if (this.password.length == 0) {
					return null;
				} else {
					return this.confirmPassword.length == 0
						? null
						: this.confirmPassword === this.password;
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
						this.$refs["sign-up-modal"].toggle();
						this.$store.dispatch("retrieveToken", {
							email: this.email,
							password: this.password
						});
						return response;
					})
					.catch(error => {
						console.log(error);
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
					// Center is London-ish area by default
					center: [-0.496934, 51.437032],
					// Zoom up close if user accepted giving coordinates
					zoom: 5
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
						});
					},

					// if user says no, then log error to console.
					console.log,
					{
						enableHighAccuracy: true,
						maximumAge: 0
					}
				);

				// Once map is loaded, resize it to fit the width of the modal, which is repsonse to device.
				map.on("load", function() {
					map.resize();
				});

				// Adds basic zoom and rotate control
				const nav = new mapboxgl.NavigationControl();
				map.addControl(nav, "top-right");

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
					new mapboxgl.Marker({ color: "red" })
						.setLngLat(e.lngLat)
						.addTo(map);
				});
			},
			toggleModal() {
				// opens the signup modal and initialises the mapbox.
				this.$refs["sign-up-modal"].toggle();
				this.createSignUpMaxBox();
			}
		},
		mounted() {
			console.log("mounting the sign up modal");
			this.toggleModal();
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