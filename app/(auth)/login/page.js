'use client'

import { Row, Col, Card, Form, Button, Image, Alert, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/stores/authStore';
import useMounted from 'hooks/useMounted';

const Login = () => {
  // console.log('LoginPage: Rendering');
  const hasMounted = useMounted();
  const router = useRouter();
  const { login, loading, error, isAuthenticated, clearError } = useAuthStore();
  
  useEffect(() => {
    // console.log('LoginPage: Mounted', { isAuthenticated, hasMounted });
  }, [isAuthenticated, hasMounted]);

  const [formData, setFormData] = useState({
    matricule: '',
    designation: 'OPERATOR',
    password: ''
  });

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Nettoyer les erreurs quand l'utilisateur tape
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.matricule || !formData.password) {
      return;
    }

    const result = await login(formData.matricule, formData.designation, formData.password);
    
    if (result.success) {
      // Redirection vers la page d'accueil par défaut
      router.push('/');
    }
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           padding: '20px'
         }}>
      <Row className="align-items-center justify-content-center g-0 w-100">
        <Col xxl={4} lg={6} md={8} xs={12}>
          {/* Card */}
          <Card className="shadow-lg border-0" style={{ borderRadius: '20px' }}>
            {/* Card body */}
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <div className="mb-3">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <span style={{ fontSize: '2rem' }}>🏢</span>
                  </div>
                </div>
                <h2 className="fw-bold text-dark mb-2">AtmoScan</h2>
                <p className="text-muted mb-0">Connectez-vous à votre espace de travail</p>
              </div>

              {/* Affichage des erreurs */}
              {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={clearError}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">⚠️</span>
                    {error}
                  </div>
                </Alert>
              )}

              {/* Form */}
              <Form onSubmit={handleSubmit}>
                {/* Matricule */}
                <Form.Group className="mb-4" controlId="matricule">
                  <Form.Label className="fw-semibold text-dark">Matricule</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    placeholder="Votre matricule"
                    required
                    className="py-3 px-4 border-0 bg-light rounded-3"
                    style={{ fontSize: '1rem' }}
                  />
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-4" controlId="password">
                  <Form.Label className="fw-semibold text-dark">Mot de passe</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    required
                    className="py-3 px-4 border-0 bg-light rounded-3"
                    style={{ fontSize: '1rem' }}
                  />
                </Form.Group>

                <div className="mb-4">
                  {/* Button */}
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={loading}
                      className="py-3 fw-bold rounded-3 border-0"
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Connexion...
                        </>
                      ) : (
                        <>🔐 Se connecter</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <small className="text-muted">
                    <div className="mb-2">
                      <span className="me-2">💡</span>
                      Utilisez vos identifiants professionnels
                    </div>
                    <div>
                      <span className="me-2">🔒</span>
                      Connexion sécurisée SSL
                    </div>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;