import Vue from "vue";
import Vuex from "vuex";
const axios = require("axios");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("token") || null,
    userProfile: {},
    userDogs: [],
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
    removeDogFromProfile(state, dogID) {
      state.userDogs = state.userDogs.filter((x) => x._id.$oid != dogID);
    },
    retrieveSearchResults(state, searchResults) {
      state.searchResults = searchResults;
    },
  },
  actions: {
    // log in function
    retrieveToken(context, credentials) {
      return new Promise((resolve, reject) => {
        axios
          .post("http://localhost:5000/api/auth/login", {
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
        // return new Promise((resolve, reject) => {
        //   axios
        //     .post("http://localhost:5000/api/auth/logout", {
        //       token: context.getters.getToken,
        //     })
        //     .then((response) => {
        localStorage.removeItem("token");
        context.commit("destroyToken");
        //   resolve(response);
        // })
        // .catch((error) => {
        //   console.log(error);
        //   reject(error);
        // });
        // });
      }
    },
    retrieveUserProfile(context) {
      if (context.getters.loggedIn) {
        axios
          .get("http://localhost:5000/api/user", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
          })
          .then((response) => {
            context.commit(
              "retrieveUserProfile",
              JSON.parse(response.data.user)
            );
          });
      }
    },
    retrieveUserDogs(context) {
      if (context.getters.loggedIn) {
        axios
          .get("http://localhost:5000/api/dogs", {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
          })
          .then((response) => {
            context.commit("retrieveUserDogs", JSON.parse(response.data.dogs));
          });
      }
    },
    removeDogFromProfile(context, dogID) {
      if (context.getters.loggedIn) {
        axios
          .delete(`http://localhost:5000/api/dogs/${dogID}`, {
            headers: {
              Authorization: "Bearer " + context.getters.getToken,
            },
          })
          .then(context.commit("removeDogFromProfile", dogID));
      }
    },
    async searchUsers(context) {
      console.log("searching for other users");
      const userSearchResults = await axios.get(
        "http://localhost:5000/api/user/search",
        {
          headers: {
            Authorization: "Bearer " + context.getters.getToken,
          },
        }
      );
      console.log(userSearchResults.data.users);
      const usersFound = await JSON.parse(userSearchResults.data.users);
      console.log(usersFound);

      await usersFound.forEach(async (user) => {
        const allDogDetails = await Promise.all(
          user.dogs.map((dog) =>
            axios.get(`http://localhost:5000/api/dogs/${dog.$oid}`, {
              headers: {
                Authorization: "Bearer " + context.getters.getToken,
              },
            })
          )
        );
        user.dogs = allDogDetails.map((dog) => dog.data);
      });

      context.commit("retrieveSearchResults", usersFound);

      // usersFound.forEach((user) => {
      //     Promise.all(
      //       user.dogs.map((dog) =>
      //         axios.get(`http://localhost:5000/api/dogs/${dog.$oid}`, {
      //           headers: {
      //             Authorization: "Bearer " + context.getters.getToken,
      //           },
      //         })
      //       )
      //     ).then((results) => {
      //       user.dogDetails = [];
      //       results.forEach((result) => {
      //         console.log(result.data);
      //         user.dogDetails.push(result.data);
      //       });
      //     });
      //   });
      //   return userData;
      // })
      // .then((data) => context.commit("retrieveSearchResults", data));
    },
  },
  modules: {},
});
