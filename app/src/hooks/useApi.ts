import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService, Card, UserStats, Achievement, ScanResponse } from '../services/api';
import toast from 'react-hot-toast';

// Custom hook for API operations
export const useApi = () => {
  const queryClient = useQueryClient();

  // Card scanning
  const useScanCard = () => {
    return useMutation(
      (file: File) => apiService.scanCard(file),
      {
        onError: (error) => {
          console.error('Scan error:', error);
          toast.error('Failed to scan card. Please try again.');
        },
      }
    );
  };

  // Get all cards
  const useCards = () => {
    return useQuery('cards', apiService.getCards, {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Failed to fetch cards:', error);
        toast.error('Failed to load your collection.');
      },
    });
  };

  // Get single card
  const useCard = (cardId: string) => {
    return useQuery(['card', cardId], () => apiService.getCard(cardId), {
      enabled: !!cardId,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Failed to fetch card:', error);
        toast.error('Failed to load card details.');
      },
    });
  };

  // Add card
  const useAddCard = () => {
    return useMutation(
      (cardData: Omit<Card, 'id' | 'dateAdded'>) => apiService.addCard(cardData),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('cards');
          queryClient.invalidateQueries('userStats');
          toast.success('Card added to your collection! 📚');
        },
        onError: (error) => {
          console.error('Failed to add card:', error);
          toast.error('Failed to add card to collection.');
        },
      }
    );
  };

  // Update card
  const useUpdateCard = () => {
    return useMutation(
      ({ cardId, cardData }: { cardId: string; cardData: Partial<Card> }) =>
        apiService.updateCard(cardId, cardData),
      {
        onSuccess: (_, { cardId }) => {
          queryClient.invalidateQueries('cards');
          queryClient.invalidateQueries(['card', cardId]);
          toast.success('Card updated successfully!');
        },
        onError: (error) => {
          console.error('Failed to update card:', error);
          toast.error('Failed to update card.');
        },
      }
    );
  };

  // Delete card
  const useDeleteCard = () => {
    return useMutation(
      (cardId: string) => apiService.deleteCard(cardId),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('cards');
          queryClient.invalidateQueries('userStats');
          toast.success('Card removed from collection.');
        },
        onError: (error) => {
          console.error('Failed to delete card:', error);
          toast.error('Failed to remove card from collection.');
        },
      }
    );
  };

  // Get user stats
  const useUserStats = () => {
    return useQuery('userStats', apiService.getUserStats, {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch user stats:', error);
      },
    });
  };

  // Get collection stats
  const useCollectionStats = () => {
    return useQuery('collectionStats', apiService.getCollectionStats, {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch collection stats:', error);
      },
    });
  };

  // Get achievements
  const useAchievements = () => {
    return useQuery('achievements', apiService.getAchievements, {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        console.error('Failed to fetch achievements:', error);
      },
    });
  };

  // Health check
  const useHealthCheck = () => {
    return useQuery('health', apiService.healthCheck, {
      refetchInterval: 30 * 1000, // Check every 30 seconds
      refetchIntervalInBackground: true,
      onError: (error) => {
        console.error('Health check failed:', error);
      },
    });
  };

  return {
    useScanCard,
    useCards,
    useCard,
    useAddCard,
    useUpdateCard,
    useDeleteCard,
    useUserStats,
    useCollectionStats,
    useAchievements,
    useHealthCheck,
  };
};

// Hook for managing local state with API integration
export const useLocalState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWithLoading = useCallback(async (operation: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    executeWithLoading,
    clearError,
  };
}; 