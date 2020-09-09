<template>
	<b-container>
		<b-row>
			<b-col>
				<div class="shader rounded">
					<b-jumbotron class="mt-4" bg-variant="transparent">
						<template v-slot:header>
							<span class="main-branding">Walkies</span>
							<br />
							<b-img src="mstile-70x70.png"></b-img>
						</template>

						<template
							v-slot:lead
						>Love your dog? So do we. That's why we want them to get the most out of their walks. Meet other likeminded people in your area and take your dogs for a walk together! Walkies, free forever.</template>

						<hr class="my-4" />

						<SignUp v-if="signUpModalVisible" v-on:close-modal="signUpModalVisible=false" />
						<b-button
							@click="signUpModalVisible=true"
							variant="info"
							class="m-3"
						>Click here to get started!</b-button>
						<br />

						<Login v-if="loginModalVisible" v-on:close-modal="loginModalVisible=false" />Already have an account?
						<br />
						<b-button @click="loginModalVisible=true" variant="success" class="m-3">Login</b-button>
					</b-jumbotron>
				</div>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
	import Login from "./Auth/Login";
	import SignUp from "./Auth/SignUp";
	export default {
		name: "Promo",
		components: {
			Login,
			SignUp
		},
		data() {
			return {
				loginModalVisible: false,
				signUpModalVisible: false
			};
		}
	};
</script>

<style scoped>
	.shader {
		background: rgba(255, 255, 255, 0.75);
	}

	* {
		text-align: center;
	}
</style>