'use client'
import Link from 'next/link';
import { Col, Row, Card, Button, Modal, Form, InputGroup, Badge, Dropdown, Alert, Nav, Tab, Image } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';

const UserManagerSimple = () => {
    const [users, setUsers] = useState([]);
    const [enterprises, setEnterprises] = useState([]);
    const [privileges, setPrivileges] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPrivilegeModal, setShowPrivilegeModal] = useState(false);
    
    // Current items
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userPrivileges, setUserPrivileges] = useState([]);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [privilegeLoading, setPrivilegeLoading] = useState(false);
    
    // Authorization types
    const authorizationTypes = ['ADMIN', 'DDD', 'DEHPE', 'OPERATOR'];
    const [selectedAuthorization, setSelectedAuthorization] = useState('');

    // Tab state for user modal
    const [activeTab, setActiveTab] = useState('identite');
    
    // Photo upload states
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const fileInputRef = useRef(null);
    
    // Message d'erreur/succès
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch functions
    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const json = await res.json();
            if (json.success) setUsers(json.data);
        } catch (error) {
            console.error("Erreur de chargement des utilisateurs", error);
        }
    };

    const fetchEnterprises = async () => {
        try {
            const res = await fetch('/api/entreprises');
            const json = await res.json();
            if (json.success) setEnterprises(json.data);
        } catch (error) {
            console.error("Erreur de chargement des entreprises", error);
        }
    };

    const fetchPrivileges = async (userId = null) => {
        try {
            const url = userId ? `/api/privileges?userId=${userId}` : '/api/privileges';
            const res = await fetch(url);
            const json = await res.json();
            if (json.success) {
                if (userId) {
                    setUserPrivileges(json.data);
                } else {
                    setPrivileges(json.data);
                }
            }
        } catch (error) {
            console.error("Erreur de chargement des privilèges", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchEnterprises();
        fetchPrivileges();
    }, []);

    // Debug des privilèges
    useEffect(() => {
        console.log('Privilèges chargés:', privileges);
    }, [privileges]);

    // Photo upload handler - Prévisualisation uniquement
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload photo vers le serveur (après création user pour avoir l'ID)
    const uploadPhoto = async (userId) => {
        if (!photoFile || !userId) return null;
        
        setUploadingPhoto(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', photoFile);
        formDataUpload.append('userId', userId);
        
        try {
            const res = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formDataUpload
            });
            const data = await res.json();
            if (data.success) {
                return data.data.photoPath;
            } else {
                setMessage({ type: 'danger', text: data.message || 'Erreur lors de l\'upload de la photo' });
            }
            return null;
        } catch (error) {
            console.error("Erreur upload photo:", error);
            setMessage({ type: 'danger', text: 'Erreur lors de l\'upload de la photo' });
            return null;
        } finally {
            setUploadingPhoto(false);
        }
    };

    // User management functions
    const handleSubmitUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());

        if (payload.date_naissance) {
            payload.date_naissance = new Date(payload.date_naissance);
        }

        const method = currentUser ? 'PUT' : 'POST';
        const url = currentUser ? `/api/users?id=${currentUser._id}` : '/api/users';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (data.success) {
                // Si nouvelle création et photo sélectionnée, upload après pour avoir l'ID
                if (!currentUser && photoFile && data.data?._id) {
                    const photoPath = await uploadPhoto(data.data._id);
                    if (photoPath) {
                        setMessage({ type: 'success', text: 'Utilisateur créé avec photo!' });
                    }
                }
                // Si modification et photo sélectionnée
                else if (currentUser && photoFile) {
                    const photoPath = await uploadPhoto(currentUser._id);
                    if (photoPath) {
                        setMessage({ type: 'success', text: 'Utilisateur mis à jour avec photo!' });
                    }
                }
                
                fetchUsers();
                handleCloseUserModal();
            } else {
                setMessage({ type: 'danger', text: data.error || data.message || 'Erreur lors de l\'enregistrement' });
            }
        } catch (error) {
            console.error("Erreur enregistrement utilisateur", error);
            setMessage({ type: 'danger', text: 'Erreur de connexion au serveur' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (confirm("Supprimer cet utilisateur ?")) {
            await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            setUsers(users.filter(user => user._id !== id));
        }
    };

    const handleOpenUserModal = (user = null) => {
        setCurrentUser(user);
        setActiveTab('identite');
        setPhotoFile(null);
        setPhotoPreview(user?.photoPath || null);
        setMessage({ type: '', text: '' });
        setShowUserModal(true);
    };

    const handleCloseUserModal = () => {
        setShowUserModal(false);
        setCurrentUser(null);
        setActiveTab('identite');
        setPhotoFile(null);
        setPhotoPreview(null);
        setMessage({ type: '', text: '' });
    };

    // Privilege management functions
    const handleOpenPrivilegeModal = (userId) => {
        setSelectedUserId(userId);
        setShowPrivilegeModal(true);
        fetchPrivileges(userId);
    };

    const handleClosePrivilegeModal = () => {
        setShowPrivilegeModal(false);
        setSelectedUserId(null);
        setUserPrivileges([]);
    };

    const handleSubmitPrivilege = async (e) => {
        e.preventDefault();
        setPrivilegeLoading(true);
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());
        
        payload.userId = selectedUserId;
        // Only include enterprises if authorization is OPERATOR
        if (payload.designation === 'OPERATOR') {
            payload.entreprises = formData.getAll('entreprises');
        } else {
            payload.entreprises = [];
        }

        try {
            const res = await fetch('/api/privileges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchPrivileges(selectedUserId);
                e.target.reset();
                setSelectedAuthorization('');
            }
        } catch (error) {
            console.error("Erreur création privilège", error);
        } finally {
            setPrivilegeLoading(false);
        }
    };

    const handleDeletePrivilege = async (privilegeId) => {
        if (confirm("Supprimer ce privilège ?")) {
            await fetch(`/api/privileges?id=${privilegeId}`, { method: 'DELETE' });
            fetchPrivileges(selectedUserId);
        }
    };

    // Utility functions
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getUserPrivilegesCount = (userId) => {
        return privileges.filter(p => {
            // Gestion cas où p.userId peut être une string ou un objet avec _id
            const privilegeUserId = typeof p.userId === 'string' ? p.userId : p.userId?._id;
            return privilegeUserId === userId;
        }).length;
    };

    return (
        <div className="w-100 bg-white min-vh-100 p-2 p-md-4">
            {/* EN-TETE SIMPLE */}
            <div className="mb-4">
                <div className="mb-3 mb-md-4">
                    <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-2">
                        👥 Gestion des Utilisateurs
                    </h2>
                    <p className="text-muted mb-0 small">Administration des comptes utilisateurs et autorisations</p>
                </div>
                
                {/* Actions Header */}
                <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 align-items-stretch align-items-md-center">
                    <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                        <InputGroup className="bg-light rounded-3 border-0">
                            <InputGroup.Text className="bg-transparent border-0 ps-3">
                                🔍
                            </InputGroup.Text>
                            <Form.Control 
                                className="bg-transparent border-0 ps-2 shadow-none"
                                placeholder="Rechercher un utilisateur..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: '0.95rem' }}
                            />
                        </InputGroup>
                    </div>
                    
                    <Button 
                        variant="primary" 
                        className="rounded-3 px-3 px-md-4 py-2 fw-semibold" 
                        onClick={() => handleOpenUserModal()}
                        style={{ 
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            border: 'none'
                        }}
                    >
                        ➕ <span className="ms-2 d-none d-sm-inline">Nouvel Utilisateur</span>
                        <span className="ms-2 d-inline d-sm-none">Ajouter</span>
                    </Button>
                </div>
                
                {/* Statistiques */}
                <div className="mt-3 d-flex gap-3 text-muted small">
                    <div>👤 {users.length} utilisateurs</div>
                    <div>🛡️ {privileges.length} autorisations</div>
                    <div>🔍 {filteredUsers.length} résultats</div>
                </div>
            </div>

            {/* LISTE UTILISATEURS PLEINE LARGEUR */}
            <Row className="g-3 g-md-4">{filteredUsers.map((user) => {
                    const userPrivilegesCount = getUserPrivilegesCount(user._id);
                    console.log(`User ${user.username} (${user._id}) has ${userPrivilegesCount} privileges`);
                    
                    return (
                    <Col xs={12} lg={6} xl={3} key={user._id} className="mb-3">
                        <Card className="border shadow-sm h-100" 
                              style={{ 
                                  borderRadius: '16px',
                                  minHeight: '280px'
                              }}>
                            <Card.Body className="p-4 d-flex flex-column">
                                {/* Header */}
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center flex-grow-1">
                                        <div className="bg-success rounded-3 shadow-sm d-flex align-items-center justify-content-center fw-bold text-white me-3" 
                                             style={{ width: '50px', height: '50px' }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-bold">{user.username}</h6>
                                            <Badge bg="light" className="text-primary">{user.matricule}</Badge>
                                        </div>
                                    </div>
                                    
                                    <Dropdown>
                                        <Dropdown.Toggle 
                                            as="button" 
                                            className="btn btn-light btn-sm rounded-3 border-0"
                                            style={{ width: '30px', height: '30px' }}>
                                            ⋮
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item onClick={() => handleOpenUserModal(user)}>
                                                ✏️ Modifier
                                            </Dropdown.Item>
                                            <Dropdown.Item className="text-danger" onClick={() => handleDeleteUser(user._id)}>
                                                🗑️ Supprimer
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                {/* Informations */}
                                <div className="mb-3 flex-grow-1">
                                    {user.fonction && (
                                        <div className="text-muted mb-2 small">
                                            💼 {user.fonction}
                                            {user.departement && ` • ${user.departement}`}
                                        </div>
                                    )}
                                    
                                    {user.email && (
                                        <div className="text-muted mb-2 small">
                                            ✉️ {user.email}
                                        </div>
                                    )}

                                    {user.telephone && (
                                        <div className="text-muted mb-2 small">
                                            📞 {user.telephone}
                                        </div>
                                    )}

                                    {user.adresse && (
                                        <div className="text-muted mb-2 small">
                                            📍 {user.adresse}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="w-100 rounded-3 mt-auto"
                                    onClick={() => handleOpenPrivilegeModal(user._id)}
                                >
                                    🛡️ Autorisations ({userPrivilegesCount})
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    );
                })}
            </Row>

            {/* État vide */}
            {filteredUsers.length === 0 && (
                <div className="text-center py-5">
                    <div className="mb-3" style={{ fontSize: '3rem' }}>👤</div>
                    <h5 className="text-muted mb-2">
                        {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur enregistré'}
                    </h5>
                    <p className="text-muted small mb-3">
                        {searchTerm 
                            ? `Aucun utilisateur ne correspond à "${searchTerm}"` 
                            : 'Commencez par créer votre premier utilisateur'
                        }
                    </p>
                    {!searchTerm && (
                        <Button 
                            variant="outline-primary" 
                            onClick={() => handleOpenUserModal()}
                            className="rounded-3 px-4"
                        >
                            ➕ Créer un utilisateur
                        </Button>
                    )}
                </div>
            )}

            {/* MODAL UTILISATEUR - 3 Tabs */}
            <Modal show={showUserModal} onHide={handleCloseUserModal} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-2">
                    <Modal.Title className="fw-bold">
                        {currentUser ? '✏️ Éditer l\'utilisateur' : '➕ Nouvel utilisateur'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmitUser}>
                    <Modal.Body className="py-3">
                        {/* Message d'erreur/succès */}
                        {message.text && (
                            <Alert 
                                variant={message.type} 
                                dismissible 
                                onClose={() => setMessage({ type: '', text: '' })}
                                className="mb-3"
                            >
                                {message.type === 'danger' ? '❌ ' : '✅ '}{message.text}
                            </Alert>
                        )}
                        
                        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                            <Nav variant="pills" className="nav-fill mb-4 gap-2">
                                <Nav.Item>
                                    <Nav.Link 
                                        eventKey="identite" 
                                        className="rounded-3 py-2 px-3"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        👤 Identité
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link 
                                        eventKey="coordonnees" 
                                        className="rounded-3 py-2 px-3"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        📍 Coordonnées
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link 
                                        eventKey="compte" 
                                        className="rounded-3 py-2 px-3"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        ⚙️ Compte
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                {/* TAB 1: IDENTITÉ */}
                                <Tab.Pane eventKey="identite">
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Nom complet *
                                                </Form.Label>
                                                <Form.Control 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="username" 
                                                    defaultValue={currentUser?.username} 
                                                    required 
                                                    placeholder="Ex: Jean Dupont"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Sexe
                                                </Form.Label>
                                                <Form.Select 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="sexe" 
                                                    defaultValue={currentUser?.sexe}
                                                >
                                                    <option value="">Choisir...</option>
                                                    <option value="M">Masculin</option>
                                                    <option value="F">Féminin</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Date de naissance
                                                </Form.Label>
                                                <Form.Control 
                                                    type="date"
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="date_naissance" 
                                                    defaultValue={currentUser?.date_naissance ? new Date(currentUser.date_naissance).toISOString().split('T')[0] : ''}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Lieu de naissance
                                                </Form.Label>
                                                <Form.Control 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="lieu_naissance" 
                                                    defaultValue={currentUser?.lieu_naissance} 
                                                    placeholder="Ex: Kinshasa, RDC"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Nationalité
                                                </Form.Label>
                                                <Form.Control 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="nationalite" 
                                                    defaultValue={currentUser?.nationalite} 
                                                    placeholder="Ex: Congolaise"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                {/* TAB 2: COORDONNÉES */}
                                <Tab.Pane eventKey="coordonnees">
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Email
                                                </Form.Label>
                                                <Form.Control 
                                                    type="email"
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="email" 
                                                    defaultValue={currentUser?.email} 
                                                    placeholder="user@example.com"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Téléphone
                                                </Form.Label>
                                                <Form.Control 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="telephone" 
                                                    defaultValue={currentUser?.telephone} 
                                                    placeholder="+243 XXX XXX XXX"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Adresse
                                                </Form.Label>
                                                <Form.Control 
                                                    as="textarea"
                                                    rows={3}
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="adresse" 
                                                    defaultValue={currentUser?.adresse} 
                                                    placeholder="Adresse complète"
                                                    style={{ resize: 'none' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                {/* TAB 3: COMPTE */}
                                <Tab.Pane eventKey="compte">
                                    {/* Section Photo */}
                                    <div className="text-center mb-4">
                                        <Form.Label className="small fw-bold text-uppercase text-muted mb-3 d-block">
                                            📷 Photo de profil
                                        </Form.Label>
                                        <div className="position-relative d-inline-block">
                                            <div 
                                                className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center mx-auto border"
                                                style={{ width: '120px', height: '120px' }}
                                            >
                                                {photoPreview ? (
                                                    <Image 
                                                        src={photoPreview} 
                                                        alt="Photo" 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '3rem' }}>👤</span>
                                                )}
                                            </div>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="position-absolute rounded-circle p-2"
                                                style={{ bottom: '0', right: '0', width: '36px', height: '36px' }}
                                                onClick={() => fileInputRef.current?.click()}
                                                type="button"
                                            >
                                                📷
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        {photoFile && (
                                            <div className="mt-2">
                                                <Badge bg="success" className="px-3 py-2">
                                                    📤 {photoFile.name}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Matricule *
                                                </Form.Label>
                                                <Form.Control 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="matricule" 
                                                    defaultValue={currentUser?.matricule} 
                                                    required 
                                                    placeholder="Ex: AGT001"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Fonction
                                                </Form.Label>
                                                <Form.Control 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="fonction" 
                                                    defaultValue={currentUser?.fonction} 
                                                    placeholder="Ex: Inspecteur"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                                    Département
                                                </Form.Label>
                                                <Form.Control 
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="departement" 
                                                    defaultValue={currentUser?.departement} 
                                                    placeholder="Ex: Environnement"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0 pb-4">
                        <div className="d-flex gap-3 w-100">
                            <Button 
                                variant="light" 
                                onClick={handleCloseUserModal}
                                className="rounded-3 px-4 py-2 flex-grow-1"
                                type="button"
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading || uploadingPhoto}
                                className="rounded-3 px-4 py-2 flex-grow-1"
                                style={{ 
                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                    border: 'none'
                                }}
                            >
                                {(loading || uploadingPhoto) ? (uploadingPhoto ? '📤 Upload photo...' : '⏳ Enregistrement...') : (currentUser ? '💾 Mettre à jour' : '➕ Créer')}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* MODAL AUTORISATIONS */}
            <Modal show={showPrivilegeModal} onHide={handleClosePrivilegeModal} centered size="xl">
                <Modal.Header closeButton className="border-0 pb-2">
                    <Modal.Title className="fw-bold">
                        🛡️ Gestion des Autorisations
                        {selectedUserId && (
                            <Badge bg="light" className="text-muted ms-2">
                                {users.find(u => u._id === selectedUserId)?.username}
                            </Badge>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4">
                    {/* Formulaire d'ajout d'autorisation */}
                    <Card className="border-0 bg-light mb-4">
                        <Card.Body className="p-3">
                            <h6 className="fw-bold mb-3">➕ Ajouter une nouvelle autorisation</h6>
                            <Form onSubmit={handleSubmitPrivilege}>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Type d'autorisation *</Form.Label>
                                            <Form.Control 
                                                as="select"
                                                className="border rounded-3 py-2 px-3" 
                                                name="designation" 
                                                required 
                                                value={selectedAuthorization}
                                                onChange={(e) => setSelectedAuthorization(e.target.value)}
                                            >
                                                <option value="">Choisir une autorisation...</option>
                                                {authorizationTypes.map(auth => (
                                                    <option key={auth} value={auth}>{auth}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Mot de passe *</Form.Label>
                                            <Form.Control 
                                                type="password"
                                                className="border rounded-3 py-2 px-3" 
                                                name="password" 
                                                required 
                                                placeholder="••••••••"
                                            />
                                        </Form.Group>
                                    </Col>
                                    {selectedAuthorization === 'OPERATOR' && (
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold">Entreprises gérées *</Form.Label>
                                                <Form.Control 
                                                    as="select"
                                                    multiple
                                                    className="border rounded-3 py-2 px-3" 
                                                    name="entreprises"
                                                    style={{ minHeight: '80px' }}
                                                    required={selectedAuthorization === 'OPERATOR'}
                                                >
                                                    {enterprises.map(enterprise => (
                                                        <option key={enterprise._id} value={enterprise._id}>
                                                            {enterprise.designation}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                                <div className="text-muted small mt-1">
                                                    Maintenez Ctrl pour sélectionner plusieurs entreprises
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    )}
                                </Row>
                                <div className="text-end">
                                    <Button 
                                        type="submit" 
                                        disabled={privilegeLoading}
                                        variant="success"
                                        className="rounded-3 px-4"
                                    >
                                        {privilegeLoading ? '⏳ Création...' : '➕ Créer l\'autorisation'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Liste des autorisations existantes */}
                    <div>
                        <h6 className="fw-bold mb-3">🛡️ Autorisations existantes ({userPrivileges.length})</h6>
                        
                        {userPrivileges.length === 0 ? (
                            <Alert variant="info" className="text-center">
                                <div style={{ fontSize: '2rem' }}>ℹ️</div>
                                <p className="mb-0">Aucune autorisation associée à cet utilisateur</p>
                            </Alert>
                        ) : (
                            <Row>
                                {userPrivileges.map((privilege) => (
                                    <Col md={6} key={privilege._id} className="mb-3">
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="flex-grow-1">
                                                        <h6 className="fw-bold mb-2 d-flex align-items-center">
                                                            {privilege.designation === 'ADMIN' && '👑'}
                                                            {privilege.designation === 'DDD' && '🌱'}
                                                            {privilege.designation === 'DEHPE' && '⚡'}
                                                            {privilege.designation === 'OPERATOR' && '🔧'}
                                                            <span className="ms-2">{privilege.designation}</span>
                                                        </h6>
                                                        {privilege.designation === 'OPERATOR' && privilege.entreprises?.length > 0 && (
                                                            <div className="small text-muted mb-2">
                                                                <strong>Entreprises gérées:</strong>
                                                                <div className="mt-1">
                                                                    {privilege.entreprises.map((ent, index) => (
                                                                        <Badge key={ent._id || index} bg="light" className="text-dark me-1 mb-1">
                                                                            🏢 {ent.designation}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        className="rounded-3"
                                                        onClick={() => handleDeletePrivilege(privilege._id)}
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button 
                        variant="secondary" 
                        onClick={handleClosePrivilegeModal}
                        className="rounded-3 px-4"
                    >
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagerSimple;