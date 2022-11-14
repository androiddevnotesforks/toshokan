import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useSheetStore } from '@/stores/sheet'
import deleteBook from '@/services/sheet/deleteBook'
import { fetch } from '@/util/gapi'
import Book from '@/model/Book'

export default function useDeleteBookMutation() {
  const sheetStore = useSheetStore()
  const sheetId = computed(() => sheetStore.sheetId)
  const queryClient = useQueryClient()

  async function mutate(book: Book) {
    return await fetch(deleteBook(sheetId.value!, book))
  }

  return useMutation(mutate, {
    onSuccess(_, book) {
      queryClient.setQueryData(['book', { bookId: book.id, sheetId }], null)

      queryClient.setQueriesData<{ books: Book[] }>(
        ['books', { sheetId }],
        (oldData) => {
          return {
            ...oldData,
            books: (oldData?.books ?? []).filter(({ id }) => id !== book.id)
          }
        }
      )
    },
    onSettled() {
      queryClient.invalidateQueries(['last-added'])
      queryClient.invalidateQueries(['latest-readings'])
      queryClient.invalidateQueries(['next-reads'])
      queryClient.invalidateQueries(['groups'])
      queryClient.invalidateQueries(['books'])
      queryClient.invalidateQueries(['authors'])
      queryClient.invalidateQueries(['book-search'])
      queryClient.invalidateQueries(['statistics'])
      queryClient.invalidateQueries(['reading-months'])
    }
  })
}
