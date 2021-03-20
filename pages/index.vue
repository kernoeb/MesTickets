<template>
  <div
    v-dragscroll:nochilddrag
    :style="`min-height: calc(100vh - ${$vuetify.application.top}px)!important;`"
    class="d-flex flex-row pa-5"
    style="overflow-y: auto;"
  >
    <transition name="fade">
      <div v-if="lists" data-dragscroll style="display: inline-flex; height: 100%; max-height: 100%">
        <div
          v-for="(list, id, index) in lists"
          :key="id"
          :style="index === Object.keys(lists).length - 1 ? 'padding-right: 20px;' : null"
          class="mx-auto mr-3"
          style="height: 100%"
        >
          <v-card
            class="mx-auto rounded-lg"
            elevation="6"
            max-width="350"
            rounded
            style="border: 1px solid black"
            width="350"
          >
            <v-card-title class="disable-select" data-dragscroll>
              {{ list.name }}
            </v-card-title>
            <div
              :style="`max-height: calc(100vh - (${$vuetify.application.top}px + 120px))`"
              class="pa-1"
              data-dragscroll
              style="overflow-y: scroll; margin-left: 10px;"
            >
              <task-card
                v-for="task in list.cards"
                :key="task.id"
                :task="task"
                class="mb-4"
              />
            </div>
          </v-card>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import TaskCard from '~/components/TaskCard'

export default {
  name: 'Index',
  components: {
    TaskCard
  },
  data () {
    return {
      lists: null
    }
  },
  watch: {
    '$store.state.currentBoard' () {
      if (this.$store.state.currentBoard && this.$store.state.key && this.$store.state.token) {
        this.lists = null
        this.setList(this.$store.state.currentBoard.id)
        this.$store.commit('getCustomFields', { board: this.$store.state.currentBoard.id })
        this.$store.commit('getMembers', { board: this.$store.state.currentBoard.id })
      }
    }
  },
  created () {
    if (this.$store.state.key && this.$store.state.token) {
      this.setList(this.$store.state.currentBoard.id)
      this.$store.commit('getCustomFields', { board: this.$store.state.currentBoard.id })
      this.$store.commit('getMembers', { board: this.$store.state.currentBoard.id })
    }

    setInterval(() => {
      this.setList(this.$store.state.currentBoard.id)
    }, 30000)
  },
  methods: {
    async setList (board) {
      const urlPrefix = 'https://api.trello.com/1'

      try {
        const tmpLists = await this.$axios.$get(`${urlPrefix}/boards/${board}/lists?key=${this.$store.state.key}&token=${this.$store.state.token}`)

        const tmpObj = {}

        tmpLists.forEach((v) => {
          tmpObj[v.id] = { name: v.name, cards: [] }
        })

        this.$axios.$get(`${urlPrefix}/members/me/cards?customFieldItems=true&key=${this.$store.state.key}&token=${this.$store.state.token}`).then((tasks) => {
          tasks.forEach((task) => {
            if (tmpObj[task.idList]) {
              tmpObj[task.idList].cards.push(task)
            }
          })

          this.lists = tmpObj
        }).catch(() => {})
      } catch (err) {
      }
    }
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: all 1s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
  opacity: 0;
  transform: translateY(30px);
}
</style>
