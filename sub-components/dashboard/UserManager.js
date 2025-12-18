'use client'
import Link from 'next/link';
import { Col, Row, Card, Button, Modal, Form, InputGroup, Badge, Dropdown, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { 
    Edit, Trash2, Phone, Mail, Plus, Search, MoreVertical, 
    User as UserIcon, Shield, Eye, Calendar, MapPin, Briefcase, 
    Settings, Key, Users, Building, X, AlertCircle 
} from 'react-feather';

const UserManager = () => {
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

    // User management functions
    const handleSubmitUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());

        // Convert date string to Date object if provided
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
            if (res.ok) {
                fetchUsers();
                handleCloseUserModal();
            }
        } catch (error) {
            console.error("Erreur enregistrement utilisateur", error);
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
        setShowUserModal(true);
    };

    const handleCloseUserModal = () => {
        setShowUserModal(false);
        setCurrentUser(null);
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
        
        // Add userId and convert entreprises to array
        payload.userId = selectedUserId;
        payload.entreprises = formData.getAll('entreprises');

        try {
            const res = await fetch('/api/privileges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchPrivileges(selectedUserId);
                e.target.reset();
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
        return privileges.filter(p => p.userId === userId).length;
    };

    return (
        <div className="bg-white min-vh-100 p-2 p-md-4 rounded shadow-sm">
            {/* EN-TETE RESPONSIVE */}
            <div className="mb-4">
                <div className="mb-3 mb-md-4">
                    <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-2 d-flex align-items-center">
                        <Users className="me-2 text-primary" size="32" />
                        Gestion des Utilisateurs
                    </h2>
                    <p className="text-muted mb-0 small">Administration des comptes utilisateurs et privilèges</p>
                </div>
                
                {/* Actions Header */}
                <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 align-items-stretch align-items-md-center">
                    <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                        <InputGroup className="bg-light rounded-3 border-0">
                            <InputGroup.Text className="bg-transparent border-0 ps-3">
                                <Search size="18" className="text-muted" />
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
                        className="rounded-3 px-3 px-md-4 py-2 d-flex align-items-center justify-content-center fw-semibold" 
                        onClick={() => handleOpenUserModal()}
                        style={{ 
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                        }}
                    >
                        <Plus size="18" className="me-2"/> 
                        <span className="d-none d-sm-inline">Nouvel Utilisateur</span>
                        <span className="d-inline d-sm-none">Ajouter</span>
                    </Button>
                </div>
                
                {/* Statistiques */}
                <div className="mt-3 d-flex gap-3 text-muted small">
                    <div>
                        <UserIcon size="14" className="me-1" />
                        {users.length} utilisateurs
                    </div>
                    <div>
                        <Shield size="14" className="me-1" />
                        {privileges.length} privilèges
                    </div>
                    <div>
                        <Search size="14" className="me-1" />
                        {filteredUsers.length} résultats
                    </div>
                </div>
            </div>

            {/* LISTE UTILISATEURS */}
            <Row className="g-2 g-md-3">
                {filteredUsers.map((user) => (
                    <Col xs={12} lg={6} xl={4} key={user._id} className="mb-2 mb-md-3">
                        <Card className="border-0 shadow-sm h-100 transition-all" 
                              style={{ 
                                  borderRadius: '16px',
                                  transition: 'all 0.3s ease',
                                  backgroundColor: '#fafbfc'
                              }}
                              onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                              }}>
                            <Card.Body className="p-3">
                                {/* Header de la carte */}
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                    <div className="d-flex align-items-center flex-grow-1">
                                        <div className="bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-center fw-bold text-white position-relative me-3" 
                                             style={{ 
                                                 width: '50px', 
                                                 height: '50px', 
                                                 background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                             }}>
                                            {user.username.charAt(0).toUpperCase()}
                                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" 
                                                 style={{ width: '12px', height: '12px', border: '2px solid white' }}></div>
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h6 className="mb-1 text-truncate fw-bold" style={{ fontSize: '1rem' }}>
                                                {user.username}
                                            </h6>
                                            <Badge bg="light" className="text-primary fw-normal px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                {user.matricule}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <Dropdown>
                                        <Dropdown.Toggle 
                                            as="div" 
                                            className="btn btn-light btn-sm rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px', cursor: 'pointer' }}>
                                            <MoreVertical size="14" className="text-muted" />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align="end" className="border-0 shadow-lg rounded-3">
                                            <Dropdown.Item onClick={() => handleOpenUserModal(user)} className="d-flex align-items-center">
                                                <Edit size="14" className="me-2 text-primary" /> Modifier
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="text-danger d-flex align-items-center" onClick={() => handleDeleteUser(user._id)}>
                                                <Trash2 size="14" className="me-2" /> Supprimer
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                {/* Informations utilisateur */}
                                <div className="mb-3">
                                    {user.fonction && (
                                        <div className="d-flex align-items-center text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                            <Briefcase size="14" className="me-2 text-primary flex-shrink-0" />
                                            <span>{user.fonction}</span>
                                            {user.departement && <span className="ms-1">• {user.departement}</span>}
                                        </div>
                                    )}
                                    
                                    {user.email && (
                                        <div className="d-flex align-items-center text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                            <Mail size="14" className="me-2 text-primary flex-shrink-0" />
                                            <span className="text-truncate">{user.email}</span>
                                        </div>
                                    )}

                                    {user.telephone && (
                                        <div className="d-flex align-items-center text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                            <Phone size="14" className="me-2 text-primary flex-shrink-0" />
                                            <span>{user.telephone}</span>
                                        </div>
                                    )}

                                    {user.date_naissance && (
                                        <div className="d-flex align-items-center text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                            <Calendar size="14" className="me-2 text-primary flex-shrink-0" />
                                            <span>Né(e) le {formatDate(user.date_naissance)}</span>
                                        </div>
                                    )}

                                    {user.adresse && (
                                        <div className="d-flex align-items-start text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                            <MapPin size="14" className="me-2 text-primary flex-shrink-0 mt-1" />
                                            <span className="lh-sm">{user.adresse}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="flex-grow-1 rounded-3 d-flex align-items-center justify-content-center"
                                        onClick={() => handleOpenPrivilegeModal(user._id)}
                                    >
                                        <Shield size="14" className="me-2" />
                                        Privilèges ({getUserPrivilegesCount(user._id)})
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* État vide */}
            {filteredUsers.length === 0 && (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <UserIcon size="48" className="text-muted" />
                    </div>
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
                            <Plus size="18" className="me-2" />
                            Créer un utilisateur
                        </Button>
                    )}
                </div>
            )}

            {/* MODAL UTILISATEUR */}
            <Modal show={showUserModal} onHide={handleCloseUserModal} centered backdrop="static" size="lg">
                <Modal.Header closeButton className="border-0 pb-2" style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #e8f8f0 100%)' }}>
                    <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-success rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px' }}>
                            {currentUser ? <Edit size="20" color="white" /> : <Plus size="20" color="white" />}
                        </div>
                        {currentUser ? 'Éditer l\'utilisateur' : 'Nouvel utilisateur'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmitUser}>
                    <Modal.Body className="py-4">
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Nom d'utilisateur *
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        name="username" 
                                        defaultValue={currentUser?.username} 
                                        required 
                                        placeholder="Ex: John Doe"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Matricule *
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        name="matricule" 
                                        defaultValue={currentUser?.matricule} 
                                        required 
                                        placeholder="Ex: EMP001"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Email
                                    </Form.Label>
                                    <Form.Control 
                                        type="email"
                                        className="border rounded-3 py-3 px-3" 
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
                                        className="border rounded-3 py-3 px-3" 
                                        name="telephone" 
                                        defaultValue={currentUser?.telephone} 
                                        placeholder="+33 1 23 45 67 89"
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
                                        className="border rounded-3 py-3 px-3" 
                                        name="fonction" 
                                        defaultValue={currentUser?.fonction} 
                                        placeholder="Ex: Développeur"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Département
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        name="departement" 
                                        defaultValue={currentUser?.departement} 
                                        placeholder="Ex: IT"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Sexe
                                    </Form.Label>
                                    <Form.Select 
                                        className="border rounded-3 py-3 px-3" 
                                        name="sexe" 
                                        defaultValue={currentUser?.sexe}
                                    >
                                        <option value="">Choisir...</option>
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Date de naissance
                                    </Form.Label>
                                    <Form.Control 
                                        type="date"
                                        className="border rounded-3 py-3 px-3" 
                                        name="date_naissance" 
                                        defaultValue={currentUser?.date_naissance ? new Date(currentUser.date_naissance).toISOString().split('T')[0] : ''}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Nationalité
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        name="nationalite" 
                                        defaultValue={currentUser?.nationalite} 
                                        placeholder="Ex: Française"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Lieu de naissance
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        name="lieu_naissance" 
                                        defaultValue={currentUser?.lieu_naissance} 
                                        placeholder="Ex: Paris, France"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Adresse
                                    </Form.Label>
                                    <Form.Control 
                                        as="textarea"
                                        rows={2}
                                        className="border rounded-3 py-3 px-3" 
                                        name="adresse" 
                                        defaultValue={currentUser?.adresse} 
                                        placeholder="Adresse complète"
                                        style={{ resize: 'none' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0 pb-4">
                        <div className="d-flex gap-3 w-100 flex-column flex-md-row">
                            <Button 
                                variant="light" 
                                onClick={handleCloseUserModal}
                                className="rounded-3 px-4 py-2 flex-grow-1 flex-md-grow-0"
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="rounded-3 px-4 py-2 flex-grow-1 flex-md-grow-0"
                                style={{ 
                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                    border: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        Enregistrement...
                                    </>
                                ) : (
                                    currentUser ? 'Mettre à jour' : 'Créer l\'utilisateur'
                                )}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* MODAL PRIVILÈGES */}
            <Modal show={showPrivilegeModal} onHide={handleClosePrivilegeModal} centered backdrop="static" size="xl">
                <Modal.Header closeButton className="border-0 pb-2" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)' }}>
                    <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-warning rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px' }}>
                            <Shield size="20" color="white" />
                        </div>
                        Gestion des Privilèges
                        {selectedUserId && (
                            <Badge bg="light" className="text-muted ms-2">
                                {users.find(u => u._id === selectedUserId)?.username}
                            </Badge>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4">
                    {/* Formulaire d'ajout de privilège */}
                    <Card className="border-0 bg-light mb-4">
                        <Card.Body className="p-3">
                            <h6 className="fw-bold mb-3 d-flex align-items-center">
                                <Plus size="16" className="me-2 text-success" />
                                Ajouter un nouveau privilège
                            </h6>
                            <Form onSubmit={handleSubmitPrivilege}>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Désignation *</Form.Label>
                                            <Form.Control 
                                                className="border rounded-3 py-2 px-3" 
                                                name="designation" 
                                                required 
                                                placeholder="Ex: Admin System"
                                            />
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
                                    <Col md={4} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Entreprises associées</Form.Label>
                                            <Form.Select 
                                                multiple
                                                className="border rounded-3 py-2 px-3" 
                                                name="entreprises"
                                                style={{ minHeight: '80px' }}
                                            >
                                                {enterprises.map(enterprise => (
                                                    <option key={enterprise._id} value={enterprise._id}>
                                                        {enterprise.designation}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Text className="text-muted small">
                                                Maintenez Ctrl pour sélectionner plusieurs entreprises
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="text-end">
                                    <Button 
                                        type="submit" 
                                        disabled={privilegeLoading}
                                        variant="success"
                                        className="rounded-3 px-4"
                                    >
                                        {privilegeLoading ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                Création...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size="16" className="me-2" />
                                                Créer le privilège
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Liste des privilèges existants */}
                    <div>
                        <h6 className="fw-bold mb-3 d-flex align-items-center">
                            <Shield size="16" className="me-2 text-primary" />
                            Privilèges existants ({userPrivileges.length})
                        </h6>
                        
                        {userPrivileges.length === 0 ? (
                            <Alert variant="info" className="text-center">
                                <AlertCircle size="24" className="mb-2" />
                                <p className="mb-0">Aucun privilège associé à cet utilisateur</p>
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
                                                            <Key size="16" className="me-2 text-warning" />
                                                            {privilege.designation}
                                                        </h6>
                                                        <div className="small text-muted mb-2">
                                                            <strong>Entreprises:</strong>
                                                            {privilege.entreprises?.length > 0 ? (
                                                                <div className="mt-1">
                                                                    {privilege.entreprises.map((ent, index) => (
                                                                        <Badge key={ent._id || index} bg="light" className="text-dark me-1 mb-1">
                                                                            <Building size="12" className="me-1" />
                                                                            {ent.designation}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted"> Aucune entreprise associée</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        className="rounded-3"
                                                        onClick={() => handleDeletePrivilege(privilege._id)}
                                                    >
                                                        <Trash2 size="14" />
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

export default UserManager;