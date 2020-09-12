import Vue from "vue";
import Vuex from "vuex";
const axios = require("axios");

Vue.use(Vuex);

const deg2rad = deg => {
  return deg * (Math.PI / 180);
};
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 3963.2; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
};

// initial state
const getDefaultState = () => {
  return {
    token: localStorage.getItem("token") || null,
    userProfile: {},
    userDogs: [],
    userEvents: [],
    selectedEvent: {},
    selectedUser: {},
    searchParameters: {
      distance: {
        selected: 10,
        options: {
          1: "1 mile",
          5: "5 miles",
          10: "10 miles",
          20: "20 miles",
          500: "500 miles"
        }
      },
      selected: 10,
      options: [1, 5, 10, 20]
    },
    searchResults: [],
    mapboxKey: process.env.VUE_APP_MAPBOXKEY
  };
};

// set initial state
const state = getDefaultState();

export default new Vuex.Store({
  state,
  getters: {
    loggedIn(state) {
      return state.token !== null;
    },
    getToken(state) {
      return state.token;
    },
    getUserProfile(state) {
      return state.userProfile;
    },
    getUserDogs(state) {
      return state.userDogs;
    },
    getUserEvents(state) {
      return state.userEvents;
    },
    getSearchResults(state) {
      return state.searchResults;
    },
    getMapboxKey(state) {
      return state.mapboxKey;
    }
  },
  mutations: {
    retrieveToken(state, token) {
      state.token = token;
    },
    resetState(state) {
      Object.assign(state, getDefaultState());
    },
    retrieveUserProfile(state, profile) {
      state.userProfile = profile;
    },
    retrieveUserDogs(state, dogs) {
      state.userDogs = dogs;
    },
    retrieveUserEvents(state, events) {
      state.userEvents = events;
    },
    removeDogFromProfile(state, dogID) {
      state.userDogs = state.userDogs.filter(x => x._id.$oid != dogID);
    },
    retrieveSearchResults(state, searchResults) {
      state.searchResults = searchResults;
    },
    selectEvent(state, event) {
      state.selectedEvent = event;
    },
    selectUser(state, user) {
      state.selectedUser = user;
    },
    setSearchDistance(state, distance) {
      state.searchParameters.distance.selected = distance;
    }
  },
  actions: {
    // log in function
    retrieveToken(context, credentials) {
      return new Promise((resolve, reject) => {
        axios
          .post("https://walkies-api.herokuapp.com/api/auth/login", {
            email: credentials.email,
            password: credentials.password
          })
          .then(response => {
            const token = response.data.token;
            // add token to local storage
            localStorage.setItem("token", token);
            // add token to vuex state
            context.commit("retrieveToken", token);
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    // log out function
    destroyToken(context) {
      localStorage.removeItem("token");
      context.commit("resetState");
    },
    retrieveUserProfile(context) {
      if (context.getters.loggedIn) {
        axios
          .get("https://walkies-api.herokuapp.com/api/user", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken
            }
          })
          .then(response => {
            const userProfile = JSON.parse(response.data.user);
            userProfile.events.forEach((event, i) => {
              userProfile.events[i] = JSON.parse(event);
            });
            userProfile.dogs.forEach((dog, i) => {
              userProfile.dogs[i] = JSON.parse(dog);
            });
            context.commit("retrieveUserProfile", userProfile);
          });
      }
    },
    retrieveUserDogs(context) {
      if (context.getters.loggedIn) {
        axios
          .get("https://walkies-api.herokuapp.com/api/dogs", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken
            }
          })
          .then(response => {
            context.commit("retrieveUserDogs", JSON.parse(response.data.dogs));
          });
      }
    },
    retrieveUserEvents(context) {
      if (context.getters.loggedIn) {
        axios
          .get("https://walkies-api.herokuapp.com/api/events", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken
            }
          })
          .then(response => {
            context.commit(
              "retrieveUserEvents",
              JSON.parse(response.data.events)
            );
          });
      }
    },
    removeDogFromProfile(context, dogID) {
      if (context.getters.loggedIn) {
        axios
          .delete(`https://walkies-api.herokuapp.com/api/dogs/${dogID}`, {
            headers: {
              Authorization: "Bearer " + context.getters.getToken
            }
          })
          .then(context.dispatch("retrieveUserProfile"));
      }
    },
    async searchUsers(context) {
      const userSearchResults = await axios.post(
        "https://walkies-api.herokuapp.com/api/user/search",
        {
          distance: context.state.searchParameters.distance.selected
        },
        {
          headers: {
            Authorization: "Bearer " + context.getters.getToken
          }
        }
      );

      const users = userSearchResults.data.users;

      users.forEach((user, userIndex) => {
        users[userIndex] = JSON.parse(user);
        users[userIndex].dogs.forEach((dog, dogIndex) => {
          users[userIndex].dogs[dogIndex] = JSON.parse(dog);
        });
      });

      //  for each user, get the distance from the loggin in user's location and store on the object
      users.forEach(user => {
        //   calculate distance
        const distance = getDistanceFromLatLonInKm(
          user.location.coordinates[1],
          user.location.coordinates[0],
          context.state.userProfile.location.coordinates[1],
          context.state.userProfile.location.coordinates[0]
        );
        user.distance = distance;
      });

      //   sort users
      users.sort((x, y) => x.distance - y.distance);

      context.commit("retrieveSearchResults", users);
    },
    sendMeetingInvite(context, details) {
      axios
        .post(
          "https://walkies-api.herokuapp.com/api/events",
          {
            location: details.location,
            time: details.time,
            invited: details.invited,
            length: details.length
          },
          {
            headers: {
              Authorization: "Bearer " + context.getters.getToken
            }
          }
        )
        .catch(err => console.log("AXIOS ERROR: ", err));
    },
    updateEvent(context, details) {
      axios
        .put(
          `https://walkies-api.herokuapp.com/api/events/${details.id}`,
          {
            location: details.location,
            time: details.time,
            length: details.length,
            proposer: details.proposer,
            invited: details.invited
          },
          {
            headers: {
              Authorization: "Bearer " + context.getters.getToken
            }
          }
        )
        .then(context.dispatch("retrieveUserProfile"));
    },
    acceptEvent(context, id) {
      axios
        .put(
          `https://walkies-api.herokuapp.com/api/events/accept/${id}`,
          {},
          {
            headers: {
              Authorization: "Bearer " + context.getters.getToken
            }
          }
        )
        .then(context.dispatch("retrieveUserProfile"));
    },
    declineEvent(context, id) {
      axios
        .delete(`https://walkies-api.herokuapp.com/api/events/decline/${id}`, {
          headers: {
            Authorization: "Bearer " + context.getters.getToken
          }
        })
        .then(context.dispatch("retrieveUserProfile"));
    }
  },
  modules: {}
});
