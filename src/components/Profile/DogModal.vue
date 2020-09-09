<template>
	<b-modal ref="dog-modal" @hidden="$emit('close-modal')" static>
		<template v-slot:modal-title>Add a new dog!</template>
		<form>
			<b-form-group label="Name" label-for="dog-name-input" invalid-feedback="Dog name is required">
				<b-form-input class="text-center" id="dog-name-input" v-model="dogName" required></b-form-input>
			</b-form-group>
			<b-form-group label="Breed" label-for="dog-breed-input" invalid-feedback="Dog Breed is required">
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
</template>
<script>
	// const moment = require("moment");
	const axios = require("axios");

	export default {
		props: ["event"],
		data() {
			return {
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
		computed: {},
		methods: {
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
						this.$refs["dog-modal"].toggle()
						return response;
					});
			}
		},
		mounted() {
			this.$refs["dog-modal"].toggle();
		}
	};
</script>

<style scoped>
</style>