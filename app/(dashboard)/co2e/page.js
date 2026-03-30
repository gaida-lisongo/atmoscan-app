'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Alert,
    Badge,
    Breadcrumb,
    Button,
    Card,
    Col,
    Container,
    Form,
    Modal,
    Row,
    Spinner,
    Table
} from 'react-bootstrap';
import { Activity, Cloud, Home, Plus, Trash2, Edit2 } from 'react-feather';
import { StatRightTopIcon } from 'widgets';

const defaultFormData = {
    gaz: '',
    facteurEmission: '',
    productRechauffement: ''
};

const Co2ePage = () => {
    const [items, setItems] = useState([]);
    const [gazList, setGazList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState(defaultFormData);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [co2eRes, gazRes] = await Promise.all([
                fetch('/api/co2e'),
                fetch('/api/gaz')
            ]);

            const [co2eJson, gazJson] = await Promise.all([co2eRes.json(), gazRes.json()]);

            if (!co2eJson.success) {
                throw new Error(co2eJson.error || 'Erreur lors du chargement des coefficients CO2e');
            }

            if (!gazJson.success) {
                throw new Error(gazJson.error || 'Erreur lors du chargement des gaz');
            }

            setItems(co2eJson.data || []);
            setGazList(gazJson.data || []);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredItems = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return items.filter((item) => {
            if (!term) return true;

            const designation = item.gaz?.designation?.toLowerCase() || '';
            const categorie = item.gaz?.categorie?.toLowerCase() || '';
            return designation.includes(term) || categorie.includes(term);
        });
    }, [items, searchTerm]);

    const metrics = useMemo(() => {
        const total = items.length;
        const avgFacteur = total
            ? (items.reduce((sum, item) => sum + Number(item.facteurEmission || 0), 0) / total).toFixed(2)
            : '0.00';
        const avgPrc = total
            ? (items.reduce((sum, item) => sum + Number(item.productRechauffement || 0), 0) / total).toFixed(2)
            : '0.00';

        return [
            {
                id: 1,
                title: 'Coefficients CO2e',
                value: total,
                icon: <Cloud size={18} className="text-primary" />,
                statInfo: '<span class="text-muted">Enregistrements disponibles</span>'
            },
            {
                id: 2,
                title: 'Facteur moyen',
                value: avgFacteur,
                icon: <Activity size={18} className="text-success" />,
                statInfo: '<span class="text-muted">Moyenne des facteurs d&apos;émission</span>'
            },
            {
                id: 3,
                title: 'PRG moyen',
                value: avgPrc,
                icon: <Activity size={18} className="text-info" />,
                statInfo: '<span class="text-muted">Moyenne des potentiels de réchauffement</span>'
            }
        ];
    }, [items]);

    const resetModalState = () => {
        setCurrentItem(null);
        setFormData(defaultFormData);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetModalState();
    };

    const handleShowModal = (item = null) => {
        setError('');
        setCurrentItem(item);
        setFormData(
            item
                ? {
                      gaz: item.gaz?._id || item.gaz || '',
                      facteurEmission: item.facteurEmission ?? '',
                      productRechauffement: item.productRechauffement ?? ''
                  }
                : defaultFormData
        );
        setShowModal(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                gaz: formData.gaz,
                facteurEmission: Number(formData.facteurEmission),
                productRechauffement: Number(formData.productRechauffement)
            };

            const endpoint = currentItem ? `/api/co2e?id=${currentItem._id}` : '/api/co2e';
            const method = currentItem ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Enregistrement impossible');
            }

            await fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.message || 'Erreur serveur');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!currentItem) return;

        setSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/co2e?id=${currentItem._id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || result.message || 'Suppression impossible');
            }

            await fetchData();
            setShowDeleteModal(false);
            resetModalState();
        } catch (err) {
            setError(err.message || 'Erreur serveur');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container fluid className="p-6">
            <Breadcrumb className="bg-light rounded-3 px-3 py-2 mb-4" style={{ fontSize: '0.9rem' }}>
                <Breadcrumb.Item linkAs={Link} href="/" className="d-flex align-items-center text-decoration-none">
                    <Home size={16} className="me-2" />
                    Accueil
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} href="/user/settings" className="text-decoration-none">
                    Configuration
                </Breadcrumb.Item>
                <Breadcrumb.Item active className="fw-semibold">
                    CO2e
                </Breadcrumb.Item>
            </Breadcrumb>

            <div className="border-bottom pb-4 mb-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                <div>
                    <h3 className="mb-1 fw-bold">Gestion des coefficients CO2e</h3>
                    <p className="mb-0 text-muted">
                        Référentiel des équivalences par gaz pour les calculs et les traitements métier.
                    </p>
                </div>
                <Button onClick={() => handleShowModal()} className="d-inline-flex align-items-center gap-2">
                    <Plus size={16} />
                    Nouveau coefficient
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-4">
                {metrics.map((metric) => (
                    <Col xl={4} md={6} xs={12} className="mb-4" key={metric.id}>
                        <StatRightTopIcon info={metric} />
                    </Col>
                ))}
            </Row>

            <Card>
                <Card.Header className="border-bottom">
                    <Row className="align-items-center g-3">
                        <Col lg={6}>
                            <h4 className="mb-0">Référentiel CO2e</h4>
                        </Col>
                        <Col lg={6}>
                            <Form.Control
                                placeholder="Rechercher par gaz ou catégorie"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="d-flex justify-content-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Gaz</th>
                                    <th>Catégorie</th>
                                    <th>Facteur d&apos;émission</th>
                                    <th>Potentiel de réchauffement</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5 text-muted">
                                            Aucun coefficient CO2e trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item._id}>
                                            <td className="fw-semibold">{item.gaz?.designation || '-'}</td>
                                            <td>
                                                <Badge bg="light" text="dark">
                                                    {item.gaz?.categorie || 'Non catégorisé'}
                                                </Badge>
                                            </td>
                                            <td>{item.facteurEmission}</td>
                                            <td>{item.productRechauffement}</td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleShowModal(item)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCurrentItem(item);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentItem ? 'Modifier un coefficient CO2e' : 'Ajouter un coefficient CO2e'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Gaz</Form.Label>
                            <Form.Select
                                value={formData.gaz}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, gaz: event.target.value }))
                                }
                                required
                            >
                                <option value="">Sélectionner un gaz</option>
                                {gazList.map((gaz) => (
                                    <option value={gaz._id} key={gaz._id}>
                                        {gaz.designation}
                                        {gaz.categorie ? ` - ${gaz.categorie}` : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Facteur d&apos;émission</Form.Label>
                            <Form.Control
                                type="number"
                                step="any"
                                min="0"
                                value={formData.facteurEmission}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        facteurEmission: event.target.value
                                    }))
                                }
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Potentiel de réchauffement</Form.Label>
                            <Form.Control
                                type="number"
                                step="any"
                                min="0"
                                value={formData.productRechauffement}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        productRechauffement: event.target.value
                                    }))
                                }
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={handleCloseModal}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Enregistrement...' : currentItem ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Supprimer le coefficient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Supprimer le coefficient CO2e associé à{' '}
                    <strong>{currentItem?.gaz?.designation || 'ce gaz'}</strong> ?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={saving}>
                        {saving ? 'Suppression...' : 'Supprimer'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Co2ePage;
