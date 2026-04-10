'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Col, Row, Image, Modal, Button, Form, Table, InputGroup, Card, Badge } from 'react-bootstrap';
import { Upload, Trash2, Search, FileText, CheckCircle, Activity, Layers, Calendar, DollarSign } from 'react-feather';
import { computeMeasureCo2e, convertCo2eToTons, computeCarbonCost } from '@/lib/co2e';

const EntrepriseDetail = ({ entreprise, sources }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [mesures, setMesures] = useState([]);
    const [entrepriseMesures, setEntrepriseMesures] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

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

    const fetchEntrepriseMesures = async () => {
        if (!entreprise?._id) return;
        setSummaryLoading(true);
        try {
            const res = await fetch(`/api/mesures?entrepriseId=${entreprise._id}`);
            const json = await res.json();
            if (json.success) setEntrepriseMesures(json.data);
        } catch (error) {
            console.error("Erreur fetch mesures entreprise", error);
        } finally {
            setSummaryLoading(false);
        }
    };

    useEffect(() => {
        fetchEntrepriseMesures();
    }, [entreprise?._id]);

    // 2. Suppression d'une mesure
    const handleDeleteMesure = async (id) => {
        if (confirm("Supprimer ce relevé ?")) {
            await fetch(`/api/mesures?id=${id}`, { method: 'DELETE' });
            fetchMesures(selectedSource._id);
            fetchEntrepriseMesures();
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
            fetchEntrepriseMesures();
            alert("Importation réussie");
        };
        reader.readAsText(file);
    };

    // Filtrage par date (recherche texte sur la date formattée)
    const filteredMesures = mesures.filter(m => 
        new Date(m.createdAt).toLocaleString().includes(searchTerm)
    );

    const summary = useMemo(() => {
        const modules = {};
        const now = new Date();
        let monthTotal = 0;
        let monthCount = 0;

        entrepriseMesures.forEach((measure) => {
            const measureCo2e = computeMeasureCo2e(measure.ppm);
            const sourceId = measure.sourceId?._id || measure.sourceId;
            const sourceName = measure.sourceId?.designation || sources.find((item) => item._id === sourceId)?.designation || 'Module inconnu';

            if (!modules[sourceId]) {
                modules[sourceId] = {
                    id: sourceId,
                    designation: sourceName,
                    total: 0,
                    count: 0
                };
            }

            modules[sourceId].total += measureCo2e;
            modules[sourceId].count += 1;

            const referenceDate = measure.ppm?.[0]?.timestamp || measure.createdAt;
            const measureDate = new Date(referenceDate);
            if (
                measureDate.getMonth() === now.getMonth() &&
                measureDate.getFullYear() === now.getFullYear()
            ) {
                monthTotal += measureCo2e;
                monthCount += 1;
            }
        });

        const moduleAverages = Object.values(modules)
            .map((item) => ({
                ...item,
                average: item.count ? item.total / item.count : 0
            }))
            .sort((a, b) => b.average - a.average);

        const globalAverage = entrepriseMesures.length
            ? entrepriseMesures.reduce((total, measure) => total + computeMeasureCo2e(measure.ppm), 0) / entrepriseMesures.length
            : 0;

        return {
            globalAverage,
            monthTotal,
            monthAverage: monthCount ? monthTotal / monthCount : 0,
            monthCount,
            monthCarbonCost: computeCarbonCost(monthTotal),
            moduleAverages
        };
    }, [entrepriseMesures, sources]);

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
                        <Button variant="outline-primary" onClick={() => setShowModal(true)}>Mesures</Button>
                    </div>
                </div>
            </Col>

            <Col xl={12} className="mt-4">
                <Row className="g-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="icon-shape icon-md bg-primary bg-opacity-10 text-primary rounded-3">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <div className="text-muted text-uppercase small">CO₂e moyen global</div>
                                        <h3 className="mb-0">{convertCo2eToTons(summary.globalAverage).toFixed(2)} t</h3>
                                    </div>
                                </div>
                                <p className="text-muted mb-0">Moyenne calculée sur tous les relevés de l&apos;entreprise, convertie en tCO₂e.</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="icon-shape icon-md bg-success bg-opacity-10 text-success rounded-3">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="text-muted text-uppercase small">CO₂e du mois</div>
                                        <h3 className="mb-0">{convertCo2eToTons(summary.monthTotal).toFixed(2)} t</h3>
                                    </div>
                                </div>
                                <p className="text-muted mb-0">
                                    {summary.monthCount} relevé(s) ce mois-ci, moyenne mensuelle {convertCo2eToTons(summary.monthAverage).toFixed(2)} t.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="icon-shape icon-md bg-danger bg-opacity-10 text-danger rounded-3">
                                        <DollarSign size={18} />
                                    </div>
                                    <div>
                                        <div className="text-muted text-uppercase small">Coût carbone</div>
                                        <h3 className="mb-0">{summary.monthCarbonCost.toFixed(2)} $</h3>
                                    </div>
                                </div>
                                <p className="text-muted mb-0">Calcul du mois courant avec la formule tCO₂e × 5.</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="icon-shape icon-md bg-warning bg-opacity-10 text-warning rounded-3">
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <div className="text-muted text-uppercase small">Modules suivis</div>
                                        <h3 className="mb-0">{summary.moduleAverages.length}</h3>
                                    </div>
                                </div>
                                <p className="text-muted mb-0">Sources disposant d&apos;au moins un calcul CO₂e.</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xl={12}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h4 className="mb-1">CO₂e moyen par module</h4>
                                        <p className="text-muted mb-0">Déduit automatiquement à partir des relevés de chaque source.</p>
                                    </div>
                                    {summaryLoading && <Badge bg="light" text="dark">Chargement...</Badge>}
                                </div>

                                {summary.moduleAverages.length ? (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Module</th>
                                                    <th>Relevés</th>
                                                    <th>CO₂e moyen</th>
                                                    <th>CO₂e cumulé</th>
                                                    <th>Coût carbone</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.moduleAverages.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="fw-semibold">{item.designation}</td>
                                                        <td>{item.count}</td>
                                                        <td>{convertCo2eToTons(item.average).toFixed(2)} t</td>
                                                        <td>{convertCo2eToTons(item.total).toFixed(2)} t</td>
                                                        <td>{computeCarbonCost(item.total).toFixed(2)} $</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-muted">Aucune mesure exploitable pour calculer le CO₂e par module.</div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
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
                                            <th>CO₂e</th>
                                            <th className="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMesures.map((m) => {
                                            const co2e = computeMeasureCo2e(m.ppm);

                                            return (
                                                <tr key={m._id}>
                                                    <td className="align-middle">
                                                        {new Date(m.createdAt).toLocaleString('fr-FR')}
                                                    </td>
                                                    {selectedSource.gaz.map(g => {
                                                        const p = m.ppm.find(p => (p.gaz?._id || p.gaz) === g._id);

                                                        return <td key={g._id} className="align-middle">{p?.value || 'N/A'}</td>
                                                    })}
                                                    <td className='align-middle'>
                                                        {convertCo2eToTons(co2e).toFixed(2)} t
                                                    </td>
                                                    <td className="text-end">
                                                        <Button variant="link" className="text-danger" onClick={() => handleDeleteMesure(m._id)}>
                                                            <Trash2 size="16" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
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
