<template>
	<b-container>
		<b-row>
			<b-col>
				<div class="shader rounded">
					<b-jumbotron class="mt-4" bg-variant="transparent">
						<p>
							Backend technologies
							<br />Flask (restful)
							<font-awesome-icon :icon="['fab', 'python']" />
							<br />Bcrypt
							<font-awesome-icon icon="key" />
							<br />JWT
							<font-awesome-icon icon="user-secret" />
							<br />MongoDB (MongoEngine)
							<font-awesome-icon icon="database" />
							<br />Source code:
							<b-link target="_blank" href="https://github.com/JMaylor/walkies-backend">
								<font-awesome-icon :icon="['fab', 'github']" />
							</b-link>
						</p>
						<hr />
						<p>
							Frontend technologies
							<br />Vue
							<font-awesome-icon :icon="['fab', 'vuejs']" />
							<br />Axios
							<font-awesome-icon icon="server" />
							<br />Source code:
							<b-link target="_blank" href="https://github.com/JMaylor/walkies-frontend">
								<font-awesome-icon :icon="['fab', 'github']" />
							</b-link>
						</p>
						<hr />
						<p>
							Credits
							<br />Icons made by
							<b-link href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</b-link> from 
							<b-link href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</b-link>
						</p>
					</b-jumbotron>
				</div>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
	export default {
		name: "Info",
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
	* {
		text-align: center;
	}
	svg {
		color: orange;
	}
	.shader {
		background: rgba(255, 255, 255, 0.75);
	}
</style>
