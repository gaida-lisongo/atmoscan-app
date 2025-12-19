'use client'

import { Card, Row, Col, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';

const AdminQuickAccess = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  // Vérifier si l'utilisateur a des privilèges d'administration
  const isAdmin = user?.privileges?.[0]?.designation === 'ADMIN';

  if (!isAdmin) {
    return null; // Ne pas afficher si pas admin
  }

  const adminActions = [
    {
      title: 'Gestion des Utilisateurs',
      description: 'Créer, modifier et gérer les utilisateurs et leurs privilèges',
      icon: '👥',
      action: () => router.push('/users'),
      color: 'primary'
    },
    {
      title: 'Mon Profil',
      description: 'Modifier vos informations personnelles et mot de passe',
      icon: '👤',
      action: () => router.push('/profile'),
      color: 'info'
    },
    {
      title: 'Gestion Entreprises',
      description: 'Gérer les entreprises et leurs informations',
      icon: '🏢',
      action: () => router.push('/entreprises'),
      color: 'success'
    }
  ];

  return (
    <Card className="mb-4">
      <Card.Header className="border-bottom">
        <Row className="align-items-center">
          <Col>
            <h4 className="mb-0">
              <span className="me-2">⚙️</span>
              Accès Administrateur
            </h4>
            <p className="mb-0 text-muted small">Fonctionnalités d'administration système</p>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row>
          {adminActions.map((action, index) => (
            <Col lg={4} md={6} xs={12} key={index} className="mb-3">
              <Card 
                className="h-100 border shadow-sm hover-lift"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={action.action}
              >
                <Card.Body className="text-center p-4">
                  <div 
                    className={`rounded-circle d-inline-flex align-items-center justify-content-center bg-${action.color} bg-opacity-10 mb-3`}
                    style={{ width: '60px', height: '60px' }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{action.title}</h5>
                  <p className="text-muted small mb-3">{action.description}</p>
                  <Button 
                    variant={action.color} 
                    size="sm" 
                    className="px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                  >
                    Accéder
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
      
      <style jsx>{`
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </Card>
  );
};

export default AdminQuickAccess;