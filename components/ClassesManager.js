import { useEffect } from 'react';
import useClassesStore from '@/stores/Classes';

const ClassesManager = () => {
  // Récupération des données et actions du store
  const {
    classes,
    sections,
    loading,
    error,
    fetchAll,
    fetchClasses,
    fetchSections,
    createClass,
    clearError,
    refresh
  } = useClassesStore();

  // Charger les données au montage du composant
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Fonction pour créer une nouvelle classe
  const handleCreateClass = async () => {
    const newClassData = {
      name: "Nouvelle Classe Test",
      description: "Description de test",
      teacher_id: 1,
      schedule: "Lundi-Vendredi 8h-16h",
      capacity: 30
    };

    const result = await createClass(newClassData);
    if (result) {
      console.log('Classe créée avec succès:', result);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Gestionnaire des Classes et Sections
        </h1>
        
        {/* Boutons d'action */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Actualiser tout
          </button>
          <button
            onClick={fetchClasses}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Actualiser Classes
          </button>
          <button
            onClick={fetchSections}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Actualiser Sections
          </button>
          <button
            onClick={handleCreateClass}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Créer Classe Test
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section des Classes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Classes ({classes.length})
          </h2>
          
          {classes.length === 0 ? (
            <p className="text-gray-500 italic">Aucune classe trouvée</p>
          ) : (
            <div className="space-y-3">
              {classes.map((classe) => (
                <div
                  key={classe.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-medium text-gray-900">{classe.nom || classe.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {classe.description || 'Pas de description'}
                  </p>
                  {classe.unites && (
                    <div className="mt-2">
                      <span className="text-xs text-blue-600">
                        {classe.unites.length} unité(s)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section des Sections */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Sections ({sections.length})
          </h2>
          
          {sections.length === 0 ? (
            <p className="text-gray-500 italic">Aucune section trouvée</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-medium text-gray-900">{section.nom || section.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description || 'Pas de description'}
                  </p>
                  {section.promotions && (
                    <div className="mt-2">
                      <span className="text-xs text-purple-600">
                        {section.promotions.length} promotion(s)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Statistiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
            <div className="text-sm text-gray-600">Classes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{sections.length}</div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {classes.reduce((total, classe) => total + (classe.unites?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Unités</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {sections.reduce((total, section) => total + (section.promotions?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Promotions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesManager;
