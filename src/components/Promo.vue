<template>
	<b-container>
		<b-row align-h="center">
			<b-col cols="10">
				<b-jumbotron class="mt-4" border-variant="secondary">
					<template v-slot:header>
						Walkies<br>
						<b-img src="mstile-70x70.png"></b-img>
					</template>

					<template
						v-slot:lead
					>I know you <em>love</em> taking your human out for a walk, just the two of you. Occasionally it's a good idea to let them socialise with others so they can learn to play nicely. Sign up today to find some local canine friends to chat about the weather to, while your humans play.</template>

					<hr class="my-4" />

					<p class="mb-0">
						Register or Sign-up using the links at the top of the page to get started!
					</p>
				</b-jumbotron>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
	export default {
		name: "Promo",
		components: {},
		data() {
			return {};
		},
		computed: {},
		methods: {}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
