// Mock database pour développement rapide
let mockClasses = [
  {
    id: 1,
    name: 'Classe de Seconde A',
    description: 'Classe de seconde générale section A',
    teacher_id: 2,
    teacher_name: 'Jean Dupont',
    teacher_email: 'jean.dupont@school.com',
    schedule: 'Lundi-Vendredi 8h-17h',
    capacity: 25,
    slug: 'seconde-a',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: 2,
    name: 'Classe de Première S',
    description: 'Classe de première scientifique',
    teacher_id: 3,
    teacher_name: 'Marie Martin',
    teacher_email: 'marie.martin@school.com',
    schedule: 'Lundi-Vendredi 8h-18h',
    capacity: 20,
    slug: 'premiere-s',
    created_at: new Date('2024-01-16'),
    updated_at: new Date('2024-01-16')
  }
];

let nextId = 3;

export const mockDb = {
  // Simuler une requête SELECT
  async executeQuery(query, params = []) {
    console.log('🔄 Mock Query:', query, params);
    
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (query.includes('SELECT 1 as test')) {
      return [{ test: 1 }];
    }
    
    if (query.includes('SELECT * FROM classes')) {
      return mockClasses;
    }
    
    if (query.includes('INSERT INTO classes')) {
      const [name, description, teacher_id, schedule, capacity] = params;
      const newClass = {
        id: nextId++,
        name,
        description,
        teacher_id,
        teacher_name: 'Professeur Test',
        teacher_email: 'test@school.com',
        schedule,
        capacity,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date(),
        updated_at: new Date()
      };
      mockClasses.push(newClass);
      return { insertId: newClass.id };
    }
    
    if (query.includes('UPDATE classes')) {
      const classId = params[params.length - 2] || params[params.length - 1];
      const classIndex = mockClasses.findIndex(c => c.id == classId || c.slug == classId);
      if (classIndex !== -1) {
        const [name, description, teacher_id, schedule, capacity] = params;
        mockClasses[classIndex] = {
          ...mockClasses[classIndex],
          name,
          description,
          teacher_id,
          schedule,
          capacity,
          updated_at: new Date()
        };
      }
      return { affectedRows: classIndex !== -1 ? 1 : 0 };
    }
    
    if (query.includes('DELETE FROM classes')) {
      const classId = params[0];
      const initialLength = mockClasses.length;
      mockClasses = mockClasses.filter(c => c.id != classId && c.slug != classId);
      return { affectedRows: initialLength - mockClasses.length };
    }
    
    if (query.includes('WHERE id = ? OR slug = ?')) {
      const [identifier] = params;
      const found = mockClasses.filter(c => c.id == identifier || c.slug == identifier);
      return found;
    }
    
    return [];
  },
  
  async testConnection() {
    console.log('✅ Mock: Connexion simulée réussie');
    return true;
  },
  
  async executeTransaction(queries) {
    console.log('🔄 Mock Transaction:', queries.length, 'queries');
    const results = [];
    for (const { query, params } of queries) {
      const result = await this.executeQuery(query, params);
      results.push(result);
    }
    return results;
  }
};

// Export des fonctions pour remplacer temporairement les vraies
export const executeQuery = mockDb.executeQuery.bind(mockDb);
export const testConnection = mockDb.testConnection.bind(mockDb);
export const executeTransaction = mockDb.executeTransaction.bind(mockDb);
