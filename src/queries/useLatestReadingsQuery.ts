import { computed } from 'vue'
import { useQuery, type UseQueryOptions } from 'vue-query'

import getLatestReadings from '@/services/sheet/getLatestReadings'
import { useSheetStore } from '@/stores/sheet'
import { fetch } from '@/util/gapi'

export default function useLatestReadingsQuery({ enabled }: UseQueryOptions) {
  const sheetStore = useSheetStore()
  const sheetId = computed(() => sheetStore.sheetId)

  async function fetcher() {
    return await fetch(getLatestReadings(sheetId.value!, { limit: 6 }))
  }

  return useQuery('latest-readings', fetcher, { enabled })
}