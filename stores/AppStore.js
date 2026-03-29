import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useAppStore = create(
  devtools(
    (set, get) => ({
      // État initial
      etudiants: [],
      agents: [],
      charges: [],
      loading: {
        etudiants: false,
        agents: false,
        charges: false,
        global: false
      },
      error: null,

      // Actions pour les étudiants
      fetchEtudiants: async () => {
        set(state => ({ 
          loading: { ...state.loading, etudiants: true, global: true },
          error: null 
        }));
        
        try {
          const response = await fetch('/api/etudiants');
          const data = await response.json();
          
          if (data.success) {
            set(state => ({ 
              etudiants: data.data,
              loading: { ...state.loading, etudiants: false, global: false }
            }));
          } else {
            set(state => ({ 
              error: data.error || 'Erreur lors de la récupération des étudiants',
              loading: { ...state.loading, etudiants: false, global: false }
            }));
          }
        } catch (error) {
          console.error('Erreur fetchEtudiants:', error);
          set(state => ({ 
            error: 'Erreur de connexion lors de la récupération des étudiants',
            loading: { ...state.loading, etudiants: false, global: false }
          }));
        }
      },

      // Actions pour les agents
      fetchAgents: async () => {
        set(state => ({ 
          loading: { ...state.loading, agents: true, global: true },
          error: null 
        }));
        
        try {
          const response = await fetch('/api/agents');
          const data = await response.json();
          
          if (data.success) {
            set(state => ({ 
              agents: data.data,
              loading: { ...state.loading, agents: false, global: false }
            }));
          } else {
            set(state => ({ 
              error: data.error || 'Erreur lors de la récupération des agents',
              loading: { ...state.loading, agents: false, global: false }
            }));
          }
        } catch (error) {
          console.error('Erreur fetchAgents:', error);
          set(state => ({ 
            error: 'Erreur de connexion lors de la récupération des agents',
            loading: { ...state.loading, agents: false, global: false }
          }));
        }
      },

      // Actions pour les charges
      fetchCharges: async () => {
        set(state => ({ 
          loading: { ...state.loading, charges: true, global: true },
          error: null 
        }));
        
        try {
          const response = await fetch('/api/charges');
          const data = await response.json();
          
          if (data.success) {
            set(state => ({ 
              charges: data.data,
              loading: { ...state.loading, charges: false, global: false }
            }));
          } else {
            set(state => ({ 
              error: data.error || 'Erreur lors de la récupération des charges',
              loading: { ...state.loading, charges: false, global: false }
            }));
          }
        } catch (error) {
          console.error('Erreur fetchCharges:', error);
          set(state => ({ 
            error: 'Erreur de connexion lors de la récupération des charges',
            loading: { ...state.loading, charges: false, global: false }
          }));
        }
      },

      // Action pour récupérer toutes les données
      fetchAllData: async () => {
        set(state => ({ 
          loading: { 
            etudiants: true, 
            agents: true, 
            charges: true, 
            global: true 
          },
          error: null 
        }));

        try {
          const [etudiantsResponse, agentsResponse, chargesResponse] = await Promise.all([
            fetch('/api/etudiants'),
            fetch('/api/agents'),
            fetch('/api/charges')
          ]);

          const [etudiantsData, agentsData, chargesData] = await Promise.all([
            etudiantsResponse.json(),
            agentsResponse.json(),
            chargesResponse.json()
          ]);

          const errors = [];
          let etudiants = [];
          let agents = [];
          let charges = [];

          if (etudiantsData.success) {
            etudiants = etudiantsData.data;
          } else {
            errors.push(`Étudiants: ${etudiantsData.error}`);
          }

          if (agentsData.success) {
            agents = agentsData.data;
          } else {
            errors.push(`Agents: ${agentsData.error}`);
          }

          if (chargesData.success) {
            charges = chargesData.data;
          } else {
            errors.push(`Charges: ${chargesData.error}`);
          }

          set({ 
            etudiants,
            agents,
            charges,
            error: errors.length > 0 ? errors.join(', ') : null,
            loading: {
              etudiants: false,
              agents: false,
              charges: false,
              global: false
            }
          });

        } catch (error) {
          console.error('Erreur fetchAllData:', error);
          set({ 
            error: 'Erreur de connexion lors de la récupération des données',
            loading: {
              etudiants: false,
              agents: false,
              charges: false,
              global: false
            }
          });
        }
      },

      // Getters/Selectors
      getEtudiantById: (id) => {
        const etudiants = get().etudiants;
        return etudiants.find(etudiant => etudiant.id === id);
      },

      getAgentById: (id) => {
        const agents = get().agents;
        return agents.find(agent => agent.id === id);
      },

      getChargeById: (id) => {
        const charges = get().charges;
        return charges.find(charge => charge.id === id);
      },

      getEtudiantsBySection: (sectionId) => {
        const etudiants = get().etudiants;
        return etudiants.filter(etudiant => etudiant.section === sectionId);
      },

      getChargesByAgent: (agentId) => {
        const charges = get().charges;
        return charges.filter(charge => charge.titulaireId === agentId);
      },

      // Actions utilitaires
      clearError: () => set({ error: null }),
      
      resetStore: () => set({
        etudiants: [],
        agents: [],
        charges: [],
        loading: {
          etudiants: false,
          agents: false,
          charges: false,
          global: false
        },
        error: null
      }),

      // Action pour rafraîchir toutes les données
      refresh: async () => {
        await get().fetchAllData();
      },

      // Statistiques
      getStats: () => {
        const state = get();
        return {
          totalEtudiants: state.etudiants.length,
          totalAgents: state.agents.length,
          totalCharges: state.charges.length,
          etudiantsActifs: state.etudiants.filter(e => e.statut === 'actif').length,
          agentsActifs: state.agents.filter(a => a.statut === 'actif').length,
          chargesActives: state.charges.filter(c => c.statut === 'actif').length
        };
      }
    }),
    {
      name: 'app-store',
    }
  )
);

export default useAppStore;
