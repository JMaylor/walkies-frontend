<template>
  <b-modal ref="meetup-modal" @hidden="$emit('close-modal')" static>
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
      <b-button @click="$refs['meetup-modal'].toggle()">Cancel</b-button>
      <b-button variant="outline-info" @click="sendMeetingInvite"
        >Request</b-button
      >
    </template>
  </b-modal>
</template>

<script>
const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
const moment = require("moment");

export default {
  data() {
    const m = new moment();
    const tomorrow = new moment().add(1, "d");

    return {
      meetupDate: tomorrow.format("YYYY-MM-DD"),
      meetupTime: "09:00:00",
      minDate: m._d,
      meetupLocation: {
        type: "Point",
        coordinates: []
      },
      meetupDuration: "",
      durationOptions: ["30 mins", "1 hour", "2 hours or more"]
    };
  },
  methods: {
    sendMeetingInvite() {
      const m = new moment(`${this.meetupDate} ${this.meetupTime}`);
      const time = m.utc().format("YYYY-MM-DD HH:mm:ss");
      this.$store.dispatch("sendMeetingInvite", {
        location: this.meetupLocation,
        time: time,
        invited: this.meetupUser._id.$oid,
        length: this.meetupDuration
      });
      this.$refs["meetup-modal"].toggle();
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

      new mapboxgl.Marker({ color: "gray", size: "small" })
        .setLngLat({
          lng: this.$store.state.selectedUser.location.coordinates[0],
          lat: this.$store.state.selectedUser.location.coordinates[1]
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
    }
  },
  computed: {
    meetupUser() {
      return this.$store.state.selectedUser;
    },
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
  mounted() {
    this.$refs["meetup-modal"].toggle();
    this.createEventMapbox();
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
