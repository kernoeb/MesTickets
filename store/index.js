export const state = () => ({
  currentBoard: {},
  key: null,
  token: null,
  customFields: {},
  members: {}
})

export const mutations = {
  setBoard (state, { board, name }) {
    state.currentBoard = { id: board, name }
  },
  setCredentials (state, { key, token }) {
    state.key = key
    state.token = token
  },
  getCustomFields (state, { board }) {
    const urlPrefix = 'https://api.trello.com/1'
    this.$axios.$get(`${urlPrefix}/boards/${board}/customFields?key=${state.key}&token=${state.token}`).then((res) => {
      res.forEach((cF) => {
        if (!state.customFields[cF.id]) {
          state.customFields[cF.id] = cF
        }
      })
    })
  },
  getMembers (state, { board }) {
    const urlPrefix = 'https://api.trello.com/1'
    this.$axios.$get(`${urlPrefix}/boards/${board}/memberships?member=true&key=${state.key}&token=${state.token}`).then((res) => {
      res.forEach((member) => {
        if (!state.members[member.idMember]) {
          state.members[member.idMember] = member
        }
      })
    })
  }
}
