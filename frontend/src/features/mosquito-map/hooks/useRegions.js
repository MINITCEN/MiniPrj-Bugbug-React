import { useQuery } from '@tanstack/react-query'
import { fetchMosquitoRegions } from '../api/mosquitoApi'

export default function useRegions() {
  return useQuery({
    queryKey: ['mosquitoRegions'],
    queryFn: fetchMosquitoRegions,
    staleTime: 1000 * 60 * 10,
  })
}
