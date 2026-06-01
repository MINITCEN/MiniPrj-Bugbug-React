import { useQuery } from '@tanstack/react-query'
import { fetchMosquitoSummary } from '../api/mosquitoApi'

export default function useRegionSummary(regionId) {
  return useQuery({
    queryKey: ['mosquitoSummary', regionId],
    queryFn: () => fetchMosquitoSummary(regionId),
    enabled: regionId != null,
    staleTime: 1000 * 60 * 10,
  })
}
