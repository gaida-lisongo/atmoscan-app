import React from 'react';
import { useClasses, useClassesActions } from '@/hooks/useClasses';

const ClassesList = () => {
  // Utilisation du hook personnalisé
  const { classes, sections, loading, error } = useClasses();
  const { refresh, clearError } = useClassesActions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes et Sections</h1>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Actualiser
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Classes ({classes.length})</h2>
          <div className="space-y-2">
            {classes.map((classe) => (
              <div key={classe.id} className="p-3 border rounded-lg">
                <h3 className="font-medium">{classe.intitule}</h3>
                <p className="text-sm text-gray-600">{classe.systeme}</p>
                <p className="text-xs text-blue-600">{classe.filiere} - {classe.section}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sections ({sections.length})</h2>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="p-3 border rounded-lg">
                <h3 className="font-medium">{section.designation}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
                {section.promotions && (
                  <p className="text-xs text-purple-600">
                    {section.promotions.length} promotion(s)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesList;
