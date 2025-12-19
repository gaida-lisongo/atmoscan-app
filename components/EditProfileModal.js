'use client';

import { useState, useRef, useEffect } from 'react';
import { 
    Modal, 
    Button, 
    Form, 
    Tab, 
    Nav, 
    Row, 
    Col, 
    Image, 
    Spinner,
    Alert 
} from 'react-bootstrap';
import { User, Phone, Camera, MapPin } from 'react-feather';
import useAuthStore from '@/stores/authStore';

const EditProfileModal = ({ show, onHide }) => {
    const { user, updateProfile, loading } = useAuthStore();
    const fileInputRef = useRef(null);
    
    const [activeTab, setActiveTab] = useState('identity');
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [previewImage, setPreviewImage] = useState(null);
    
    // État du formulaire
    const [formData, setFormData] = useState({
        // Identité
        username: '',
        sexe: '',
        nationalite: '',
        lieu_naissance: '',
        date_naissance: '',
        // Coordonnées
        telephone: '',
        email: '',
        adresse: '',
        // Photo
        photoPath: ''
    });

    // Initialiser le formulaire avec les données utilisateur
    useEffect(() => {
        if (user && show) {
            setFormData({
                username: user.username || '',
                sexe: user.sexe || '',
                nationalite: user.nationalite || '',
                lieu_naissance: user.lieu_naissance || '',
                date_naissance: user.date_naissance ? new Date(user.date_naissance).toISOString().split('T')[0] : '',
                telephone: user.telephone || '',
                email: user.email || '',
                adresse: user.adresse || '',
                photoPath: user.photoPath || ''
            });
            setPreviewImage(user.photoPath || null);
            setMessage({ type: '', text: '' });
        }
    }, [user, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Upload de la photo
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Prévisualisation locale
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload vers le serveur
        setUploadingPhoto(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('userId', user._id);

            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formDataUpload
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, photoPath: data.data.photoPath }));
                setMessage({ type: 'success', text: 'Photo mise à jour avec succès!' });
                
                // Mettre à jour le store
                await updateProfile({ photoPath: data.data.photoPath });
            } else {
                setMessage({ type: 'danger', text: data.message || 'Erreur lors de l\'upload' });
                setPreviewImage(user.photoPath || null);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'danger', text: 'Erreur lors de l\'upload de la photo' });
            setPreviewImage(user.photoPath || null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Sauvegarder les modifications
    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const dataToSave = { ...formData };
            // Ne pas envoyer photoPath car c'est géré séparément
            delete dataToSave.photoPath;

            const result = await updateProfile(dataToSave);

            if (result.success) {
                setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
                setTimeout(() => {
                    onHide();
                }, 1500);
            } else {
                setMessage({ type: 'danger', text: result.error || 'Erreur lors de la mise à jour' });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">
                    <User size={24} className="me-2 text-primary" />
                    Modifier mon profil
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="pt-2">
                {message.text && (
                    <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                )}

                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                    <Nav variant="pills" className="nav-pills-soft mb-4">
                        <Nav.Item>
                            <Nav.Link eventKey="identity" className="d-flex align-items-center">
                                <User size={16} className="me-2" />
                                Identité
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="contact" className="d-flex align-items-center">
                                <Phone size={16} className="me-2" />
                                Coordonnées
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="photo" className="d-flex align-items-center">
                                <Camera size={16} className="me-2" />
                                Photo
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        {/* Tab Identité */}
                        <Tab.Pane eventKey="identity">
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Nom complet</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="Entrez votre nom complet"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Sexe</Form.Label>
                                        <Form.Select
                                            name="sexe"
                                            value={formData.sexe}
                                            onChange={handleChange}
                                        >
                                            <option value="">Sélectionner...</option>
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Nationalité</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nationalite"
                                            value={formData.nationalite}
                                            onChange={handleChange}
                                            placeholder="Ex: Congolaise"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Date de naissance</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="date_naissance"
                                            value={formData.date_naissance}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Lieu de naissance</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lieu_naissance"
                                            value={formData.lieu_naissance}
                                            onChange={handleChange}
                                            placeholder="Ex: Kinshasa"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Tab.Pane>

                        {/* Tab Coordonnées */}
                        <Tab.Pane eventKey="contact">
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <Phone size={14} className="me-1" />
                                            Téléphone
                                        </Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="telephone"
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            placeholder="+243 XXX XXX XXX"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="votre@email.com"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <MapPin size={14} className="me-1" />
                                            Adresse
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="adresse"
                                            value={formData.adresse}
                                            onChange={handleChange}
                                            placeholder="Votre adresse complète..."
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Tab.Pane>

                        {/* Tab Photo */}
                        <Tab.Pane eventKey="photo">
                            <div className="text-center">
                                <div 
                                    className="position-relative d-inline-block mb-4"
                                    style={{ cursor: 'pointer' }}
                                    onClick={handlePhotoClick}
                                >
                                    <div 
                                        className="rounded-circle overflow-hidden border border-4 border-primary"
                                        style={{ width: '180px', height: '180px' }}
                                    >
                                        {uploadingPhoto ? (
                                            <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                                <Spinner animation="border" variant="primary" />
                                            </div>
                                        ) : previewImage ? (
                                            <Image 
                                                src={previewImage} 
                                                alt="Photo de profil" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                                <User size={80} className="text-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <div 
                                        className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '45px', height: '45px', border: '3px solid white' }}
                                    >
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </div>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                />
                                
                                <p className="text-muted mb-2">
                                    Cliquez sur l'image pour changer votre photo de profil
                                </p>
                                <small className="text-muted">
                                    Formats acceptés: JPG, PNG, GIF, WEBP (max 5MB)
                                </small>
                            </div>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>

            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onHide} disabled={saving}>
                    Annuler
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={saving || loading}
                >
                    {saving ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Enregistrement...
                        </>
                    ) : (
                        'Enregistrer les modifications'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProfileModal;
