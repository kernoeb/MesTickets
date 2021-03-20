<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :overlay-opacity="0"
      app
      clipped
      disable-resize-watcher
      style="border-right: 2px solid black;z-index:40;"
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in boards"
          :key="i"
          exact
          router
          @click="setBoard(item.id,item.title)"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      clipped-left
      dense
      style="border-bottom: 1px solid black"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title><strong>Mes tickets :</strong> {{ $store.state.currentBoard.name }}</v-toolbar-title>
      <v-spacer />
      <v-icon @click="showSettingsModal = true">
        mdi-cog
      </v-icon>
    </v-app-bar>
    <v-main :class="$vuetify.theme.dark ? 'bg_dark' : 'bg'">
      <v-container class="pa-0" fluid>
        <nuxt />
      </v-container>
    </v-main>
    <v-btn
      :color="$vuetify.theme.dark ? 'black' : 'white'"
      absolute
      bottom
      fab
      large
      right
      style="bottom: 15px"
      @click="$vuetify.theme.dark = !$vuetify.theme.dark"
    >
      <v-icon>mdi-theme-light-dark</v-icon>
    </v-btn>
    <v-dialog
      v-model="showSettingsModal"
      max-width="600"
    >
      <v-card>
        <v-card-title>Configurer</v-card-title>
        <v-card-text>
          Ajoutez votre clé et votre token Atlassian
          <p><a href="https://trello.com/app-key" target="_blank">Générer une clé</a></p>
        </v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          class="pl-4 pr-4 pb-4"
        >
          <v-text-field
            v-model="key"
            :rules="[v => !!v || 'Élément requis']"
            label="Clé"
            required
            type="password"
          />
          <v-text-field
            v-model="token"
            :rules="[v => !!v || 'Élément requis']"
            label="Token"
            required
            type="password"
          />
          <v-btn
            :disabled="!valid"
            class="mr-4 mt-4"
            color="success"
            @click="validate"
          >
            Valider
          </v-btn>
          <v-btn
            class="mr-4 mt-4"
            color="warning"
            @click="deleteCookies"
          >
            Supprimer
          </v-btn>
        </v-form>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="error"
      color="error"
      right
      timeout="2000"
      top
    >
      <v-icon class="mx-auto mr-2">
        mdi-alert
      </v-icon>
      <strong>ERREUR : veuillez vérifier votre clé et votre token.</strong>
    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  middleware: 'vuetify-theme',
  data () {
    return {
      drawer: false,
      boards: [],
      showSettingsModal: false,
      valid: false,
      key: null,
      token: null,
      error: false
    }
  },
  async fetch () {
    const key = this.$cookies.get('key')
    const token = this.$cookies.get('token')

    if (key && token) {
      this.$store.commit('setCredentials', { key, token })

      if (this.$store.state.key && this.$store.state.token) {
        const urlPrefix = 'https://api.trello.com/1'

        try {
          const boards = await this.$axios.$get(`${urlPrefix}/members/me/boards?key=${this.$store.state.key}&token=${this.$store.state.token}`)
          this.boards = boards.map(v => ({ icon: 'mdi-view-dashboard', title: v.name, id: v.id }))
          this.setBoard(this.boards[0].id, this.boards[0].title)
        } catch (err) {
          this.error = true
        }
      }
    }
  },
  watch: {
    '$vuetify.theme.dark' () {
      this.$cookies.set('theme', this.$vuetify.theme.dark ? 'true' : 'false', { maxAge: 2147483646 })
    }
  },
  created () {
    this.key = this.$cookies.get('key')
    this.token = this.$cookies.get('token')
  },
  mounted () {
    try {
      this.$vuetify.theme.dark = JSON.parse(this.$cookies.get('theme'))
    } catch (e) {
      this.$vuetify.theme.dark = false
    }
  },
  methods: {
    deleteCookies () {
      try {
        this.$cookies.remove('key')
        this.$cookies.remove('token')
        setTimeout(() => {
          window.location.reload()
        }, 100)
      } catch (err) {
      }
    },
    validate () {
      this.$cookies.set('key', this.key)
      this.$cookies.set('token', this.token)
      this.$store.commit('setCredentials', { key: this.key, token: this.token })
      setTimeout(() => {
        window.location.reload()
      }, 100)
    },
    setBoard (board, name) {
      this.$store.commit('setBoard', { board, name })
    }
  }
}
</script>

<style>
.disable-select {
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}

.bg_dark {
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(35, 9, 25, 0.5)), url("/wallpaper.jpg");
  background-size: cover;
}

.bg {
  background-image: url("/wallpaper.jpg");
  background-size: cover;
}

::-webkit-scrollbar {
  width: 15px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #d6dee1;
  border-radius: 20px;
  border: 6px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #a8bbbf;
}

html, body {
  overflow: hidden;
}
</style>
