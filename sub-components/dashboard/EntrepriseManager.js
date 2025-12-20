'use client'
import Link from 'next/link';
import { Card, Button, Modal, Form, InputGroup, Badge } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Edit, MapPin, Phone, Mail, Search, Briefcase, Eye, Filter } from 'react-feather';
import useAuthStore from '@/stores/authStore';

const EntrepriseManager = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentEntreprise, setCurrentEntreprise] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => { 
        setData(user?.currentPrivilege?.entreprises || []);
    }, [user]);

    // Fonction pour modifier seulement la description
    const handleUpdateDescription = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const description = formData.get('description');

        try {
            const res = await fetch(`/api/entreprises?id=${currentEntreprise._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
            if (res.ok) {
                // Mettre à jour localement
                setData(prevData => prevData.map(item => 
                    item._id === currentEntreprise._id 
                        ? { ...item, description }
                        : item
                ));
                handleClose();
            }
        } catch (error) {
            console.error("Erreur mise à jour description", error);
        } finally {
            setLoading(false);
        }
    };



    // Ouvrir modal seulement pour éditer description d'une entreprise existante
    const handleOpenModal = (entreprise) => {
        if (entreprise) {
            setCurrentEntreprise(entreprise);
            setShowModal(true);
        }
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
                    <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-2">Mes Entreprises</h2>
                    <p className="text-muted mb-0 small">Gestion des entreprises sous votre responsabilité</p>
                </div>
                
                {/* Actions Header - Stack sur mobile */}
                <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 align-items-stretch align-items-md-center">
                    {/* Barre de recherche */}
                    <div className="flex-grow-1">
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
                    {/* <Button 
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
                    </Button> */}
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

            {/* LISTE RESPONSIVE - PLEINE LARGEUR */}
            <div className="w-100">
                {filteredData.map((item) => (
                    <div key={item._id} className="mb-3">
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
                                {/* Layout Desktop - Pleine largeur */}
                                <div className="d-none d-md-flex align-items-center w-100">
                                    {/* Logo & Titre Desktop */}
                                    <div className="d-flex align-items-center" style={{minWidth: '300px', width: '25%'}}>
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
                                    </div>

                                    {/* Infos de Contact Desktop */}
                                    <div className="flex-grow-1 px-4">
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
                                    </div>

                                    {/* Actions Desktop */}
                                    <div className="d-flex align-items-center gap-2" style={{minWidth: '200px'}}>
                                        <Link href={`/entreprises/${item._id}`} 
                                              className="btn btn-outline-primary btn-sm rounded-3 px-3 d-flex align-items-center">
                                            <Eye size="14" className="me-2" />
                                            Voir
                                        </Link>
                                        <button 
                                            onClick={() => handleOpenModal(item)}
                                            className="btn btn-outline-secondary btn-sm rounded-3 px-3 d-flex align-items-center"
                                            title="Modifier la description">
                                            <Edit size="14" className="me-2" />
                                            Description
                                        </button>
                                    </div>
                                </div>

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
                                        
                                        <button 
                                            onClick={() => handleOpenModal(item)}
                                            className="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px' }}
                                            title="Modifier la description">
                                            <Edit size="14" className="text-muted" />
                                        </button>
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
                    </div>
                ))}
            </div>

            {/* État vide */}
            {filteredData.length === 0 && (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <Briefcase size="48" className="text-muted" />
                    </div>
                    <h5 className="text-muted mb-2">
                        {searchTerm ? 'Aucun résultat trouvé' : 'Aucune entreprise assignée'}
                    </h5>
                    <p className="text-muted small mb-3">
                        {searchTerm 
                            ? `Aucune entreprise ne correspond à "${searchTerm}"` 
                            : 'Aucune entreprise n\'est actuellement sous votre responsabilité'
                        }
                    </p>
                </div>
            )}

            {/* MODAL MODERNISÉE */}
            <Modal show={showModal} onHide={handleClose} centered backdrop="static" size="lg">
                <Modal.Header closeButton className="border-0 pb-2" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)' }}>
                    <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px' }}>
                            <Edit size="20" color="white" />
                        </div>
                        Modifier la description
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateDescription}>
                    <Modal.Body className="py-4">
                        {/* Informations en lecture seule */}
                        <div className="mb-4 p-3 bg-light rounded-3">
                            <h5 className="mb-3 fw-bold">{currentEntreprise?.designation}</h5>
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">Catégorie</small>
                                    <span>{currentEntreprise?.categorie || 'Non renseignée'}</span>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">Téléphone</small>
                                    <span>{currentEntreprise?.telephone || 'Non renseigné'}</span>
                                </div>
                                <div className="col-12 mb-2">
                                    <small className="text-muted d-block">Email</small>
                                    <span>{currentEntreprise?.email || 'Non renseigné'}</span>
                                </div>
                                <div className="col-12">
                                    <small className="text-muted d-block">Adresse</small>
                                    <span>{currentEntreprise?.adresse || 'Non renseignée'}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Champ modifiable : Description */}
                        <div className="mb-3">
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
                        </div>
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
                                    'Mettre à jour la description'
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