<template>
	<div>
		<h2>Hi, {{ userProfile.first_name }} {{ userProfile.last_name }}!</h2>
		<b-container fluid>
			<b-row class="justify-content-center">
				<b-col v-for="dog in userDogs" :key="dog._id.$oid">
					<p :id="dog.name">{{dog.name}}</p>
					<b-button @click="showMsgBox" :id="dog._id.$oid" variant="outline-danger">Remove</b-button>
				</b-col>
				<b-col>
					<b-btn @click="toggleDogModal">Add new dog</b-btn>
				</b-col>
				<b-modal ref="dog-modal" id="dog-modal" static>
					<template v-slot:modal-title>Add a new dog!</template>
					<form>
						<b-form-group label="Name" label-for="dog-name-input" invalid-feedback="Dog name is required">
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
								type="password"
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
						<b-button variant="outline-primary" @click="addDog">Add Dog</b-button>
					</template>
				</b-modal>
			</b-row>
		</b-container>
	</div>
</template>

<script>
	const axios = require("axios");

	export default {
		name: "Profile",
		components: {},
		data() {
			return {
				dogName: "",
				dogBreed: "",
				dogBirthDate: "",
				breedOptions: [
					"Labrador",
					"Border Collie",
					"German Shepherd",
					"Other"
				]
			};
		},
		computed: {
			loggedIn() {
				return this.$store.getters.loggedIn;
			},
			userProfile() {
				return this.$store.getters.getUserProfile;
			},
			userDogs() {
				return this.$store.getters.getUserDogs;
			}
		},
		methods: {
			toggleDogModal() {
				this.$refs["dog-modal"].toggle();
			},
			addDog() {
				console.log(this.$store.getters.getToken);
				axios
					.post(
						"http://localhost:5000/api/dogs",
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
			this.$store.dispatch("retrieveUserDogs");
			console.log(process.env.VUE_APP_MAPBOXKEY)
		}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>