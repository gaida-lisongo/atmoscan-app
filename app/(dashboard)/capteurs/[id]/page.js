'use client';

import { useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Search, Cpu, Eye, Download, Upload } from 'react-feather';
import useAuthStore from '@/stores/authStore';
import { useParams } from 'next/navigation';

const CapteursPage = () => {
    //fetching id from url
    const { id } = useParams();
    const { user } = useAuthStore();
    const currentPrivilege = user?.currentPrivilege?.entreprises || [];
    const userRole = user?.currentPrivilege?.role || user?.role || 'DDD'; // Fallback sur DDD
    console.log('Current Privilege =', currentPrivilege);
    
    const [capteurs, setCapteurs] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [currentCapteur, setCurrentCapteur] = useState(null);
    const [saving, setSaving] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        designation: '',
        entrepriseId: ''
    });

    useEffect(() => {
        if (currentPrivilege.length > 0) {
            fetchData();
        }
    }, [currentPrivilege]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [capteursRes, entreprisesRes] = await Promise.all([
                fetch('/api/capteurs'),
                fetch('/api/entreprises')
            ]);
            
            const capteursData = await capteursRes.json();
            const entreprisesData = await entreprisesRes.json();

            if (capteursData.success && entreprisesData.success) {
                // Extraire les IDs des entreprises autorisées
                const entrepriseIds = [id];
                
                // Filtrer les capteurs pour ne montrer que ceux des entreprises autorisées
                const capteursFiltres = capteursData.data.filter(capteur => 
                    entrepriseIds.includes(capteur.entrepriseId)
                );
                
                // Filtrer les entreprises pour ne montrer que celles autorisées
                const entreprisesFiltrees = entreprisesData.data.filter(entreprise => 
                    entrepriseIds.includes(entreprise._id)
                );

                setCapteurs(capteursFiltres);
                setEntreprises(entreprisesFiltrees);
            }
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

            // Ajouter automatiquement le type basé sur le rôle
            const dataToSend = {
                ...formData,
                type: userRole // DDD ou DEHPE
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

    // Fetch notifications for a capteur
    const fetchNotifications = async (capteur) => {
        setCurrentCapteur(capteur);
        setShowNotificationsModal(true);
        setLoadingNotifications(true);
        
        try {
            const res = await fetch(`/api/notifications?capteurId=${capteur._id}`);
            const data = await res.json();
            if (data.success) {
                // Vérification de sécurité : s'assurer que le capteur appartient à une entreprise autorisée
                const entrepriseIds = currentPrivilege.map(ent => ent._id);
                const capteurEntrepriseId = capteur.entrepriseId;
                
                if (entrepriseIds.includes(capteurEntrepriseId)) {
                    setNotifications(data.data || []);
                } else {
                    console.warn('Tentative d\'accès à des notifications non autorisées');
                    setNotifications([]);
                }
            } else {
                setNotifications([]);
            }
        } catch (err) {
            console.error('Erreur chargement notifications:', err);
            setNotifications([]);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Toggle selection
    const toggleSelectNotification = (id) => {
        setSelectedNotifications(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedNotifications.length === notifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(notifications.map(n => n._id));
        }
    };

    // Delete selected notifications
    const handleDeleteSelected = async () => {
        if (selectedNotifications.length === 0) return;
        if (!confirm(`Supprimer ${selectedNotifications.length} notification(s) ?`)) return;
        
        setDeleting(true);
        try {
            let deleted = 0;
            for (const id of selectedNotifications) {
                const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) deleted++;
            }
            
            setSelectedNotifications([]);
            await fetchNotifications(currentCapteur);
            
        } catch (err) {
            console.error('Erreur suppression:', err);
            setError('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    // Export notifications to CSV
    const exportToCSV = () => {
        if (notifications.length === 0) return;
        
        const headers = ['Date', 'Message', 'Nb Mesures', 'Lu'];
        const rows = notifications.map(n => [
            new Date(n.createdAt).toLocaleString('fr-FR'),
            n.message || '-',
            n.mesures?.length || 0,
            n.read ? 'Oui' : 'Non'
        ]);
        
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
        ].join('\n');
        
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `notifications_${currentCapteur?.designation || 'capteur'}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download template CSV
    const downloadTemplate = () => {
        const headers = ['message', 'read'];
        const exampleRows = [
            ['Exemple de notification 1', 'false'],
            ['Exemple de notification 2', 'true']
        ];
        
        const csvContent = [
            headers.join(';'),
            ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(';'))
        ].join('\n');
        
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_notifications.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Import notifications from CSV
    const handleImportCSV = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !currentCapteur) return;
        
        setImporting(true);
        
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                setError('Le fichier CSV doit contenir au moins une ligne de données');
                setImporting(false);
                return;
            }
            
            // Parse header
            const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim().toLowerCase());
            const messageIdx = headers.indexOf('message');
            const readIdx = headers.indexOf('read');
            
            if (messageIdx === -1) {
                setError('Colonne "message" manquante dans le fichier CSV');
                setImporting(false);
                return;
            }
            
            // Parse data rows
            const notificationsToCreate = [];
            for (let i = 1; i < lines.length; i++) {
                const cells = lines[i].split(';').map(c => c.replace(/"/g, '').trim());
                const message = cells[messageIdx];
                const read = readIdx !== -1 ? cells[readIdx]?.toLowerCase() === 'true' : false;
                
                if (message) {
                    notificationsToCreate.push({
                        capteurId: currentCapteur._id,
                        message,
                        read,
                        type: 'info',
                        statut: read ? 'lu' : 'non lu'
                    });
                }
            }
            
            if (notificationsToCreate.length === 0) {
                setError('Aucune notification valide trouvée dans le fichier');
                setImporting(false);
                return;
            }
            
            // Create notifications via API
            let created = 0;
            for (const notif of notificationsToCreate) {
                const res = await fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notif)
                });
                const data = await res.json();
                if (data.success) created++;
            }
            
            // Refresh notifications list
            await fetchNotifications(currentCapteur);
            alert(`${created} notification(s) importée(s) avec succès`);
            
        } catch (err) {
            console.error('Erreur import CSV:', err);
            setError('Erreur lors de l\'import du fichier CSV');
        } finally {
            setImporting(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Filtrage par recherche textuelle (les capteurs sont déjà filtrés par entreprise autorisée)
    const filteredCapteurs = capteurs.filter(c =>
        c.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.uuid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getEntrepriseName(c.entrepriseId).toLowerCase().includes(searchTerm.toLowerCase())
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
                {/* <Col md={6} className="text-md-end">
                    <Button variant="primary" onClick={() => handleShow()}>
                        <Plus size={18} className="me-2" />
                        Nouveau Capteur
                    </Button>
                </Col> */}
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
                                        title="Voir les notifications"
                                        onClick={() => fetchNotifications(capteur)}
                                    >
                                        <Eye size={14} className="text-info" />
                                    </Button>
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
                                <Badge bg={userRole === 'DDD' ? 'success' : 'primary'}>
                                    {userRole || 'Non défini'}
                                </Badge>
                                <br />
                                <span className="text-muted">Le type est déterminé par votre rôle actuel</span>
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

            {/* Modal Notifications */}
            <Modal 
                show={showNotificationsModal} 
                onHide={() => { setShowNotificationsModal(false); setNotifications([]); }} 
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Eye size={20} className="me-2 text-info" />
                        Notifications - {currentCapteur?.designation}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {loadingNotifications ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Chargement des notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-4">
                            <Eye size={48} className="text-muted mb-3" />
                            <p className="text-muted">Aucune notification pour ce capteur</p>
                        </div>
                    ) : (
                        <Table responsive hover size="sm">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <Form.Check 
                                            type="checkbox"
                                            checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Message</th>
                                    <th style={{ width: '100px' }}>Mesures</th>
                                    <th style={{ width: '80px' }}>Lu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map((notif, idx) => (
                                    <tr key={notif._id || idx} className={selectedNotifications.includes(notif._id) ? 'table-active' : ''}>
                                        <td>
                                            <Form.Check 
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notif._id)}
                                                onChange={() => toggleSelectNotification(notif._id)}
                                            />
                                        </td>
                                        <td>
                                            <div>{notif.message || '-'}</div>
                                            <small className="text-muted">
                                                {new Date(notif.createdAt).toLocaleString('fr-FR')}
                                            </small>
                                        </td>
                                        <td className="text-center">
                                            <Badge bg="secondary">
                                                {notif.mesures?.length || 0}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            {notif.read ? (
                                                <Badge bg="success">Lu</Badge>
                                            ) : (
                                                <Badge bg="warning" text="dark">Non lu</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">
                            {notifications.length} notification(s)
                        </span>
                        {selectedNotifications.length > 0 && (
                            <Button 
                                variant="danger" 
                                size="sm"
                                onClick={handleDeleteSelected}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <><Spinner size="sm" className="me-1" /> Suppression...</>
                                ) : (
                                    <><Trash2 size={14} className="me-1" /> Supprimer ({selectedNotifications.length})</>
                                )}
                            </Button>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {/* Hidden file input */}
                        {/* <input
                            type="file"
                            ref={fileInputRef}
                            accept=".csv"
                            onChange={handleImportCSV}
                            style={{ display: 'none' }}
                        />
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={downloadTemplate}
                            title="Télécharger le template CSV"
                        >
                            <Download size={14} className="me-1" />
                            Template
                        </Button> */}
                        {/* <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                        >
                            {importing ? (
                                <><Spinner size="sm" className="me-1" /> Import...</>
                            ) : (
                                <><Upload size={14} className="me-1" /> Importer</>
                            )}
                        </Button> */}
                        <Button 
                            variant="outline-success"
                            size="sm"
                            onClick={exportToCSV}
                            disabled={notifications.length === 0}
                        >
                            <Download size={14} className="me-1" />
                            Exporter
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => { setShowNotificationsModal(false); setNotifications([]); setSelectedNotifications([]); }}>
                            Fermer
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CapteursPage;
