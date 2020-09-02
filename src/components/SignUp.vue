<template>
  <div>
    <b-nav-item @click="toggleModal">Register</b-nav-item>
    <b-modal ref="sign-up-modal" id="sign-up-modal" static>
      <template v-slot:modal-title>Register for Walkies!</template>
      <form>
        <b-form-group
          label="Email Address"
          label-for="email-input"
          invalid-feedback="Email is required"
        >
          <b-form-input
            class="text-center"
            id="email-input"
            v-model="email"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="First Name"
          label-for="first-name-input"
          invalid-feedback="Name is required"
        >
          <b-form-input
            class="text-center"
            id="first-name-input"
            v-model="first_name"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Surname"
          label-for="surname-input"
          invalid-feedback="Name is required"
        >
          <b-form-input
            class="text-center"
            id="surname-input"
            v-model="last_name"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Password"
          label-for="password-input"
          invalid-feedback="Password is required"
        >
          <b-form-input
            class="text-center"
            id="password-input"
            v-model="password"
            required
            type="password"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Location"
          required="true"
          invalid-feedback="Please select your location on the map"
        >
          <div id="mapContainer"></div>
        </b-form-group>
      </form>

      <template v-slot:modal-footer>
        <b-button @click="$bvModal.hide('sign-up-modal')">Cancel</b-button>
        <b-button variant="outline-primary" @click="createNewUser"
          >Register</b-button
        >
      </template>
    </b-modal>
  </div>
</template>

<script>
const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
const axios = require("axios");

export default {
  name: "SignUp",
  data() {
    return {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      location: {
        type: "Point",
        coordinates: []
      }
    };
  },
  computed: {
    mapboxKey() {
      return this.$store.getters.getMapboxKey;
    }
  },
  methods: {
    createNewUser() {
      axios
        .post("https://walkies-api.herokuapp.com/api/auth/signup", {
          email: this.email,
          password: this.password,
          first_name: this.first_name,
          last_name: this.last_name,
          location: this.location
        })
        .then(response => {
          console.log(response);
          this.$bvModal.hide("sign-up-modal");
          this.$store.dispatch("retrieveToken", {
            email: this.email,
            password: this.password
          });
        })
        .catch(error => console.log(error));
      // add catch to re-prompt form
    },
    createSignUpMaxBox() {
      mapboxgl.accessToken = this.mapboxKey;
      const map = new mapboxgl.Map({
        container: "mapContainer",
        style: "mapbox://styles/mapbox/outdoors-v11",
        center: [-0.496934, 51.437032],
        zoom: 10,
        maxBounds: [
          [-3.606773, 48.233686],
          [3.346901, 54.707793]
        ]
      });

      map.on("load", function() {
        map.resize();
      });

      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, "top-right");
      map.on("click", e => {
        this.location.coordinates = [
          Math.round(e.lngLat.lng * 10000) / 10000,
          Math.round(e.lngLat.lat * 10000) / 10000
        ];
        const oldMarker = document.querySelector(".mapboxgl-marker");
        if (oldMarker) {
          oldMarker.parentElement.removeChild(oldMarker);
        }
        const marker = new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map);
        return marker;
      });
    },
    toggleModal() {
      this.$refs["sign-up-modal"].toggle();
      this.createSignUpMaxBox();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#mapContainer {
  width: 100%;
  height: 300px;
}
</style>
