import Vue from "vue";
import Vuex from "vuex";
const axios = require("axios");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("token") || null,
    userProfile: {},
    userDogs: [],
    userEvents: [],
    selectedEvent: {},
    searchResults: [],
    mapboxKey: process.env.VUE_APP_MAPBOXKEY,
  },
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
    },
  },
  mutations: {
    retrieveToken(state, token) {
      state.token = token;
    },
    destroyToken(state) {
      state.token = null;
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
      state.userDogs = state.userDogs.filter((x) => x._id.$oid != dogID);
    },
    retrieveSearchResults(state, searchResults) {
      state.searchResults = searchResults;
    },
    selectEvent(state, event) {
      state.selectedEvent = event;
    },
  },
  actions: {
    // log in function
    retrieveToken(context, credentials) {
      return new Promise((resolve, reject) => {
        axios
          .post("https://walkies-api.herokuapp.com/api/auth/login", {
            email: credentials.email,
            password: credentials.password,
          })
          .then((response) => {
            const token = response.data.token;
            // add token to local storage
            localStorage.setItem("token", token);
            // add token to vuex state
            context.commit("retrieveToken", token);
            resolve(response);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      });
    },

    // log out function
    destroyToken(context) {
      if (context.getters.loggedIn) {
        localStorage.removeItem("token");
        context.commit("destroyToken");
      }
    },
    retrieveUserProfile(context) {
      if (context.getters.loggedIn) {
        axios
          .get("https://walkies-api.herokuapp.com/api/user", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
          })
          .then((response) => {
            const userProfile = JSON.parse(response.data.user);
            userProfile.events.forEach((event, i) => {
              userProfile.events[i] = JSON.parse(event);
            });
            userProfile.dogs.forEach((dog, i) => {
              userProfile.dogs[i] = JSON.parse(dog);
            });
            console.log(userProfile);
            context.commit("retrieveUserProfile", userProfile);
            // context.commit(
            //   "retrieveUserDogs",
            //   response.data.dogs.length == 0
            //     ? []
            //     : JSON.parse(response.data.dogs)
            // );
            // context.commit("retrieveUserEvents", response.data.events.sort((a ,b) => a.time.$date - b.time.$date));
          });
      }
    },
    retrieveUserDogs(context) {
      if (context.getters.loggedIn) {
        axios
          .get("https://walkies-api.herokuapp.com/api/dogs", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
          })
          .then((response) => {
            context.commit("retrieveUserDogs", JSON.parse(response.data.dogs));
          });
      }
    },
    retrieveUserEvents(context) {
      if (context.getters.loggedIn) {
        axios
          .get("https://walkies-api.herokuapp.com/api/events", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
          })
          .then((response) => {
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
              Authorization: "Bearer " + context.getters.getToken,
            },
          })
          .then((response) => {
            console.log(response);
            context.dispatch("retrieveUserProfile");
          });
      }
    },
    async searchUsers(context) {
      const userSearchResults = await axios.get(
        "https://walkies-api.herokuapp.com/api/user/search",
        {
          headers: {
            Authorization: "Bearer " + context.getters.getToken,
          },
        }
      );
      console.log(userSearchResults.data.users);

      userSearchResults.data.users.forEach((user, userIndex) => {
        userSearchResults.data.users[userIndex] = JSON.parse(user);
        userSearchResults.data.users[userIndex].dogs.forEach(
          (dog, dogIndex) => {
            userSearchResults.data.users[userIndex].dogs[dogIndex] = JSON.parse(
              dog
            );
          }
        );
      });
      console.log(userSearchResults.data.users);

      context.commit("retrieveSearchResults", userSearchResults.data.users);
    },
    sendMeetingInvite(context, details) {
      axios
        .post(
          "https://walkies-api.herokuapp.com/api/events",
          {
            location: details.location,
            time: details.time,
            invited: details.invited,
            length: details.length,
          },
          {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
          }
        )
        .catch((err) => console.log("AXIOS ERROR: ", err));
    },
    updateEvent(context, details) {
      console.log(details);
      axios
        .put(
          `https://walkies-api.herokuapp.com/api/events/${details.id}`,
          {
            location: details.location,
            time: details.time,
            length: details.length,
            proposer: details.proposer,
            invited: details.invited,
          },
          {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
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
              Authorization: "Bearer " + context.getters.getToken,
            },
          }
        )
        .then(context.dispatch("retrieveUserProfile"));
    },
    declineEvent(context, id) {
      axios
        .delete(`https://walkies-api.herokuapp.com/api/events/decline/${id}`, {
          headers: {
            Authorization: "Bearer " + context.getters.getToken,
          },
        })
        .then(context.dispatch("retrieveUserProfile"));
    },
  },
  modules: {},
});
