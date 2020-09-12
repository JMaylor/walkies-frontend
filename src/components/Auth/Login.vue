<template>
  <b-modal ref="login-modal" @hidden="$emit('close-modal')">
    <template v-slot:modal-title>Login to Walkies!</template>
    <b-form id="login-form" @submit="submitLoginForm">
      <!-- Email -->
      <label for="login-email-input">Email Address</label>
      <b-input
        v-model="email"
        id="login-email-input"
        :state="emailValidation"
        @focus="resetValidation"
      ></b-input>
      <br />

      <!-- Password -->
      <label for="login-password-input">Password</label>
      <b-input
        v-model="password"
        id="login-password-input"
        :state="passwordValidation"
        @focus="resetValidation"
        type="password"
      ></b-input>
    </b-form>

    <template v-slot:modal-footer>
      <!-- Cancel Button -->
      <b-button @click="$refs['login-modal'].toggle()">Cancel</b-button>

      <!-- Login Button -->
      <b-button
        variant="outline-info"
        type="submit"
        form="login-form"
        :disabled="formValidation"
        >Login</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import swal from "sweetalert";
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      emailValidation: null,
      passwordValidation: null
    };
  },
  computed: {
    formValidation() {
      return this.email == "" || this.password == "";
    }
  },
  methods: {
    submitLoginForm(e) {
      e.preventDefault();
      this.login();
    },
    login() {
      this.$store
        .dispatch("retrieveToken", {
          email: this.email,
          password: this.password
        })
        .then(response => {
          swal("Welcome back!", "Login successful", "success");
          this.toggleModal();
          this.$router.push({ name: "Home" });
          return response;
        })
        .catch(error => {
          this.emailValidation = false;
          this.passwordValidation = false;
          swal(error.response.data.message, "", "error");
        });
    },
    toggleModal() {
      this.$refs["login-modal"].toggle();
    },
    resetValidation() {
      this.emailValidation = null;
      this.passwordValidation = null;
    }
  },
  mounted() {
    this.toggleModal();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
