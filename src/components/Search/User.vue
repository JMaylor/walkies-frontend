<template>
	<b-card header-bg-variant="info">
		<template v-slot:header>
			<div class="float-left">{{ user.first_name }}</div>
			<div class="float-right">
				<p class="text-right m-0" :id="`popover-target-${user._id.$oid}`">
					<font-awesome-icon icon="dog" />
					{{ user.dogs.length }}
				</p>
				<b-popover :target="`popover-target-${user._id.$oid}`" triggers="hover" placement="rightbottom">
					<b-table striped :items="user.dogs" :fields="dogFields"></b-table>
				</b-popover>
			</div>
		</template>
		<b-card-text>
			Lives
			{{
			Math.round(
			getDistanceFromLatLonInKm(
			user.location.coordinates[1],
			user.location.coordinates[0],
			userProfile.location.coordinates[1],
			userProfile.location.coordinates[0]
			) * 10
			) / 10
			}}km away from you
		</b-card-text>
		<template v-slot:footer>
			<b-btn variant="success" @click="toggleMeetupModal" :id="user._id.$oid">Go walkies!</b-btn>
		</template>
	</b-card>
</template>

<script>
	export default {
		props: ['user'],
		data() {
			return {
				dogFields: ["name", "breed"]
			};
		},
		methods: {
			searchUsers() {
				this.$store.dispatch("searchUsers");
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
			toggleMeetupModal() {
				this.$store.commit('selectUser', this.user);
				this.$emit('open-modal');
			}
		},
		computed: {
			userProfile() {
				return this.$store.getters.getUserProfile;
			},
			search() {
				return this.$store.getters.getSearchResults;
			},
			mapboxKey() {
				return this.$store.getters.getMapboxKey;
			}
		},
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	#eventMapContainer {
		width: 100%;
		height: 300px;
	}
</style>
