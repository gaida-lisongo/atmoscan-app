'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Search, Cpu } from 'react-feather';
import useAuthStore from '@/stores/authStore';

const CapteursPage = () => {
    const { user } = useAuthStore();
    const currentPrivilege = user?.currentPrivilege?.designation || user?.privileges?.[0]?.designation;
    
    const [capteurs, setCapteurs] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentCapteur, setCurrentCapteur] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        designation: '',
        entrepriseId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [capteursRes, entreprisesRes] = await Promise.all([
                fetch('/api/capteurs'),
                fetch('/api/entreprises')
            ]);
            
            const capteursData = await capteursRes.json();
            const entreprisesData = await entreprisesRes.json();

            if (capteursData.success) setCapteurs(capteursData.data);
            if (entreprisesData.success) setEntreprises(entreprisesData.data);
        } catch (err) {
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setCurrentCapteur(null);
        setFormData({ designation: '', entrepriseId: '' });
        setError(null);
    };

    const handleShow = (capteur = null) => {
        if (capteur) {
            setCurrentCapteur(capteur);
            setFormData({
                designation: capteur.designation || '',
                entrepriseId: capteur.entrepriseId || ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const url = currentCapteur ? `/api/capteurs?id=${currentCapteur._id}` : '/api/capteurs';
            const method = currentCapteur ? 'PUT' : 'POST';

            // Ajouter automatiquement le type basé sur le privilège
            const dataToSend = {
                ...formData,
                type: currentPrivilege // DDD ou DEHPE
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const data = await res.json();

            if (data.success) {
                fetchData();
                handleClose();
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!currentCapteur) return;
        setSaving(true);

        try {
            const res = await fetch(`/api/capteurs?id=${currentCapteur._id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                fetchData();
                setShowDeleteModal(false);
                setCurrentCapteur(null);
            } else {
                setError(data.error || 'Erreur lors de la suppression');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setSaving(false);
        }
    };

    const getEntrepriseName = (entrepriseId) => {
        const ent = entreprises.find(e => e._id === entrepriseId);
        return ent?.designation || '-';
    };

    const filteredCapteurs = capteurs.filter(c =>
        c.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.uuid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Container fluid className="p-6">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-6">
            {/* Header */}
            <Row className="mb-4">
                <Col md={6}>
                    <h2 className="mb-1">
                        <Cpu size={28} className="me-2 text-primary" />
                        Gestion des Capteurs
                    </h2>
                    <p className="text-muted mb-0">Gérez vos capteurs environnementaux</p>
                </Col>
                <Col md={6} className="text-md-end">
                    <Button variant="primary" onClick={() => handleShow()}>
                        <Plus size={18} className="me-2" />
                        Nouveau Capteur
                    </Button>
                </Col>
            </Row>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Table Card */}
            <Card>
                <Card.Header className="bg-white py-3">
                    <Row className="align-items-center">
                        <Col md={4}>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <Search size={16} />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="border-start-0 bg-light"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={8} className="text-md-end">
                            <span className="text-muted">{filteredCapteurs.length} capteur(s)</span>
                        </Col>
                    </Row>
                </Card.Header>

                <Table responsive hover className="mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Désignation</th>
                            <th>UUID</th>
                            <th>Type</th>
                            <th>Entreprise</th>
                            <th>Date création</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCapteurs.map((capteur) => (
                            <tr key={capteur._id}>
                                <td className="fw-medium">{capteur.designation}</td>
                                <td>
                                    <code className="bg-light px-2 py-1 rounded">{capteur.uuid}</code>
                                </td>
                                <td>
                                    <Badge bg={capteur.type === 'DDD' ? 'success' : 'primary'}>{capteur.type}</Badge>
                                </td>
                                <td>{getEntrepriseName(capteur.entrepriseId)}</td>
                                <td>{new Date(capteur.createdAt).toLocaleDateString('fr-FR')}</td>
                                <td className="text-end">
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="me-1"
                                        onClick={() => handleShow(capteur)}
                                    >
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="text-danger"
                                        onClick={() => { setCurrentCapteur(capteur); setShowDeleteModal(true); }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredCapteurs.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                    Aucun capteur trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Modal Ajout/Édition */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{currentCapteur ? 'Modifier le capteur' : 'Nouveau capteur'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {/* Affichage du type automatique */}
                        <Alert variant="info" className="mb-3">
                            <small>
                                <strong>Type de capteur :</strong>{' '}
                                <Badge bg={currentPrivilege === 'DDD' ? 'success' : 'primary'}>
                                    {currentPrivilege || 'Non défini'}
                                </Badge>
                                <br />
                                <span className="text-muted">Le type est déterminé par votre privilège actuel</span>
                            </small>
                        </Alert>

                        <Form.Group className="mb-3">
                            <Form.Label>Désignation *</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                placeholder="Nom du capteur"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Entreprise *</Form.Label>
                            <Form.Select
                                required
                                value={formData.entrepriseId}
                                onChange={(e) => setFormData({ ...formData, entrepriseId: e.target.value })}
                            >
                                <option value="">Sélectionner une entreprise...</option>
                                {entreprises.map(ent => (
                                    <option key={ent._id} value={ent._id}>{ent.designation}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Annuler</Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? <Spinner size="sm" /> : 'Enregistrer'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir supprimer le capteur <strong>{currentCapteur?.designation}</strong> ?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
                    <Button variant="danger" onClick={handleDelete} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : 'Supprimer'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CapteursPage;
