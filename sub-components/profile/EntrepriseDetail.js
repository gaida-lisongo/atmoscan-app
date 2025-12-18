'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Col, Row, Image, Modal, Button, Form, Table, InputGroup } from 'react-bootstrap';
import { Upload, Trash2, Search, FileText, CheckCircle } from 'react-feather';

const EntrepriseDetail = ({ entreprise, sources }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [mesures, setMesures] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // 1. Fetch des mesures quand une source est sélectionnée
    const fetchMesures = async (sourceId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mesures?sourceId=${sourceId}`);
            const json = await res.json();
            if (json.success) setMesures(json.data);
        } catch (error) { console.error("Erreur fetch mesures", error); }
        finally { setLoading(false); }
    };

    const handleSourceChange = (e) => {
        const sourceId = e.target.value;
        const source = sources.find(s => s._id === sourceId);
        setSelectedSource(source);
        if (sourceId) fetchMesures(sourceId);
    };

    // 2. Suppression d'une mesure
    const handleDeleteMesure = async (id) => {
        if (confirm("Supprimer ce relevé ?")) {
            await fetch(`/api/mesures?id=${id}`, { method: 'DELETE' });
            fetchMesures(selectedSource._id);
        }
    };

    // 3. Génération du Template CSV
    const downloadTemplate = () => {
        if (!selectedSource) return;
        const now = new Date().toISOString();
        // Header: Timestamp, Nom du Gaz 1, Nom du Gaz 2...
        const headers = ["timestamp", ...selectedSource.gaz.map(g => g.designation)].join(";");
        const row = [now, ...selectedSource.gaz.map(() => "0")].join(";");
        const blob = new Blob([`${headers}\n${row}`], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${selectedSource.designation}.csv`;
        a.click();
    };

    // 4. Parsing et Importation CSV
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedSource) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            const lines = content.split('\n');
            const headers = lines[0].split(/[;,]/); // Support virgule et point-virgule
            
            const payload = [];
            // On ignore la première ligne (headers)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const cols = lines[i].split(/[;,]/);
                
                const ppmData = selectedSource.gaz.map(gas => {
                    const gasIndex = headers.findIndex(h => h.trim() === gas.designation);
                    return {
                        gaz: gas._id,
                        value: parseFloat(cols[gasIndex]) || 0,
                        timestamp: cols[0] // Première colonne = timestamp
                    };
                });

                payload.push({
                    sourceId: selectedSource._id,
                    entrepriseId: entreprise._id,
                    ppm: ppmData
                });
            }

            // Envoi groupé (POST pour chaque ligne ou adapter l'API pour un array)
            for (const item of payload) {
                await fetch('/api/mesures', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            }
            fetchMesures(selectedSource._id);
            alert("Importation réussie");
        };
        reader.readAsText(file);
    };

    // Filtrage par date (recherche texte sur la date formattée)
    const filteredMesures = mesures.filter(m => 
        new Date(m.createdAt).toLocaleString().includes(searchTerm)
    );

    return (
        <Row className="align-items-center">
            <Col xl={12}>
                <div 
                  className="rounded-top shadow-sm" 
                  style={{ 
                      backgroundImage: 'url(/images/svg/banner.svg)', 
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: '220px', 
                      width: '100%'
                  }}
                ></div>
                <div className="bg-white rounded-bottom smooth-shadow-sm p-4">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <div className="avatar-xxl me-3 mt-n10">
                                <Image 
                                  src={`/images/${entreprise?.designation}.png`} 
                                  onError={(e) => {
                                    if (e.target.src.includes('.png')) {
                                        e.target.src = `/images/${entreprise?.designation}.jpg`;
                                    } else if (e.target.src.includes('.jpg')) {
                                        // Si le JPG échoue aussi, on met un avatar par défaut
                                        e.target.src = `/images/${entreprise?.designation}.png`;
                                    }
                                  }}
                                  className="rounded-circle border border-4 border-white" 
                                  width="120" 
                                />
                            </div>
                            <div className="lh-1">
                                <h2 className="mb-0">{entreprise?.designation} <CheckCircle size="20" className="text-primary" /></h2>
                                <p className="mb-0 text-muted">{entreprise?.categorie}</p>
                            </div>
                        </div>
                        <Button variant="outline-primary" onClick={() => setShowModal(true)}>Mésures</Button>
                    </div>
                </div>
            </Col>

            {/* MODALE GESTION DES MESURES */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Gestion des Relevés - {entreprise?.designation}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Label className="fw-bold">1. Sélectionner la Source</Form.Label>
                            <Form.Select onChange={handleSourceChange} value={selectedSource?._id || ""}>
                                <option value="">Choisir une source...</option>
                                {sources.map(s => <option key={s._id} value={s._id}>{s.designation} ({s.categorie})</option>)}
                            </Form.Select>
                        </Col>
                        {selectedSource && (
                            <Col md={6} className="d-flex align-items-end">
                                <Button variant="success" className="me-2" onClick={downloadTemplate}>
                                    <FileText size="16" /> Template CSV
                                </Button>
                                <Form.Group>
                                    <Form.Label className="btn btn-primary mb-0">
                                        <Upload size="16" /> Importer CSV
                                        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
                                    </Form.Label>
                                </Form.Group>
                            </Col>
                        )}
                    </Row>

                    {selectedSource ? (
                        <>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Historique des mesures</h5>
                                <InputGroup className="w-25">
                                    <InputGroup.Text><Search size="14"/></InputGroup.Text>
                                    <Form.Control 
                                        placeholder="Rechercher par date..." 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </div>

                            <div className="table-responsive" style={{maxHeight: '400px'}}>
                                <Table hover className="text-nowrap">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date & Heure</th>
                                            {selectedSource.gaz.map(g => <th key={g._id}>{g.designation} (PPM)</th>)}
                                            <th className="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMesures.map((m) => (
                                            <tr key={m._id}>
                                                <td className="align-middle">
                                                    {new Date(m.createdAt).toLocaleString('fr-FR')}
                                                </td>
                                                {selectedSource.gaz.map(g => {
                                                    const p = m.ppm.find(p => (p.gaz?._id || p.gaz) === g._id);
                                                    return <td key={g._id} className="align-middle">{p?.value || 'N/A'}</td>
                                                })}
                                                <td className="text-end">
                                                    <Button variant="link" className="text-danger" onClick={() => handleDeleteMesure(m._id)}>
                                                        <Trash2 size="16" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {filteredMesures.length === 0 && <p className="text-center py-4 text-muted">Aucun relevé trouvé.</p>}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <Image src="/images/svg/data-report.svg" height="100" className="mb-3" />
                            <p className="text-muted">Veuillez sélectionner une source pour gérer les mesures.</p>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Row>
    );
};

export default EntrepriseDetail;