export const state = () => ({
    credentials: null,
   })
    
export const mutations = {
    credentials(state, data) {
        state.credentials = data
    },
    destroy(state) {
        state.credentials = null;
    }
}

export const actions = {
    actionSetCredentials({commit}, credentials) {
        commit('credentials', credentials)
    },
    actionDestroyCredentials({commit}) {
        commit('destroy')
    },
}
