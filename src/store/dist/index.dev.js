"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vue = _interopRequireDefault(require("vue"));

var _vuex = _interopRequireDefault(require("vuex"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var axios = require("axios");

_vue["default"].use(_vuex["default"]); // initial state


var getDefaultState = function getDefaultState() {
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
}; // set initial state


var state = getDefaultState();

var _default = new _vuex["default"].Store({
  state: state,
  getters: {
    loggedIn: function loggedIn(state) {
      return state.token !== null;
    },
    getToken: function getToken(state) {
      return state.token;
    },
    getUserProfile: function getUserProfile(state) {
      return state.userProfile;
    },
    getUserDogs: function getUserDogs(state) {
      return state.userDogs;
    },
    getUserEvents: function getUserEvents(state) {
      return state.userEvents;
    },
    getSearchResults: function getSearchResults(state) {
      return state.searchResults;
    },
    getMapboxKey: function getMapboxKey(state) {
      return state.mapboxKey;
    }
  },
  mutations: {
    retrieveToken: function retrieveToken(state, token) {
      state.token = token;
    },
    resetState: function resetState(state) {
      Object.assign(state, getDefaultState());
    },
    retrieveUserProfile: function retrieveUserProfile(state, profile) {
      state.userProfile = profile;
    },
    retrieveUserDogs: function retrieveUserDogs(state, dogs) {
      state.userDogs = dogs;
    },
    retrieveUserEvents: function retrieveUserEvents(state, events) {
      state.userEvents = events;
    },
    removeDogFromProfile: function removeDogFromProfile(state, dogID) {
      state.userDogs = state.userDogs.filter(function (x) {
        return x._id.$oid != dogID;
      });
    },
    retrieveSearchResults: function retrieveSearchResults(state, searchResults) {
      state.searchResults = searchResults;
    },
    selectEvent: function selectEvent(state, event) {
      state.selectedEvent = event;
    },
    selectUser: function selectUser(state, user) {
      state.selectedUser = user;
    },
    setSearchDistance: function setSearchDistance(state, distance) {
      state.searchParameters.distance.selected = distance;
    }
  },
  actions: {
    // log in function
    retrieveToken: function retrieveToken(context, credentials) {
      return new Promise(function (resolve, reject) {
        axios.post("https://walkies-api.herokuapp.com/api/auth/login", {
          email: credentials.email,
          password: credentials.password
        }).then(function (response) {
          var token = response.data.token; // add token to local storage

          localStorage.setItem("token", token); // add token to vuex state

          context.commit("retrieveToken", token);
          resolve(response);
        })["catch"](function (error) {
          console.log(error);
          reject(error);
        });
      });
    },
    // log out function
    destroyToken: function destroyToken(context) {
      localStorage.removeItem("token");
      context.commit("resetState");
    },
    retrieveUserProfile: function retrieveUserProfile(context) {
      if (context.getters.loggedIn) {
        axios.get("https://walkies-api.herokuapp.com/api/user", {
          headers: {
            Authorization: "Bearer " + context.getters.getToken
          }
        }).then(function (response) {
          var userProfile = JSON.parse(response.data.user);
          userProfile.events.forEach(function (event, i) {
            userProfile.events[i] = JSON.parse(event);
          });
          userProfile.dogs.forEach(function (dog, i) {
            userProfile.dogs[i] = JSON.parse(dog);
          });
          console.log(userProfile);
          context.commit("retrieveUserProfile", userProfile); // context.commit(
          //   "retrieveUserDogs",
          //   response.data.dogs.length == 0
          //     ? []
          //     : JSON.parse(response.data.dogs)
          // );
          // context.commit("retrieveUserEvents", response.data.events.sort((a ,b) => a.time.$date - b.time.$date));
        });
      }
    },
    retrieveUserDogs: function retrieveUserDogs(context) {
      if (context.getters.loggedIn) {
        axios.get("https://walkies-api.herokuapp.com/api/dogs", {
          headers: {
            Authorization: "Bearer " + context.getters.getToken
          }
        }).then(function (response) {
          context.commit("retrieveUserDogs", JSON.parse(response.data.dogs));
        });
      }
    },
    retrieveUserEvents: function retrieveUserEvents(context) {
      if (context.getters.loggedIn) {
        axios.get("https://walkies-api.herokuapp.com/api/events", {
          headers: {
            Authorization: "Bearer " + context.getters.getToken
          }
        }).then(function (response) {
          context.commit("retrieveUserEvents", JSON.parse(response.data.events));
        });
      }
    },
    removeDogFromProfile: function removeDogFromProfile(context, dogID) {
      if (context.getters.loggedIn) {
        axios["delete"]("https://walkies-api.herokuapp.com/api/dogs/".concat(dogID), {
          headers: {
            Authorization: "Bearer " + context.getters.getToken
          }
        }).then(function (response) {
          console.log(response);
          context.dispatch("retrieveUserProfile");
        });
      }
    },
    searchUsers: function searchUsers(context) {
      var userSearchResults;
      return regeneratorRuntime.async(function searchUsers$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log(context.state.searchParameters.distance.selected);
              _context.next = 3;
              return regeneratorRuntime.awrap(axios.post("https://walkies-api.herokuapp.com/api/user/search", {
                distance: context.state.searchParameters.distance.selected
              }, {
                headers: {
                  Authorization: "Bearer " + context.getters.getToken
                }
              }));

            case 3:
              userSearchResults = _context.sent;
              console.log(userSearchResults.data.users);
              userSearchResults.data.users.forEach(function (user, userIndex) {
                userSearchResults.data.users[userIndex] = JSON.parse(user);
                userSearchResults.data.users[userIndex].dogs.forEach(function (dog, dogIndex) {
                  userSearchResults.data.users[userIndex].dogs[dogIndex] = JSON.parse(dog);
                });
              });
              console.log(userSearchResults.data.users);
              context.commit("retrieveSearchResults", userSearchResults.data.users);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      });
    },
    sendMeetingInvite: function sendMeetingInvite(context, details) {
      axios.post("https://walkies-api.herokuapp.com/api/events", {
        location: details.location,
        time: details.time,
        invited: details.invited,
        length: details.length
      }, {
        headers: {
          Authorization: "Bearer " + context.getters.getToken
        }
      })["catch"](function (err) {
        return console.log("AXIOS ERROR: ", err);
      });
    },
    updateEvent: function updateEvent(context, details) {
      console.log(details);
      axios.put("https://walkies-api.herokuapp.com/api/events/".concat(details.id), {
        location: details.location,
        time: details.time,
        length: details.length,
        proposer: details.proposer,
        invited: details.invited
      }, {
        headers: {
          Authorization: "Bearer " + context.getters.getToken
        }
      }).then(context.dispatch("retrieveUserProfile"));
    },
    acceptEvent: function acceptEvent(context, id) {
      axios.put("https://walkies-api.herokuapp.com/api/events/accept/".concat(id), {}, {
        headers: {
          Authorization: "Bearer " + context.getters.getToken
        }
      }).then(context.dispatch("retrieveUserProfile"));
    },
    declineEvent: function declineEvent(context, id) {
      axios["delete"]("https://walkies-api.herokuapp.com/api/events/decline/".concat(id), {
        headers: {
          Authorization: "Bearer " + context.getters.getToken
        }
      }).then(context.dispatch("retrieveUserProfile"));
    }
  },
  modules: {}
});

exports["default"] = _default;