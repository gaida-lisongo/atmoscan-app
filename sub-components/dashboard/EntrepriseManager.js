'use client'
import Link from 'next/link';
import { ProgressBar, Col, Row, Card, Table, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const EntrepriseManager = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentEntreprise, setCurrentEntreprise] = useState(null); // null pour création, objet pour modification
    const [loading, setLoading] = useState(false);

    // Chargement des données
    const fetchEntreprises = async () => {
        try {
            const res = await fetch('/api/entreprises');
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (error) {
            console.error("Erreur de chargement", error);
        }
    };

    useEffect(() => {
        fetchEntreprises();
    }, []);

    // Gestion de la création / modification
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());

        const method = currentEntreprise ? 'PUT' : 'POST';
        const url = currentEntreprise ? `/api/entreprises?id=${currentEntreprise._id}` : '/api/entreprises';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchEntreprises();
                handleClose();
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Supprimer cette entreprise ?")) {
            try {
                await fetch(`/api/entreprises?id=${id}`, { method: 'DELETE' });
                setData(data.filter(item => item._id !== id));
            } catch (error) {
                console.error("Erreur de suppression", error);
            }
        }
    };

    const handleOpenModal = (entreprise = null) => {
        setCurrentEntreprise(entreprise);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setCurrentEntreprise(null);
    };

    // Filtrage pour la recherche
    const filteredData = data.filter(ent => 
        ent.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Row>
            <Col md={12} xs={12}>
                <Card>
                    <Card.Header className="bg-white py-4 d-flex align-items-center justify-content-between">
                        <h4 className="mb-0">Gestion des entreprises</h4>
                        <div className="d-flex gap-2">
                            <InputGroup>
                                <Form.Control 
                                    placeholder="Rechercher..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                            <Button variant="primary" onClick={() => handleOpenModal()}>+</Button>
                        </div>
                    </Card.Header>
                    <Table responsive className="text-nowrap mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Entreprise</th>
                                <th>Gaz (m³)</th>
                                <th>Pollution</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item._id}>
                                    <td className="align-middle">
                                        <div className="d-flex align-items-center">
                                            <div className="icon-shape icon-md border p-4 rounded-1 bg-light">
                                                <span className="text-primary fw-bold">{item.designation.charAt(0)}</span>
                                            </div>
                                            <div className="ms-3 lh-1">
                                                <h5 className="mb-1">
                                                    <Link href={`/entreprises/${item._id}`} className="text-inherit">
                                                        {item.designation}
                                                    </Link>
                                                </h5>
                                                <small className="text-muted">{item.categorie}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="align-middle text-dark">
                                        {/* Valeur numérique fictive ou issue de votre DB */}
                                        {Math.floor(Math.random() * 500)} m³
                                    </td>
                                    <td className="align-middle">
                                        {/* Exemple de barre de progression pollution */}
                                        <div className="float-start me-3">65%</div>
                                        <div className="mt-2">
                                            <ProgressBar now={65} variant="danger" style={{ height: '5px' }} />
                                        </div>
                                    </td>
                                    <td className="align-middle">
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-secondary" size="sm" onClick={() => handleOpenModal(item)}>
                                                Modifier
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item._id)}>
                                                Supprimer
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Col>

            {/* Modal de Création / Modification */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentEntreprise ? 'Modifier' : 'Ajouter'} une entreprise</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Désignation</Form.Label>
                            <Form.Control name="designation" defaultValue={currentEntreprise?.designation} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control name="adresse" defaultValue={currentEntreprise?.adresse} />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Téléphone</Form.Label>
                                    <Form.Control name="telephone" defaultValue={currentEntreprise?.telephone} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Catégorie</Form.Label>
                                    <Form.Control name="categorie" defaultValue={currentEntreprise?.categorie} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" defaultValue={currentEntreprise?.email} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Annuler</Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Row>
    );
};

export default EntrepriseManager;