'use client'

import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import useAuthStore from '@/stores/authStore';

const ProfileManager = () => {
  const { user, updateProfile, changePassword, loading, error, clearError } = useAuthStore();
  
  const [profileData, setProfileData] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        matricule: user.matricule || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (profileSuccess) setProfileSuccess('');
    if (error) clearError();
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      setProfileSuccess('✅ Profil mis à jour avec succès !');
      setTimeout(() => setProfileSuccess(''), 5000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('❌ Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setPasswordSuccess('✅ Mot de passe modifié avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setPasswordSuccess('');
        setShowPasswordModal(false);
      }, 2000);
    } else {
      setPasswordError(result.error || '❌ Erreur lors de la modification du mot de passe');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-6 py-4">
      <Row className="align-items-center justify-content-between g-3 mb-4">
        <Col md={6}>
          <div className="d-flex align-items-center">
            <span className="me-3" style={{ fontSize: '2rem' }}>👤</span>
            <div>
              <h2 className="mb-1">Mon Profil</h2>
              <p className="mb-0 text-muted">Gérez vos informations personnelles</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Informations du profil */}
        <Col xl={8} lg={7} md={12}>
          <Card className="mb-4">
            <Card.Header className="border-bottom">
              <h4 className="mb-0">Informations personnelles</h4>
            </Card.Header>
            <Card.Body>
              {profileSuccess && (
                <Alert variant="success" className="mb-4">
                  {profileSuccess}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={clearError}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleProfileSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="nom">
                      <Form.Label>Nom *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nom"
                        value={profileData.nom}
                        onChange={handleProfileChange}
                        placeholder="Votre nom"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="prenom">
                      <Form.Label>Prénom *</Form.Label>
                      <Form.Control
                        type="text"
                        name="prenom"
                        value={profileData.prenom}
                        onChange={handleProfileChange}
                        placeholder="Votre prénom"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="matricule">
                      <Form.Label>Matricule</Form.Label>
                      <Form.Control
                        type="text"
                        name="matricule"
                        value={profileData.matricule}
                        readOnly
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Le matricule ne peut pas être modifié
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="votre.email@example.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
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
                        Mise à jour...
                      </>
                    ) : (
                      <>💾 Enregistrer les modifications</>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Informations du compte */}
        <Col xl={4} lg={5} md={12}>
          <Card className="mb-4">
            <Card.Header className="border-bottom">
              <h5 className="mb-0">Informations du compte</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong className="text-muted small">PRIVILÈGE</strong>
                <div className="mt-1">
                  <span className="badge bg-primary rounded-pill px-3 py-2">
                    {user.privileges?.[0]?.designation === 'ADMIN' && '👑 ADMIN'}
                    {user.privileges?.[0]?.designation === 'DDD' && '🌱 DDD'}
                    {user.privileges?.[0]?.designation === 'DEHPE' && '⚡ DEHPE'}
                    {user.privileges?.[0]?.designation === 'OPERATOR' && '🔧 OPERATOR'}
                  </span>
                </div>
              </div>

              {user.privileges?.[0]?.entreprise && (
                <div className="mb-3">
                  <strong className="text-muted small">ENTREPRISE ASSIGNÉE</strong>
                  <div className="mt-1">
                    <span className="badge bg-info rounded-pill px-3 py-2">
                      🏢 {user.privileges[0].entreprise.nom}
                    </span>
                  </div>
                </div>
              )}

              <hr />

              <div className="d-grid">
                <Button 
                  variant="outline-secondary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  🔐 Changer le mot de passe
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal pour changer le mot de passe */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔐 Changer le mot de passe</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            {passwordError && (
              <Alert variant="danger" className="mb-3">
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert variant="success" className="mb-3">
                {passwordSuccess}
              </Alert>
            )}

            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Label>Mot de passe actuel *</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Votre mot de passe actuel"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>Nouveau mot de passe *</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                required
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirmer le nouveau mot de passe *</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirmer le nouveau mot de passe"
                required
                minLength={6}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowPasswordModal(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
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
                  Modification...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileManager;