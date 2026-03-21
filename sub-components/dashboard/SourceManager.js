'use client'
import React, { useState } from "react";
import { Card, Table, Button, Modal, Form, Badge, ListGroup, Row, Col, Nav } from 'react-bootstrap';
import { Trash, Eye, Plus, Folder } from 'react-feather';
import useAuthStore from '@/stores/authStore';

const SourceManager = ({ sources, allGaz, onAdd, onUpdate, onDelete }) => {
    const [filter, setFilter] = useState('ALL');
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentSource, setCurrentSource] = useState(null);
    const { user } = useAuthStore();

    // Fonction pour récupérer l'objet Gaz complet à partir d'un ID ou d'un objet partiel
    // Cela garantit l'affichage immédiat du nom sans attendre le refresh backend
    const getFullGazInfo = (gazRef) => {
        const id = typeof gazRef === 'object' ? gazRef._id : gazRef;
        return allGaz.find(g => g._id === id) || gazRef;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            designation: formData.get('designation'),
            categorie: formData.get('categorie')
        };
        if (currentSource) {
            await onUpdate(currentSource._id, data);
        } else {
            await onAdd(data);
        }
        setShowSourceModal(false);
    };

    const filteredSources = filter === 'ALL' ? sources : sources.filter(s => s.categorie === filter);

    return (
        <Card className="h-100 shadow-sm">
            {/* 1. Menu des catégories et Bouton Ajouter */}
            <Card.Header className="bg-white border-bottom-0 pt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Gestion des Sources</h4>
                    <Button variant="primary" className="d-flex align-items-center" onClick={() => { setCurrentSource(null); setShowSourceModal(true); }}>
                        <Plus size="18px" className="me-1" /> Ajouter une source
                    </Button>
                </div>
                
                <Nav variant="tabs" activeKey={filter} onSelect={(k) => setFilter(k)}>
                {
                    user?.currentPrivilege?.designation ? (
                        <Nav.Item>
                            <Nav.Link eventKey={user.currentPrivilege.designation}>{`Sources ${user.currentPrivilege.designation}`}</Nav.Link>
                        </Nav.Item>
                    ) : null
                }
                </Nav>
            </Card.Header>

            {/* 2. Corps : Liste des sources */}
            <Card.Body className="p-0">
                <Table responsive hover className="text-nowrap mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Désignation</th>
                            <th>Type</th>
                            <th className="text-end px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSources.map((source) => (
                            <tr key={source._id}>
                                <td className="align-middle fw-bold">
                                    <Folder size="14px" className="me-2 text-muted" />
                                    {source.designation}
                                    (ID: {source._id}) {/* Affichage d'une partie de l'ID pour différencier les sources */}
                                </td>
                                <td className="align-middle">
                                    <Badge bg={source.categorie === 'DDD' ? 'info' : 'warning'}>
                                        {source.categorie}
                                    </Badge>
                                </td>
                                <td className="align-middle text-end px-4">
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setCurrentSource(source); setShowDetailModal(true); }}>
                                        <Eye size="14px" />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(source._id)}>
                                        <Trash size="14px" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {filteredSources.length === 0 && (
                    <div className="text-center py-5">
                        <p className="text-muted">Aucune source trouvée pour cette catégorie.</p>
                    </div>
                )}
            </Card.Body>

            {/* MODALE : CRÉATION / ÉDITION SOURCE */}
            <Modal show={showSourceModal} onHide={() => setShowSourceModal(false)} centered>
                <Form onSubmit={handleFormSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{currentSource ? 'Modifier' : 'Nouvelle'} Source</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom de la source</Form.Label>
                            <Form.Control name="designation" defaultValue={currentSource?.designation} placeholder="ex: Cheminée Nord" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Catégorie réglementaire</Form.Label>
                            <Form.Select name="categorie" disabled defaultValue={currentSource?.categorie}>
                                <option value="DDD">DDD</option>
                                <option value="DEHPE">DEHPE</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="link" className="text-muted" onClick={() => setShowSourceModal(false)}>Annuler</Button>
                        <Button variant="primary" type="submit">Enregistrer</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* MODALE : DÉTAIL (Affectation des Gaz) */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Configuration des Gaz : {currentSource?.designation}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Row>
                        <Col md={6} className="border-end">
                            <h6 className="text-uppercase small fw-bold text-danger mb-3">Gaz émis par cette source</h6>
                            <ListGroup variant="flush">
                                {currentSource?.gaz?.map(gRef => {
                                    const g = getFullGazInfo(gRef);
                                    return (
                                        <ListGroup.Item key={g._id} className="d-flex justify-content-between align-items-center px-0 py-2">
                                            <div>
                                                <div className="fw-bold d-flex align-items-center justify-content-between">
                                                    <div>{g.designation}</div>
                                                    {"  -  "}<div>(ID: {g._id})</div>
                                                </div>
                                                <small className="text-muted">{g.categorie}</small>
                                            </div>
                                            <Button variant="soft-danger" size="sm" onClick={async () => {
                                                const updatedIds = currentSource.gaz.filter(x => (x._id || x) !== g._id).map(x => x._id || x);
                                                const updatedSource = await onUpdate(currentSource._id, { gaz: updatedIds });
                                                setCurrentSource(updatedSource); // Mise à jour immédiate de la modale
                                            }}><Trash size="14px" /></Button>
                                        </ListGroup.Item>
                                    );
                                })}
                                {(!currentSource?.gaz || currentSource.gaz.length === 0) && <p className="text-muted small italic">Aucun gaz affecté.</p>}
                            </ListGroup>
                        </Col>
                        <Col md={6} className="ps-md-4">
                            <h6 className="text-uppercase small fw-bold text-success mb-3">Ajouter un gaz disponible</h6>
                            <ListGroup variant="flush">
                                {allGaz.filter(g => !currentSource?.gaz?.some(sg => (sg._id || sg) === g._id)).map(g => (
                                    <ListGroup.Item key={g._id} className="d-flex justify-content-between align-items-center px-0 py-2">
                                        {g.designation}
                                        <Button variant="soft-success" size="sm" onClick={async () => {
                                            const currentIds = currentSource.gaz ? currentSource.gaz.map(x => x._id || x) : [];
                                            const updatedIds = [...currentIds, g._id];
                                            const updatedSource = await onUpdate(currentSource._id, { gaz: updatedIds });
                                            setCurrentSource(updatedSource); // Mise à jour immédiate de la modale
                                        }}><Plus size="14px" /></Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </Card>
    );
};

export default SourceManager;