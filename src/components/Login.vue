<template>
	<div>
		<!-- Nav Button -->
		<b-nav-item @click="toggleModal">Login</b-nav-item>

		<!-- Log In Modal -->
		<b-modal ref="login-modal" id="login-modal" static>
			<template v-slot:modal-title>Login to Walkies!</template>
			<b-form id="login-form" @submit="submitLoginForm">
				<!-- Email -->
				<label for="login-email-input">Email Address</label>
				<b-input
					v-model="email"
					id="login-email-input"
					class="text-center"
					:state="emailValidation"
					@focus="resetValidation"
				></b-input>
				<br />

				<!-- Password -->
				<label for="login-password-input">Password</label>
				<b-input
					v-model="password"
					id="login-password-input"
					class="text-center"
					:state="passwordValidation"
					@focus="resetValidation"
					type="password"
				></b-input>
			</b-form>

			<template v-slot:modal-footer>
				<!-- Cancel Button -->
				<b-button @click="$bvModal.hide('login-modal')">Cancel</b-button>

				<!-- Login Button -->
				<b-button
					variant="outline-info"
					type="submit"
					form="login-form"
					:disabled="formValidation"
				>Login</b-button>
			</template>
		</b-modal>
	</div>
</template>

<script>
	export default {
		name: "Login",
		data() {
			return {
				email: "",
				password: "",
				emailValidation: null,
				passwordValidation: null
			};
		},
		computed: {
			formValidation() {
				return this.email == "" || this.password == "";
			}
		},
		methods: {
			submitLoginForm(e) {
				e.preventDefault();
				this.login();
			},
			login() {
				this.$store
					.dispatch("retrieveToken", {
						email: this.email,
						password: this.password
					})
					.then(response => {
						this.$store.dispatch("retrieveUserProfile");
						return response;
					})
					.catch(error => {
						this.emailValidation = false;
						this.passwordValidation = false;
						console.log(error.response);
						alert(error.response.data.message);
					});
			},
			toggleModal() {
				this.$refs["login-modal"].toggle();
			},
			resetValidation() {
				this.emailValidation = null;
				this.passwordValidation = null;
			}
		}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
