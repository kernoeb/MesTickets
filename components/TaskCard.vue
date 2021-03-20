<template>
  <v-card
    :color="$vuetify.theme.dark ? '#424242' : '#e5e3e3'"
    class="mx-auto"
    flat
    style="border: 1px solid #b1b1b1"
  >
    <v-icon color="#b1b1b1" left style="left: 91%; z-index: 20; position: absolute;" @click="openLink(task.url)">
      mdi-link
    </v-icon>
    <v-img
      v-if="img"
      :src="img.url"
      contain
    >
      <div class="fill-height bottom-gradient" />
    </v-img>
    <v-card-text class="font-weight-bold" style="cursor: pointer" @click="reveal = !reveal">
      <p class="text--primary disable-select mb-0">
        <strong>{{ task.name }}</strong>
      </p>
      <div class="mt-3">
        <v-chip
          v-for="customField in task.customFieldItems"
          :key="customField.id"
          :color="betterColor(getCustomField(customField).color)"
          class="mr-1 mb-1"
          dark
          small
        >
          <span :class="!getCustomField(customField).color && 'font-italic'">{{
            getCustomField(customField).type
          }}</span>{{ getCustomField(customField).text }}
        </v-chip>
      </div>
      <div class="mt-2 mr-n1 d-flex justify-end" style="margin-bottom: -5px">
        <v-avatar
          v-for="member in task.idMembers"
          :key="`${task.id}_members_${member}`"
          :color="$store.state.members[member] && $store.state.members[member].member && $store.state.members[member].member.avatarHash ? null : 'red'"
          class="ml-1"
          size="29"
        >
          <img
            v-if="$store.state.members[member] && $store.state.members[member].member && $store.state.members[member].member.avatarHash"
            :alt="$store.state.members[member].fullName"
            :src="`https://trello-members.s3.amazonaws.com/${$store.state.members[member].idMember}/${$store.state.members[member].member.avatarHash}/50.png`"
          >
          <span
            v-else-if="$store.state.members[member] && $store.state.members[member].member"
            class="white--text"
          >{{ $store.state.members[member].member.initials }}</span>
        </v-avatar>
      </div>
    </v-card-text>

    <v-expand-transition>
      <v-card
        v-show="reveal"
        :color="$vuetify.theme.dark ? '#424242' : '#F8F8F8'"
        class="transition-fast-in-fast-out"
        flat
        max-height="400"
      >
        <v-card-text class="pb-3">
          <client-only>
            <p
              v-if="task.desc.trim().length"
              style="max-height: 380px; overflow-y: auto"
              v-html="$md.render(task.desc)"
            />
            <p v-else>
              Aucune description
            </p>
          </client-only>
        </v-card-text>
      </v-card>
    </v-expand-transition>
  </v-card>
</template>

<script>
export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      default: () => {
      }
    }
  },
  data () {
    return {
      img: null,
      reveal: false
    }
  },
  created () {
    const urlPrefix = 'https://api.trello.com/1'

    if (this.task.id && this.task.cover.idAttachment && this.$store.state.key && this.$store.state.token) {
      this.$axios.$get(`${urlPrefix}/cards/${this.task.id}/attachments/${this.task.cover.idAttachment}?key=${this.$store.state.key}&token=${this.$store.state.token}`).then((v) => {
        this.img = v
      }).catch(() => {
      })
    }
  },
  methods: {
    openLink (link) {
      window.open(link)
    },
    betterColor (color) {
      if (color === 'black') {
        return 'blue'
      } else if (color === 'yellow') {
        return '#F57F17'
      }
      return color
    },
    getCustomField (customField) {
      if (this.$store.state.customFields && this.$store.state.customFields[customField.idCustomField]) {
        const tmp = this.$store.state.customFields[customField.idCustomField]
        const opts = tmp && tmp.options && tmp.options.find(v => customField.idValue === v.id)
        return {
          type: tmp && tmp.name,
          color: opts && opts.color,
          text: opts && opts?.value?.text ? ' : ' + opts.value.text : ''
        }
      }
    }
  }
}
</script>

<style scoped>
.bottom-gradient {
  background-image: linear-gradient(to top, rgba(10, 10, 0, 0.3) 0%, transparent 200px);
}
</style>
