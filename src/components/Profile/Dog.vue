<template>
	<b-card header-bg-variant="secondary" header-text-variant="white">
		<template v-slot:header>{{ dog.name }}</template>
		<b-card-sub-title>{{ formatDate(dog.date_of_birth) }}</b-card-sub-title>
		<b-card-body>{{ dog.breed }}</b-card-body>
		<template v-slot:footer>
			<b-button @click="toggleRemoveDogModal" :id="dog._id.$oid" variant="outline-danger">Remove</b-button>
		</template>
	</b-card>
</template>

<script>
	const moment = require("moment");
	const swal = require("sweetalert");

	export default {
		data() {
			return {};
		},
		props: ["dog"],
		computed: {},
		methods: {
			formatDate(date) {
				const m = new moment(date);
				return m.format("ddd, MMM Do, HH:mm A");
			},
			toggleRemoveDogModal(e) {
				swal({
					title: "Are you sure you want to remove this pupper?",
					icon: "warning",
					buttons: true,
					dangerMode: true
				})
					.then(value => {
						if (value) {
							this.$store.dispatch(
									"removeDogFromProfile",
									e.target.id
								).then(swal("Bye bye pupper!", {
								icon: "success"
							}))
						}
					})
					.catch(err => err);
			}
		}
	};
</script>