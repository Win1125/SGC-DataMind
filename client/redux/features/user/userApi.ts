import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateAvatar: builder.mutation({
      query: (avatar) => ({
        url: 'update-avatar',
        methos: 'PUT',
        body:{avatar},
        credentials: 'include' as const,
      })
    })
  })
})

export const { useUpdateAvatarMutation } = userApi;