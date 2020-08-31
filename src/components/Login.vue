<template>
  <div>
    <b-nav-item @click="toggleModal">Login</b-nav-item>
    <b-modal ref="login-modal" id="login-modal" static>
      <template v-slot:modal-title>Login to Walkies!</template>
      <form>
        <b-form-group
          label="Email Address"
          label-for="login-email-input"
          invalid-feedback="Email is required"
        >
          <b-form-input
            class="text-center"
            id="login-email-input"
            v-model="email"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Password"
          label-for="login-password-input"
          invalid-feedback="Password is required"
        >
          <b-form-input
            class="text-center"
            id="login-password-input"
            v-model="password"
            required
            type="password"
          ></b-form-input>
        </b-form-group>
      </form>

      <template v-slot:modal-footer>
        <b-button @click="$bvModal.hide('login-modal')">Cancel</b-button>
        <b-button variant="outline-primary" @click="login">Login</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    login() {
      console.log("testing");
      this.$store
        .dispatch("retrieveToken", {
          email: this.email,
          password: this.password
        })
        .then(response => {
          this.$store.dispatch("retrieveUserProfile");
          return response;
        });
    },
    toggleModal() {
      this.$refs["login-modal"].toggle();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
