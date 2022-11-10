import { useMutation, useQueryClient } from 'vue-query'

import { useCollectionStore } from '@/stores/collection'
import { useSheetStore } from '@/stores/sheet'
import updateBook from '@/services/sheet/updateBook'
import { fetch } from '@/util/gapi'
import Book from '@/model/Book'

export default function useEditBookMutation() {
  const collectionStore = useCollectionStore()
  const sheetStore = useSheetStore()
  const queryClient = useQueryClient()

  async function mutate(book: Book) {
    return await fetch(updateBook(sheetStore.sheetId!, book))
  }

  return useMutation(mutate, {
    onSuccess(_, book) {
      const groups = collectionStore.filters.groups

      if (!groups.includes(book.group!) && groups.length > 0) {
        collectionStore.updateGroups(groups.concat(book.group!))
      }

      queryClient.setQueriesData<{ books: Book[] }>('books', (oldData) => {
        return {
          ...oldData,
          books: (oldData?.books ?? []).map((oldBook) => {
            return oldBook.id === book.id ? book : oldBook
          })
        }
      })
      queryClient.setQueryData(['book', book.id], book)
    },
    onSettled() {
      queryClient.invalidateQueries('last-added')
      queryClient.invalidateQueries('latest-readings')
      queryClient.invalidateQueries('next-reads')
      queryClient.invalidateQueries('groups')
      queryClient.invalidateQueries('books')
      queryClient.invalidateQueries('authors')
      queryClient.invalidateQueries('book-search')
      queryClient.invalidateQueries('statistics')
    }
  })
}