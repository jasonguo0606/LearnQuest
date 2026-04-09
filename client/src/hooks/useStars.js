import { useQuery } from '@tanstack/react-query';
import { getBalance } from '../services/statsService';

export const useStars = () => {
  return useQuery({
    queryKey: ['stars', 'balance'],
    queryFn: getBalance,
    staleTime: 1000 * 30,
  });
};
