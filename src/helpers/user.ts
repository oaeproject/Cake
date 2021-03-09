export function userAPI() {
  return {
    getMe: async () => {
      const response = await fetch('/api/me');
      const data = await response.json();

      return data;
    },
  };
}
