<template>
  <div>
    <h3>
      Hi, {{ userProfile.first_name }}. Here are some people looking for
      walkies!
    </h3>
    <b-btn @click="searchUsers" class="mb-2">Search</b-btn>
    <b-container>
      <b-row>
        <b-col cols="3" v-for="user in search.users" :key="user._id.$oid">
          <b-card>
            <template v-slot:header>
              <h4 class="mb-0">{{ user.first_name }}</h4>
            </template>
            <b-card-text>
              <p>{{ user.dogs.length }} dogs total</p>
              <div v-if="user.dogs.length > 0">
                <div v-if="user.dogs[0].$oid">
                  <div v-for="dog in search.dogs" :key="dog._id.$oid">
                    <p v-if="dog.owner.$oid == user._id.$oid">
                      {{ dog.name }}, the {{ dog.breed }}
                    </p>
                  </div>
                </div>
              </div>
              {{
                Math.round(
                  getDistanceFromLatLonInKm(
                    user.location.coordinates[1],
                    user.location.coordinates[0],
                    userProfile.location.coordinates[1],
                    userProfile.location.coordinates[0]
                  ) * 10
                ) / 10
              }}km
            </b-card-text>
            <template v-slot:footer>
              <b-btn
                variant="success"
                @click="toggleMeetupModal"
                :id="user._id.$oid"
                >Go walkies!</b-btn
              >
            </template>
          </b-card>
        </b-col>
        <b-modal ref="meetup-modal" id="meetup-modal" static>
          <template v-slot:modal-title>Go walkies!</template>
          <form>
            <b-form-group
              label="Date"
              label-for="meetup-date-input"
              invalid-feedback="Pleae choose a date."
            >
              <b-form-datepicker
                :min="minDate"
                id="meetup-date-input"
                v-model="meetupDate"
              ></b-form-datepicker>
            </b-form-group>
            <b-form-group
              label="Time"
              label-for="meetup-time-input"
              invalid-feedback="Pleae choose a time."
            >
              <b-form-timepicker
                id="meetup-time-input"
                v-model="meetupTime"
              ></b-form-timepicker>
            </b-form-group>
            <b-form-group
              label="Duration"
              label-for="meetup-duration-input"
              invalid-feedback="Duration is required"
            >
              <b-form-select
                class="text-center"
                id="meetup-duration-input"
                v-model="meetupDuration"
                required
                :options="durationOptions"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label="Location"
              required="true"
              invalid-feedback="Please select suggested location on the map"
            >
              <div id="eventMapContainer"></div>
            </b-form-group>
          </form>

          <template v-slot:modal-footer>
            <b-button @click="$bvModal.hide('meetup-modal')">Cancel</b-button>
            <b-button variant="outline-info" @click="sendMeetingInvite"
              >Request</b-button
            >
          </template>
        </b-modal>
      </b-row>
    </b-container>
  </div>
</template>

<script>
const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");

export default {
  name: "UserSearch",
  data() {
    const today = new Date();
    return {
      meetupDate: "",
      meetupTime: "",
      minDate: today,
      meetupUser: "",
      meetupLocation: {
        type: "Point",
        coordinates: []
      },
      meetupDuration: "",
      durationOptions: ["30 mins", "1 hour", "2 hours or more"]
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
    sendMeetingInvite() {
      this.$store.dispatch("sendMeetingInvite", {
        location: this.meetupLocation,
        time: `${this.meetupDate} ${this.meetupTime}`,
        invited: this.meetupUser,
        length: this.meetupDuration
      });
    },
    createEventMapbox() {
      mapboxgl.accessToken = this.mapboxKey;
      const map = new mapboxgl.Map({
        container: "eventMapContainer",
        style: "mapbox://styles/mapbox/outdoors-v11",
        center: this.userProfile.location.coordinates,
        zoom: 10,
        maxBounds: [
          [-3.606773, 48.233686],
          [3.346901, 54.707793]
        ]
      });

      map.on("load", function() {
        map.resize();
      });

      new mapboxgl.Marker({ color: "gray", class: "test" })
        .setLngLat({
          lng: this.userProfile.location.coordinates[0],
          lat: this.userProfile.location.coordinates[1]
        })
        .addTo(map);

      const invitedUser = this.search.users.filter(
        user => user._id.$oid == this.meetupUser
      )[0];

      new mapboxgl.Marker({ color: "gray", size: "small" })
        .setLngLat({
          lng: invitedUser.location.coordinates[0],
          lat: invitedUser.location.coordinates[1]
        })
        .addTo(map);

      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, "top-right");
      map.on("click", e => {
        // remove any old markers previously added by user
        const oldMarkers = document.querySelectorAll(".proposed-marker");
        if (oldMarkers) {
          oldMarkers.forEach(node => node.parentElement.removeChild(node));
        }

        // round the coordinates of the selected location on map to 4dp
        // and store them to the component data
        this.meetupLocation.coordinates = [
          Math.round(e.lngLat.lng * 10000) / 10000,
          Math.round(e.lngLat.lat * 10000) / 10000
        ];

        new mapboxgl.Marker({ color: "gold" })
          .setLngLat(e.lngLat)
          .addTo(map)
          .getElement()
          .classList.add("proposed-marker");
      });
    },
    toggleMeetupModal(e) {
      this.$refs["meetup-modal"].toggle();
      this.meetupUser = e.target.id;
      this.createEventMapbox();
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
  created() {
    this.$store.dispatch("retrieveUserProfile");
    this.$store.dispatch("searchUsers");
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#eventMapContainer {
  width: 100%;
  height: 300px;
}
</style>
