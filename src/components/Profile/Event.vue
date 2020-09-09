<template>
	<b-card :header-bg-variant="colour">
		<template v-slot:header>
			<div class="float-left">{{ otherUser.first_name }}</div>
			<div class="float-right">
				<p class="text-right m-0" :id="`popover-target-${event._id.$oid}`">
					<font-awesome-icon icon="dog" />
					{{ otherUser.dogs.length }}
				</p>
				<b-popover
					v-if="otherUser.dogs.length > 0"
					:target="`popover-target-${event._id.$oid}`"
					triggers="hover"
					placement="rightbottom"
				>
					<b-table striped :items="otherUser.dogs" :fields="dogFields"></b-table>
				</b-popover>
			</div>
		</template>
		<b-card-sub-title>
			{{
			formatDate(event.time.$date)
			}}
		</b-card-sub-title>
		<b-card-body>
			<p>
				{{
				Math.round(
				getDistanceFromLatLonInKm(
				event.location.coordinates[1],
				event.location.coordinates[0],
				userProfile.location.coordinates[1],
				userProfile.location.coordinates[0]
				) * 10
				) / 10
				}}km away
			</p>
			<a
				target="_blank"
				:href="`https://www.google.com/maps?saddr=${userProfile.location.coordinates[1]},${userProfile.location.coordinates[0]}&daddr=${event.location.coordinates[1]},${event.location.coordinates[0]}`"
			>Get directions</a>
		</b-card-body>
		<template v-slot:footer>
			<b-row>
				<b-col>
					<b-btn :variant="`outline-${colour}`" :id="event._id.$oid" @click="toggleEventModal">View Details</b-btn>
				</b-col>
			</b-row>
		</template>
	</b-card>
</template>

<script>
	const moment = require("moment");
	export default {
		data() {
			return {
				dogFields: ["name", "breed"]
			};
		},
		props: ["event"],
		computed: {
			userProfile() {
				return this.$store.state.userProfile;
			},
			otherUser() {
				return this.userProfile._id.$oid === this.event.invited._id.$oid ? this.event.proposer : this.event.invited;
			},
			colour() {
				if (this.event.status == 'accepted') {
					return 'success';
				} else if (this.event.proposer._id.$oid == this.$store.state.userProfile._id.$oid) {
					return 'info';
				}
				return 'warning';
			}
		},
		methods: {
			formatDate(date) {
				const m = new moment(date);
				return m.format("ddd, MMM Do, HH:mm A");
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
			toggleEventModal() {
				this.$store.commit('selectEvent', this.event);
				this.$emit('open-modal');
			},
		}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>