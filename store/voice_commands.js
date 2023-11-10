export const state = () => ({ 
    tag: null,
    response_text: ""
})

export const mutations = {
    changeTag(state, tag) {
        state.tag = tag
    },
    changeResponse(state, response_text) {
        state.response_text = response_text
    },
    destroy(state) {
        state.tag = null
        state.response_text = ""
    }
}

export const actions = { 
    actionSetResponseText({ commit }, response_text) {
        commit('changeResponse', response_text)
    },
    actionSetTag({ commit }, tag) {
        commit('changeTag', tag)
    },
    actionDestroy({ commit }) {
        commit('destroy')
    }
}
