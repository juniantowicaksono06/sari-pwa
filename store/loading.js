export const state = () => ({ 
    isLoading: true
})

export const mutations = {
    showLoading(state) {
        state.isLoading = true
    },
    hideLoading(state) {
        state.isLoading = false
    }
}

export const actions = { 
    actionShowLoading({commit}) {
        commit('showLoading')
    },
    actionHideLoading({commit}) {
        commit('hideLoading')
    }
}
