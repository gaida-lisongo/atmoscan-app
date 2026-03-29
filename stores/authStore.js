import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper pour gérer les cookies (pour le middleware côté serveur)
const setCookie = (name, value, days = 7) => {
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }
};

const removeCookie = (name) => {
  if (typeof document !== 'undefined') {
    // Supprimer avec toutes les variantes possibles de path
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    document.cookie = `${name}=; max-age=0; path=/`;
    document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Action de connexion
      login: async (matricule, designation, password) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matricule, designation, password }),
          });

          const data = await response.json();

          if (data.success) {
            const { user, token } = data;
            
            // Stocker le token dans les cookies (pour le middleware)
            setCookie('auth-token', token, 7);
            
            // Zustand persist stockera automatiquement dans localStorage
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            return { success: true };
          } else {
            set({
              loading: false,
              error: data.message || 'Erreur de connexion',
            });
            return { success: false, error: data.message };
          }
        } catch (error) {
          const errorMessage = 'Erreur de connexion au serveur';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Action de déconnexion
      logout: async () => {
        set({ loading: true });
        
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${get().token}`,
            },
          });
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        } finally {
          // Nettoyer le cookie
          removeCookie('auth-token');
          
          // Nettoyer l'état
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          
          // Forcer le rechargement pour que le middleware redirige vers /login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      // Initialiser l'auth depuis le store persisté (plus besoin de checkAuth complexe)
      initAuth: () => {
        const state = get();
        // Si on a un token et user dans le store (localStorage), on est authentifié
        if (state.token && state.user) {
          // S'assurer que le cookie existe aussi (pour le middleware)
          setCookie('auth-token', state.token, 7);
          return true;
        }
        return false;
      },

      // Modifier le profil utilisateur
      updateProfile: async (profileData) => {
        const { user, token } = get();
        if (!user || !token) return { success: false, error: 'Non authentifié' };

        set({ loading: true, error: null });

        try {
          const response = await fetch(`/api/users?id=${user._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          });

          const data = await response.json();

          if (data.success) {
            set({
              user: { ...user, ...data.data },
              loading: false,
            });
            return { success: true };
          } else {
            set({
              loading: false,
              error: data.message || 'Erreur de mise à jour',
            });
            return { success: false, error: data.message };
          }
        } catch (error) {
          const errorMessage = 'Erreur lors de la mise à jour';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Modifier le mot de passe
      changePassword: async (currentPassword, newPassword) => {
        const { user, token } = get();
        if (!user || !token) return { success: false, error: 'Non authentifié' };

        set({ loading: true, error: null });

        try {
          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });

          const data = await response.json();

          if (data.success) {
            set({ loading: false, error: null });
            return { success: true };
          } else {
            set({
              loading: false,
              error: data.message || 'Erreur de modification du mot de passe',
            });
            return { success: false, error: data.message };
          }
        } catch (error) {
          const errorMessage = 'Erreur lors de la modification du mot de passe';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Nettoyer les erreurs
      clearError: () => set({ error: null }),

      // Obtenir les privilèges de l'utilisateur
      getUserPrivileges: () => {
        const { user } = get();
        return user?.privileges || [];
      },

      // Vérifier si l'utilisateur a un privilège spécifique
      hasPrivilege: (privilegeType) => {
        const privileges = get().getUserPrivileges();
        return privileges.some(p => p.designation === privilegeType);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;