'use client'
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { Card, Table, Dropdown, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { MoreVertical, Plus, Trash, Edit, Activity } from 'react-feather';

const GazManager = () => {
    const [gazList, setGazList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentGaz, setCurrentGaz] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch initial des gaz
    const fetchGaz = async () => {
        try {
            const res = await fetch('/api/gaz');
            const json = await res.json();
            if (json.success) setGazList(json.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des gaz", error);
        }
    };

    useEffect(() => {
        fetchGaz();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setCurrentGaz(null);
    };

    const handleShow = (gaz = null) => {
        setCurrentGaz(gaz);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const data = {
            designation: formData.get('designation'),
            categorie: formData.get('categorie'),
            description: formData.get('description'),
            indiceReferentiel: {
                bon: Number(formData.get('bon')),
                modere: Number(formData.get('modere')),
                dangereux: Number(formData.get('dangereux'))
            }
        };

        try {
            const method = currentGaz ? 'PUT' : 'POST';
            const url = currentGaz ? `/api/gaz?id=${currentGaz._id}` : '/api/gaz';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                fetchGaz();
                handleClose();
            }
        } catch (error) {
            console.error("Erreur save gaz", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Voulez-vous supprimer ce gaz du référentiel ?")) {
            try {
                const res = await fetch(`/api/gaz?id=${id}`, { method: 'DELETE' });
                if (res.ok) setGazList(gazList.filter(g => g._id !== id));
            } catch (error) {
                console.error("Erreur suppression", error);
            }
        }
    };

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <Link
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            className="text-muted text-primary-hover">
            {children}
        </Link>
    ));
    CustomToggle.displayName = 'CustomToggle';

    const ActionMenu = ({ gaz }) => (
        <Dropdown>
            <Dropdown.Toggle as={CustomToggle}>
                <MoreVertical size="15px" className="text-muted" />
            </Dropdown.Toggle>
            <Dropdown.Menu align={'end'}>
                <Dropdown.Item onClick={() => handleShow(gaz)}>
                    <Edit size="14px" className="me-2" /> Modifier
                </Dropdown.Item>
                <Dropdown.Item className="text-danger" onClick={() => handleDelete(gaz._id)}>
                    <Trash size="14px" className="me-2" /> Supprimer
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );

    return (
        <Card className="h-100">
            <Card.Header className="bg-white py-4 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Référentiel des Gaz</h4>
                <Button variant="primary" size="sm" onClick={() => handleShow()}>
                    <Plus size="18px" /> Nouveau Gaz
                </Button>
            </Card.Header>
            <Table responsive className="text-nowrap">
                <thead className="table-light">
                    <tr>
                        <th>Désignation</th>
                        <th>Catégorie</th>
                        <th>Seuils (Bon/Mod/Dang)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {gazList.map((item) => (
                        <tr key={item._id}>
                            <td className="align-middle">
                                <div className="d-flex align-items-center">
                                    <div className="icon-shape icon-sm border rounded-circle bg-light text-primary me-3">
                                        <Activity size="15px" />
                                    </div>
                                    <div className="lh-1">
                                        <h5 className="mb-1">{item.designation}</h5>
                                        <p className="mb-0 text-muted small">{item.description?.substring(0, 30)}...</p>
                                        <span className="badge bg-secondary-soft text-secondary">ID: {item._id}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="align-middle">
                                <span className="badge bg-info-soft text-info">{item.categorie}</span>
                            </td>
                            <td className="align-middle">
                                <span className="text-success">{item.indiceReferentiel?.bon}</span> / 
                                <span className="text-warning mx-1">{item.indiceReferentiel?.modere}</span> / 
                                <span className="text-danger">{item.indiceReferentiel?.dangereux}</span> <small>ppm</small>
                            </td>
                            <td className="align-middle text-end">
                                <ActionMenu gaz={item} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal CRUD Gaz */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{currentGaz ? 'Modifier' : 'Ajouter'} un Gaz</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Désignation</Form.Label>
                            <Form.Control name="designation" defaultValue={currentGaz?.designation} placeholder="ex: CO2" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Catégorie</Form.Label>
                            <Form.Control name="categorie" defaultValue={currentGaz?.categorie} placeholder="ex: Gaz à effet de serre" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={2} name="description" defaultValue={currentGaz?.description} />
                        </Form.Group>
                        
                        <h6 className="border-bottom pb-2 mt-4">Seuils AQI (PPM)</h6>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-success small">Bon (Max)</Form.Label>
                                    <Form.Control type="number" name="bon" defaultValue={currentGaz?.indiceReferentiel?.bon} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-warning small">Modéré (Max)</Form.Label>
                                    <Form.Control type="number" name="modere" defaultValue={currentGaz?.indiceReferentiel?.modere} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-danger small">Dangereux (Min)</Form.Label>
                                    <Form.Control type="number" name="dangereux" defaultValue={currentGaz?.indiceReferentiel?.dangereux} required />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="white" onClick={handleClose}>Annuler</Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Envoi...' : 'Enregistrer'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Card>
    );
};

export default GazManager;