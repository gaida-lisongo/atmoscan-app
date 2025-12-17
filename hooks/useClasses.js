import { useEffect, useRef } from 'react';
import useClassesStore from '@/stores/Classes';

/**
 * Hook personnalisé pour utiliser le store des classes et sections
 * @param {Object} options - Options de configuration
 * @param {boolean} options.autoFetch - Charger automatiquement les données au montage (défaut: true)
 * @param {boolean} options.fetchClasses - Charger seulement les classes
 * @param {boolean} options.fetchSections - Charger seulement les sections
 */
export const useClasses = (options = {}) => {
  const {
    autoFetch = true,
    fetchClasses = false,
    fetchSections = false
  } = options;

  const store = useClassesStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
      
      if (fetchClasses && !fetchSections) {
        store.fetchClasses();
      } else if (fetchSections && !fetchClasses) {
        store.fetchSections();
      } else {
        store.fetchAll();
      }
    }
  }, []); // Dépendances vides pour ne s'exécuter qu'une fois

  return store;
};

/**
 * Hook pour récupérer une classe spécifique par ID
 * @param {number|string} classId - ID de la classe
 */
export const useClass = (classId) => {
  const { classes, getClassById, loading, error } = useClassesStore();
  
  const classe = getClassById(classId);
  
  return {
    classe,
    loading,
    error,
    exists: !!classe
  };
};

/**
 * Hook pour récupérer une section spécifique par ID
 * @param {number|string} sectionId - ID de la section
 */
export const useSection = (sectionId) => {
  const { sections, getSectionById, loading, error } = useClassesStore();
  
  const section = getSectionById(sectionId);
  
  return {
    section,
    loading,
    error,
    exists: !!section
  };
};

/**
 * Hook pour récupérer les classes d'une section spécifique
 * @param {number|string} sectionId - ID de la section
 */
export const useClassesBySection = (sectionId) => {
  const { getClassesBySection, loading, error } = useClassesStore();
  
  const classes = getClassesBySection(sectionId);
  
  return {
    classes,
    loading,
    error,
    count: classes.length
  };
};

/**
 * Hook pour les actions de création/modification
 */
export const useClassesActions = () => {
  const {
    createClass,
    fetchAll,
    fetchClasses,
    fetchSections,
    refresh,
    clearError,
    resetStore
  } = useClassesStore();

  return {
    createClass,
    fetchAll,
    fetchClasses,
    fetchSections,
    refresh,
    clearError,
    resetStore
  };
};

export default useClasses;
