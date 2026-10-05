import { useAuthStore } from '@/stores/auth-store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../auth-api';

export const useLogin = () => {
  const { login, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      login(data.token, data.account);
    },
    onError: () => {
      setLoading(false);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
    },
  });
};
