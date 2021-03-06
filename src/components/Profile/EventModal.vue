<template>
  <b-modal ref="event-modal" @hidden="$emit('close-modal')" static>
    <template v-slot:modal-title>Walkies</template>
    <form>
      <b-form-group>
        <b-form-checkbox v-model="formEnabled" @input="resetForm">
          <span v-if="!formEnabled">Check to make changes</span>
          <span v-else>Untick to see original details</span>
        </b-form-checkbox>
      </b-form-group>
      <b-form-group
        label="Date"
        label-for="meetup-date-input"
        invalid-feedback="Pleae choose a date."
      >
        <b-form-datepicker
          :disabled="!formEnabled"
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
          :disabled="!formEnabled"
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
          :disabled="!formEnabled"
          class="text-center"
          id="meetup-duration-input"
          v-model="meetupDuration"
          :options="durationOptions"
        ></b-form-select>
      </b-form-group>
      <b-form-group
        label="Location"
        label-for="event-map"
        invalid-feedback="Please select suggested location on the map"
      >
        <div>
          <div id="event-map"></div>
          <div class="map-overlay" id="legend"></div>
        </div>
      </b-form-group>
    </form>

    <template v-slot:modal-footer>
      <b-container>
        <b-row align-h="around">
          <b-button @click="declineEvent" variant="outline-danger">{{
            event.status == "accepted" ||
            event.proposer._id.$oid == $store.state.userProfile._id.$oid
              ? "Cancel Event"
              : "Decline Invite"
          }}</b-button>
          <b-button
            @click="updateEvent"
            v-if="formEnabled"
            variant="outline-info"
            >Send request</b-button
          >
          <b-button
            @click="acceptEvent"
            v-if="
              event.status == 'pending' &&
                !formEnabled &&
                $store.state.userProfile._id.$oid == event.invited._id.$oid
            "
            variant="outline-success"
            >Accept</b-button
          >
        </b-row>
      </b-container>
    </template>
  </b-modal>
</template>
<script>
const moment = require("moment");
const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");

export default {
  props: ["event"],
  data() {
    return {
      formEnabled: false,
      meetupDate: "",
      meetupTime: "",
      meetupDuration: "",
      meetupLocation: "",
      durationOptions: ["30 mins", "1 hour", "2 hours or more"]
    };
  },
  computed: {
    otherUser() {
      return this.event.proposer._id.$oid ==
        this.$store.state.userProfile._id.$oid
        ? this.event.invited
        : this.event.proposer;
    }
  },
  methods: {
    resetForm() {
      if (this.formEnabled == false) {
        this.setModalDetails();
        this.createEventMapbox();
      }
    },
    setModalDetails() {
      const m = new moment(this.event.time.$date);
      this.meetupDate = m.format("YYYY-MM-DD");
      this.meetupTime = m.format("HH:mm:ss");
      this.meetupDuration = this.event.length;
      this.meetupLocation = {
        type: "Point",
        coordinates: []
      };
    },
    createEventMapbox() {
      mapboxgl.accessToken = this.$store.state.mapboxKey;
      const map = new mapboxgl.Map({
        container: "event-map",
        style: "mapbox://styles/mapbox/outdoors-v11",
        center: this.event.location.coordinates,
        zoom: 10
      });

      // Remove legend if it already exists
      document.getElementById("legend").innerHTML = "";

      // Create the legend
      const layers = ["You", "Other User", "Suggested"];
      const svg = [
        '<svg display="block" height="20px" width="13px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="red"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>',
        '<svg display="block" height="20px" width="13px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="blue"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>',
        '<svg display="block" height="20px" width="13px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="green"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>'
      ];
      for (let index = 0; index < layers.length; index++) {
        const layer = layers[index];
        const item = document.createElement("div");
        const value = document.createElement("span");
        const icon = document.createElement("div");
        value.innerHTML = layer;
        icon.style.cssText = "display: inline-block";
        icon.innerHTML = svg[index];
        item.appendChild(value).appendChild(icon);
        document.getElementById("legend").appendChild(item);
      }

      map.on("load", function() {
        map.resize();
      });

      new mapboxgl.Marker({ color: "red" })
        .setLngLat({
          lng: this.$store.state.userProfile.location.coordinates[0],
          lat: this.$store.state.userProfile.location.coordinates[1]
        })
        .addTo(map);

      new mapboxgl.Marker({ color: "blue" })
        .setLngLat({
          lng: this.otherUser.location.coordinates[0],
          lat: this.otherUser.location.coordinates[1]
        })
        .addTo(map);

      new mapboxgl.Marker({ color: "green" })
        .setLngLat({
          lng: this.$store.state.selectedEvent.location.coordinates[0],
          lat: this.$store.state.selectedEvent.location.coordinates[1]
        })
        .addTo(map)
        .getElement()
        .classList.add("proposed-marker");

      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, "top-right");
      map.on("click", e => {
        if (this.formEnabled == false) {
          return;
        }
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

        new mapboxgl.Marker({ color: "green" })
          .setLngLat(e.lngLat)
          .addTo(map)
          .getElement()
          .classList.add("proposed-marker");
      });
    },
    updateEvent() {
      const m = new moment(`${this.meetupDate} ${this.meetupTime}`);
      const time = m.utc().format("YYYY-MM-DD HH:mm:ss");
      this.$store.dispatch("updateEvent", {
        id: this.event._id.$oid,
        location:
          this.meetupLocation.coordinates.length == 0
            ? this.$store.state.selectedEvent.location
            : this.meetupLocation,
        time: time,
        length: this.meetupDuration,
        proposer: this.$store.state.userProfile._id.$oid,
        invited:
          this.event.proposer._id.$oid == this.$store.state.userProfile._id.$oid
            ? this.event.invited._id.$oid
            : this.event.proposer._id.$oid
      });
      this.$refs["event-modal"].toggle();
      this.$store.dispatch("retrieveUserProfile");
    },
    acceptEvent() {
      this.$store.dispatch("acceptEvent", this.event._id.$oid);
      this.$refs["event-modal"].toggle();
      this.$store.dispatch("retrieveUserProfile");
    },
    declineEvent() {
      this.$store.dispatch("declineEvent", this.event._id.$oid);
      this.$refs["event-modal"].toggle();
      this.$store.dispatch("retrieveUserProfile");
    }
  },
  mounted() {
    this.$refs["event-modal"].toggle();
    this.resetForm();
  }
};
</script>

<style scoped>
#event-map {
  width: 100%;
  height: 300px;
}

.map-overlay {
  position: absolute;
  bottom: 196px;
  left: 0;
  background: rgba(255, 255, 255, 0.8);
  margin-left: 20px;
  font-family: Arial, sans-serif;
  overflow: auto;
  border-radius: 3px;
  text-align: left;
}

#legend {
  padding: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 18px;
  margin-bottom: 40px;
}

.legend-key {
  display: inline-block;
  border-radius: 20%;
  width: 20px;
  height: 10px;
  margin-right: 5px;
}
</style>
