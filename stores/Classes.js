import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useClassesStore = create(
  devtools(
    (set, get) => ({
      // État initial
      classes: [],
      sections: [],
      loading: false,
      error: null,

      // Actions pour les classes
      fetchClasses: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/classes');
          const data = await response.json();
          
          if (data.success) {
            set({ 
              classes: data.data, 
              loading: false 
            });
          } else {
            set({ 
              error: data.error || 'Erreur lors de la récupération des classes',
              loading: false 
            });
          }
        } catch (error) {
          console.error('Erreur fetchClasses:', error);
          set({ 
            error: 'Erreur de connexion lors de la récupération des classes',
            loading: false 
          });
        }
      },

      // Actions pour les sections
      fetchSections: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/sections');
          const data = await response.json();
          
          if (data.success) {
            set({ 
              sections: data.data, 
              loading: false 
            });
          } else {
            set({ 
              error: data.error || 'Erreur lors de la récupération des sections',
              loading: false 
            });
          }
        } catch (error) {
          console.error('Erreur fetchSections:', error);
          set({ 
            error: 'Erreur de connexion lors de la récupération des sections',
            loading: false 
          });
        }
      },

      // Action pour récupérer les deux en même temps
      fetchAll: async () => {
        set({ loading: true, error: null });
        try {
          const [classesResponse, sectionsResponse] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/sections')
          ]);

          const classesData = await classesResponse.json();
          const sectionsData = await sectionsResponse.json();

          const errors = [];
          let classes = [];
          let sections = [];

          if (classesData.success) {
            classes = classesData.data;
          } else {
            errors.push(`Classes: ${classesData.error}`);
          }

          if (sectionsData.success) {
            sections = sectionsData.data;
          } else {
            errors.push(`Sections: ${sectionsData.error}`);
          }

          set({ 
            classes,
            sections,
            error: errors.length > 0 ? errors.join(', ') : null,
            loading: false 
          });

        } catch (error) {
          console.error('Erreur fetchAll:', error);
          set({ 
            error: 'Erreur de connexion lors de la récupération des données',
            loading: false 
          });
        }
      },

      // Action pour créer une nouvelle classe
      createClass: async (classData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/classes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(classData),
          });

          const data = await response.json();
          
          if (data.success) {
            // Ajouter la nouvelle classe à la liste existante
            const currentClasses = get().classes;
            set({ 
              classes: [data.data, ...currentClasses],
              loading: false 
            });
            return data.data;
          } else {
            set({ 
              error: data.error || 'Erreur lors de la création de la classe',
              loading: false 
            });
            return null;
          }
        } catch (error) {
          console.error('Erreur createClass:', error);
          set({ 
            error: 'Erreur de connexion lors de la création de la classe',
            loading: false 
          });
          return null;
        }
      },

      // Getters/Selectors
      getClassById: (id) => {
        const classes = get().classes;
        // Conversion en nombre pour gérer les IDs venant de l'URL (string)
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return classes.find(classe => classe.id === numericId);
      },

      getClassByPromotionId: (promotionId) => {
        const classes = get().classes;
        // Conversion en nombre pour gérer les IDs venant de l'URL (string)
        const numericPromotionId = typeof promotionId === 'string' ? parseInt(promotionId, 10) : promotionId;
        return classes.find(classe => classe.id_promotion === numericPromotionId);
      },

      getSectionById: (id) => {
        const sections = get().sections;
        return sections.find(section => section.id === id);
      },

      getClassesBySection: (sectionId) => {
        const classes = get().classes;
        return classes.filter(classe => 
          classe.unites?.some(unite => unite.sectionId === sectionId)
        );
      },

      // Actions utilitaires
      clearError: () => set({ error: null }),
      
      resetStore: () => set({
        classes: [],
        sections: [],
        loading: false,
        error: null
      }),

      // Action pour rafraîchir les données
      refresh: async () => {
        await get().fetchAll();
      }
    }),
    {
      name: 'classes-store', // nom pour les devtools
    }
  )
);

export default useClassesStore;