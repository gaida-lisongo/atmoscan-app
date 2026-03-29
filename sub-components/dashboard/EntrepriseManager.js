'use client'
import Link from 'next/link';
import { Col, Row, Card, Button, Modal, Form, InputGroup, Badge, Dropdown } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Edit, Trash2, MapPin, Phone, Mail, Plus, Search, MoreVertical, Briefcase, Eye, Filter } from 'react-feather';

const EntrepriseManager = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentEntreprise, setCurrentEntreprise] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchEntreprises = async () => {
        try {
            const res = await fetch('/api/entreprises');
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (error) {
            console.error("Erreur de chargement", error);
        }
    };

    useEffect(() => { fetchEntreprises(); }, []);

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
            console.error("Erreur enregistrement", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Supprimer cette entreprise ?")) {
            await fetch(`/api/entreprises?id=${id}`, { method: 'DELETE' });
            setData(data.filter(item => item._id !== id));
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

    const filteredData = data.filter(ent => 
        ent.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-2 p-md-4 rounded shadow-sm">
            {/* EN-TETE RESPONSIVE */}
            <div className="mb-4">
                {/* Titre et description */}
                <div className="mb-3 mb-md-4">
                    <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-2">AtmoScan</h2>
                    <p className="text-muted mb-0 small">Annuaire des structures industrielles</p>
                </div>
                
                {/* Actions Header - Stack sur mobile */}
                <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 align-items-stretch align-items-md-center">
                    {/* Barre de recherche */}
                    <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                        <InputGroup className="bg-light rounded-3 border-0">
                            <InputGroup.Text className="bg-transparent border-0 ps-3">
                                <Search size="18" className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control 
                                className="bg-transparent border-0 ps-2 shadow-none"
                                placeholder="Rechercher une entreprise..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: '0.95rem' }}
                            />
                        </InputGroup>
                    </div>
                    
                    {/* Bouton d'action */}
                    <Button 
                        variant="primary" 
                        className="rounded-3 px-3 px-md-4 py-2 d-flex align-items-center justify-content-center fw-semibold" 
                        onClick={() => handleOpenModal()}
                        style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                    >
                        <Plus size="18" className="me-2"/> 
                        <span className="d-none d-sm-inline">Nouveau Partenaire</span>
                        <span className="d-inline d-sm-none">Ajouter</span>
                    </Button>
                </div>
                
                {/* Statistiques rapides */}
                <div className="mt-3 d-flex gap-3 text-muted small">
                    <div>
                        <Briefcase size="14" className="me-1" />
                        {data.length} entreprises
                    </div>
                    <div>
                        <Filter size="14" className="me-1" />
                        {filteredData.length} résultats
                    </div>
                </div>
            </div>

            {/* LISTE RESPONSIVE */}
            <Row className="g-2 g-md-3">
                {filteredData.map((item) => (
                    <Col xs={12} key={item._id} className="mb-2 mb-md-3">
                        <Card className="border-0 shadow-sm h-100 transition-all" 
                              style={{ 
                                  borderRadius: '16px',
                                  transition: 'all 0.3s ease',
                                  backgroundColor: '#fafbfc'
                              }}
                              onMouseEnter={(e) => {
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                              }}>
                            <Card.Body className="p-3 p-md-4">
                                {/* Layout Desktop */}
                                <Row className="align-items-center d-none d-md-flex">
                                    {/* Logo & Titre Desktop */}
                                    <Col md={4}>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-center fw-bold text-primary position-relative" 
                                                 style={{ 
                                                     width: '55px', 
                                                     height: '55px', 
                                                     minWidth: '55px',
                                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                     color: 'white'
                                                 }}>
                                                {item.designation.charAt(0).toUpperCase()}
                                                <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" 
                                                     style={{ width: '12px', height: '12px', border: '2px solid white' }}></div>
                                            </div>
                                            <div className="ms-3 overflow-hidden">
                                                <h5 className="mb-1 text-truncate fw-bold" style={{ fontSize: '1.1rem' }}>
                                                    <Link href={`/entreprises/${item._id}`} className="text-dark text-decoration-none">
                                                        {item.designation}
                                                    </Link>
                                                </h5>
                                                <Badge bg="light" className="text-primary fw-normal px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                    {item.categorie}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Infos de Contact Desktop */}
                                    <Col md={6}>
                                        <div className="d-flex flex-column gap-2 ps-3">
                                            <div className="d-flex align-items-center text-muted">
                                                <MapPin size="16" className="me-3 text-primary flex-shrink-0" />
                                                <span className="text-truncate" style={{ fontSize: '0.9rem' }}>
                                                    {item.adresse || 'Adresse non renseignée'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center text-muted">
                                                <Phone size="16" className="me-3 text-primary flex-shrink-0" />
                                                <span style={{ fontSize: '0.9rem' }}>
                                                    {item.telephone || 'Téléphone non renseigné'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center text-muted">
                                                <Mail size="16" className="me-3 text-primary flex-shrink-0" />
                                                <span className="text-truncate" style={{ fontSize: '0.9rem' }}>
                                                    {item.email || 'Email non renseigné'}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <div className="mt-2 pt-2 border-top">
                                                    <p className="text-muted mb-0 small lh-sm" style={{ fontSize: '0.85rem' }}>
                                                        {item.description.split('\n').map((line, index) => (
                                                            <span key={index}>
                                                                {line}
                                                                {index < item.description.split('\n').length - 1 && <br />}
                                                            </span>
                                                        ))}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </Col>

                                    {/* Actions Desktop */}
                                    <Col md={2} className="text-end">
                                        <div className="d-flex justify-content-end align-items-center gap-2">
                                            <Link href={`/entreprises/${item._id}`} 
                                                  className="btn btn-outline-primary btn-sm rounded-3 px-3 d-flex align-items-center">
                                                <Eye size="14" className="me-2" />
                                                Voir
                                            </Link>
                                            <Dropdown>
                                                <Dropdown.Toggle 
                                                    as="div" 
                                                    className="btn btn-light btn-sm rounded-3 d-flex align-items-center justify-content-center"
                                                    style={{ width: '36px', height: '36px', cursor: 'pointer' }}>
                                                    <MoreVertical size="16" className="text-muted" />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align="end" className="border-0 shadow-lg rounded-3">
                                                    <Dropdown.Item onClick={() => handleOpenModal(item)} className="d-flex align-items-center">
                                                        <Edit size="14" className="me-2 text-primary" /> Modifier
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item className="text-danger d-flex align-items-center" onClick={() => handleDelete(item._id)}>
                                                        <Trash2 size="14" className="me-2" /> Supprimer
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Layout Mobile */}
                                <div className="d-block d-md-none">
                                    {/* Header Mobile */}
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div className="d-flex align-items-center flex-grow-1">
                                            <div className="bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-center fw-bold text-white position-relative me-3" 
                                                 style={{ 
                                                     width: '45px', 
                                                     height: '45px', 
                                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                 }}>
                                                {item.designation.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="mb-1 text-truncate fw-bold" style={{ fontSize: '1rem' }}>
                                                    {item.designation}
                                                </h6>
                                                <Badge bg="light" className="text-primary fw-normal px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                    {item.categorie}
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
                                                <Dropdown.Item onClick={() => handleOpenModal(item)} className="d-flex align-items-center">
                                                    <Edit size="14" className="me-2 text-primary" /> Modifier
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item className="text-danger d-flex align-items-center" onClick={() => handleDelete(item._id)}>
                                                    <Trash2 size="14" className="me-2" /> Supprimer
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>

                                    {/* Informations Mobile */}
                                    <div className="mb-3">
                                        {item.adresse && (
                                            <div className="d-flex align-items-start text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                                <MapPin size="14" className="me-2 text-primary flex-shrink-0 mt-1" />
                                                <span className="lh-sm">{item.adresse}</span>
                                            </div>
                                        )}
                                        
                                        <div className="d-flex gap-4">
                                            {item.telephone && (
                                                <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <Phone size="14" className="me-2 text-primary" />
                                                    <span>{item.telephone}</span>
                                                </div>
                                            )}
                                            {item.email && (
                                                <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <Mail size="14" className="me-2 text-primary" />
                                                    <span className="text-truncate">{item.email}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {item.description && (
                                            <div className="mt-2 pt-2 border-top">
                                                <p className="text-muted mb-0 small lh-sm" style={{ fontSize: '0.8rem' }}>
                                                    {item.description.split('\n').map((line, index) => (
                                                        <span key={index}>
                                                            {line}
                                                            {index < item.description.split('\n').length - 1 && <br />}
                                                        </span>
                                                    ))}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Mobile */}
                                    <div className="d-grid">
                                        <Link href={`/entreprises/${item._id}`} 
                                              className="btn btn-primary rounded-3 py-2 d-flex align-items-center justify-content-center"
                                              style={{ 
                                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                  border: 'none'
                                              }}>
                                            <Eye size="16" className="me-2" />
                                            Consulter l'entreprise
                                        </Link>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* État vide */}
            {filteredData.length === 0 && (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <Briefcase size="48" className="text-muted" />
                    </div>
                    <h5 className="text-muted mb-2">
                        {searchTerm ? 'Aucun résultat trouvé' : 'Aucune entreprise enregistrée'}
                    </h5>
                    <p className="text-muted small mb-3">
                        {searchTerm 
                            ? `Aucune entreprise ne correspond à "${searchTerm}"` 
                            : 'Commencez par ajouter votre premier partenaire'
                        }
                    </p>
                    {!searchTerm && (
                        <Button 
                            variant="outline-primary" 
                            onClick={() => handleOpenModal()}
                            className="rounded-3 px-4"
                        >
                            <Plus size="18" className="me-2" />
                            Ajouter une entreprise
                        </Button>
                    )}
                </div>
            )}

            {/* MODAL MODERNISÉE */}
            <Modal show={showModal} onHide={handleClose} centered backdrop="static" size="lg">
                <Modal.Header closeButton className="border-0 pb-2" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)' }}>
                    <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px' }}>
                            {currentEntreprise ? <Edit size="20" color="white" /> : <Plus size="20" color="white" />}
                        </div>
                        {currentEntreprise ? 'Éditer l\'entreprise' : 'Nouveau partenaire'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="py-4">
                        <Row>
                            <Col md={12} className="mb-4">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Nom de l'entreprise *
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        name="designation" 
                                        defaultValue={currentEntreprise?.designation} 
                                        required 
                                        placeholder="Ex: Acme Corporation"
                                        style={{ 
                                            fontSize: '1rem',
                                            border: '1px solid #e9ecef',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Catégorie
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        name="categorie" 
                                        defaultValue={currentEntreprise?.categorie} 
                                        placeholder="Ex: Technologie"
                                        style={{ fontSize: '0.95rem', border: '1px solid #e9ecef' }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
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
                                        defaultValue={currentEntreprise?.telephone} 
                                        placeholder="Ex: +33 1 23 45 67 89"
                                        style={{ fontSize: '0.95rem', border: '1px solid #e9ecef' }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Email professionnel
                                    </Form.Label>
                                    <Form.Control 
                                        className="border rounded-3 py-3 px-3" 
                                        type="email" 
                                        name="email" 
                                        defaultValue={currentEntreprise?.email} 
                                        placeholder="contact@entreprise.com"
                                        style={{ fontSize: '0.95rem', border: '1px solid #e9ecef' }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Adresse du siège
                                    </Form.Label>
                                    <Form.Control 
                                        as="textarea"
                                        rows={2}
                                        className="border rounded-3 py-3 px-3" 
                                        name="adresse" 
                                        defaultValue={currentEntreprise?.adresse} 
                                        placeholder="123 Rue de l'Exemple, 75001 Paris, France"
                                        style={{ 
                                            fontSize: '0.95rem', 
                                            border: '1px solid #e9ecef',
                                            resize: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                                        Description de l'entreprise
                                    </Form.Label>
                                    <Form.Control 
                                        as="textarea"
                                        rows={4}
                                        className="border rounded-3 py-3 px-3" 
                                        name="description" 
                                        defaultValue={currentEntreprise?.description} 
                                        placeholder="Décrivez l'activité de l'entreprise, ses spécialités, ses valeurs...&#10;Vous pouvez utiliser plusieurs lignes pour structurer votre description."
                                        style={{ 
                                            fontSize: '0.95rem', 
                                            border: '1px solid #e9ecef',
                                            resize: 'vertical',
                                            minHeight: '100px'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                    />
                                    <Form.Text className="text-muted small">
                                        Utilisez les retours à la ligne pour structurer votre description
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0 pb-4">
                        <div className="d-flex gap-3 w-100 flex-column flex-md-row">
                            <Button 
                                variant="light" 
                                onClick={handleClose}
                                className="rounded-3 px-4 py-2 flex-grow-1 flex-md-grow-0"
                                style={{ fontWeight: '500' }}
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="rounded-3 px-4 py-2 flex-grow-1 flex-md-grow-0"
                                style={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                    currentEntreprise ? 'Mettre à jour' : 'Créer l\'entreprise'
                                )}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default EntrepriseManager;