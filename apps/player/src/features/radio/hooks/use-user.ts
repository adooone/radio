import { useUserList } from './use-user-list';
import type { UserWithStatus } from './use-user-list';

/**
 * Hook to get a specific user's data from the user list
 * @param nickname - The nickname of the user to find
 * @returns UserWithStatus object if found, undefined otherwise
 */
export const useUser = (nickname: string): UserWithStatus | undefined => {
  const users = useUserList();
  return users.find((user) => user.nickname === nickname);
};
