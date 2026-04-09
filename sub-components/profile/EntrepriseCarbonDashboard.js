'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row,
    Spinner,
    Table
} from 'react-bootstrap';
import { Activity, Calendar, Cloud, DollarSign, Plus } from 'react-feather';
import { StatRightTopIcon } from 'widgets';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CARBON_PRICE_PER_TON = 5;

const getMonthInputValue = (date = new Date()) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
};

const formatNumber = (value, digits = 2) =>
    Number(value || 0).toLocaleString('fr-FR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });

const EntrepriseCarbonDashboard = ({ entreprise, sources = [] }) => {
    const [mesures, setMesures] = useState([]);
    const [co2eList, setCo2eList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(getMonthInputValue());
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualSourceId, setManualSourceId] = useState('');
    const [manualTimestamp, setManualTimestamp] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    });
    const [manualValues, setManualValues] = useState({});

    const dehpeSources = useMemo(
        () => sources.filter((source) => source.categorie === 'DEHPE'),
        [sources]
    );

    const selectedSource = useMemo(
        () => dehpeSources.find((source) => source._id === manualSourceId) || null,
        [dehpeSources, manualSourceId]
    );

    const fetchDashboardData = useCallback(async () => {
        if (!entreprise?._id) return;

        try {
            setLoading(true);
            setError('');

            const [mesuresRes, co2eRes] = await Promise.all([
                fetch(`/api/mesures?entrepriseId=${entreprise._id}`),
                fetch('/api/co2e')
            ]);

            const [mesuresJson, co2eJson] = await Promise.all([mesuresRes.json(), co2eRes.json()]);

            if (!mesuresJson.success) {
                throw new Error(mesuresJson.error || 'Erreur lors du chargement des mesures');
            }

            if (!co2eJson.success) {
                throw new Error(co2eJson.error || 'Erreur lors du chargement des équivalences CO2e');
            }

            setMesures(mesuresJson.data || []);
            setCo2eList(co2eJson.data || []);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement du dashboard carbone');
        } finally {
            setLoading(false);
        }
    }, [entreprise?._id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        if (dehpeSources.length > 0 && !manualSourceId) {
            setManualSourceId(dehpeSources[0]._id);
        }
    }, [dehpeSources, manualSourceId]);

    useEffect(() => {
        if (!selectedSource) {
            setManualValues({});
            return;
        }

        setManualValues((prev) => {
            const next = {};
            selectedSource.gaz.forEach((gaz) => {
                next[gaz._id] = prev[gaz._id] ?? '';
            });
            return next;
        });
    }, [selectedSource]);

    const analytics = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const co2eMap = new Map(
            co2eList.map((item) => [
                item.gaz?._id || item.gaz,
                {
                    facteurEmission: Number(item.facteurEmission || 0),
                    productRechauffement: Number(item.productRechauffement || 0)
                }
            ])
        );

        const sourceMap = new Map(dehpeSources.map((source) => [source._id, source]));
        const gasStats = new Map();
        let measurementCount = 0;

        mesures.forEach((mesure) => {
            const sourceId = mesure.sourceId?._id || mesure.sourceId;
            const source = sourceMap.get(sourceId);
            if (!source) return;

            const monthEntries = (mesure.ppm || []).filter((entry) => {
                const entryDate = new Date(entry.timestamp || mesure.createdAt);
                return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
            });

            if (monthEntries.length === 0) return;
            measurementCount += 1;

            monthEntries.forEach((entry) => {
                const gazId = entry.gaz?._id || entry.gaz;
                const gazMeta =
                    source.gaz.find((gaz) => gaz._id === gazId) ||
                    source.gaz.find((gaz) => gaz._id?.toString() === gazId?.toString()) ||
                    entry.gaz;

                if (!gazMeta) return;

                if (!gasStats.has(gazId)) {
                    gasStats.set(gazId, {
                        gazId,
                        gazName: gazMeta.designation || 'Gaz',
                        sourceName: source.designation,
                        totalPpm: 0,
                        count: 0
                    });
                }

                const item = gasStats.get(gazId);
                item.totalPpm += Number(entry.value || 0);
                item.count += 1;
            });
        });

        const perGas = Array.from(gasStats.values())
            .map((item) => {
                const avgPpm = item.count ? item.totalPpm / item.count : 0;
                const coeffs = co2eMap.get(item.gazId) || {
                    facteurEmission: 0,
                    productRechauffement: 0
                };
                const emissionKg = avgPpm * coeffs.facteurEmission;
                const emissionT = emissionKg * 0.001;
                
                const tco2e = emissionT * coeffs.productRechauffement;
                const coutCarbone = tco2e * CARBON_PRICE_PER_TON;

                return {
                    ...item,
                    avgPpm,
                    facteurEmission: coeffs.facteurEmission,
                    productRechauffement: coeffs.productRechauffement,
                    emissionKg,
                    emissionT,
                    tco2e,
                    coutCarbone
                };
            })
            .sort((a, b) => b.tco2e - a.tco2e);

        const totalTco2e = perGas.reduce((sum, item) => sum + item.tco2e, 0);
        const totalCost = totalTco2e * CARBON_PRICE_PER_TON;
        const averagePpm = perGas.length
            ? perGas.reduce((sum, item) => sum + item.avgPpm, 0) / perGas.length
            : 0;

        const recentRows = mesures
            .filter((mesure) => sourceMap.has(mesure.sourceId?._id || mesure.sourceId))
            .flatMap((mesure) =>
                (mesure.ppm || []).map((entry) => {
                    const sourceId = mesure.sourceId?._id || mesure.sourceId;
                    const source = sourceMap.get(sourceId);
                    const gazId = entry.gaz?._id || entry.gaz;
                    const gasLine = perGas.find((item) => item.gazId?.toString() === gazId?.toString());
                    const timestamp = new Date(entry.timestamp || mesure.createdAt);

                    return {
                        id: `${mesure._id}-${gazId}-${timestamp.toISOString()}`,
                        sourceName: source?.designation || '-',
                        gazName: gasLine?.gazName || entry.gaz?.designation || 'Gaz',
                        timestamp,
                        ppm: Number(entry.value || 0),
                        tco2e: gasLine ? gasLine.tco2e : 0,
                        coutCarbone: gasLine ? gasLine.coutCarbone : 0
                    };
                })
            )
            .filter((row) => row.timestamp.getFullYear() === year && row.timestamp.getMonth() + 1 === month)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 12);

        return {
            perGas,
            totalTco2e,
            totalCost,
            averagePpm,
            measurementCount,
            sourceCount: dehpeSources.length,
            recentRows
        };
    }, [co2eList, dehpeSources, mesures, selectedMonth]);

    const chartSeries = [
        {
            name: 'tCO2e',
            data: analytics.perGas.map((item) => Number(item.tco2e.toFixed(4)))
        },
        {
            name: 'Coût carbone',
            data: analytics.perGas.map((item) => Number(item.coutCarbone.toFixed(2)))
        }
    ];

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                borderRadius: 6
            }
        },
        colors: ['#198754', '#f59e0b'],
        dataLabels: { enabled: false },
        xaxis: {
            categories: analytics.perGas.map((item) => item.gazName),
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px'
                }
            }
        },
        yaxis: [
            {
                title: { text: 'tCO2e' }
            },
            {
                opposite: true,
                title: { text: 'Coût carbone' }
            }
        ],
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        },
        grid: {
            borderColor: '#eef2f7'
        }
    };

    const handleManualSubmit = async (event) => {
        event.preventDefault();
        if (!selectedSource) return;

        try {
            setSaving(true);
            setError('');

            const payload = {
                sourceId: selectedSource._id,
                entrepriseId: entreprise._id,
                ppm: selectedSource.gaz.map((gaz) => ({
                    gaz: gaz._id,
                    value: Number(manualValues[gaz._id] || 0),
                    timestamp: manualTimestamp
                }))
            };

            const response = await fetch('/api/mesures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Insertion manuelle impossible');
            }

            setShowManualModal(false);
            await fetchDashboardData();
        } catch (err) {
            setError(err.message || 'Erreur lors de la saisie manuelle');
        } finally {
            setSaving(false);
        }
    };

    const stats = [
        {
            id: 1,
            title: 'Sources DEHPE',
            value: analytics.sourceCount,
            icon: <Cloud size={18} className="text-primary" />,
            statInfo: '<span class="text-muted">Sources prises en compte</span>'
        },
        {
            id: 2,
            title: 'Mesures du mois',
            value: analytics.measurementCount,
            icon: <Calendar size={18} className="text-info" />,
            statInfo: '<span class="text-muted">Relevés consolidés</span>'
        },
        {
            id: 3,
            title: 'Total tCO2e',
            value: formatNumber(analytics.totalTco2e, 4),
            icon: <Activity size={18} className="text-success" />,
            statInfo: '<span class="text-muted">Moyenne mensuelle convertie</span>'
        },
        {
            id: 4,
            title: 'Coût carbone mensuel',
            value: `${formatNumber(analytics.totalCost, 2)} $`,
            icon: <DollarSign size={18} className="text-warning" />,
            statInfo: '<span class="text-muted">Base 15 par tonne CO2e</span>'
        }
    ];

    if (loading) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-6">
                    <Spinner animation="border" />
                </Card.Body>
            </Card>
        );
    }

    if (dehpeSources.length === 0) {
        return (
            <Alert variant="light" className="border shadow-sm">
                Aucune source de catégorie <strong>DEHPE</strong> n&apos;est associée à cette entreprise.
            </Alert>
        );
    }

    return (
        <>
            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                <div
                    className="px-4 px-lg-5 py-5 text-white"
                    style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #334155 55%, #475569 100%)'
                    }}
                >
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                        <div>
                            <Badge bg="light" text="dark" className="mb-3">
                                Dashboard Carbone DEHPE
                            </Badge>
                            <h3 className="mb-1 fw-bold" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>Analyse mensuelle des émissions et coûts carbone</h3>
                            <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
                                Calcul à partir de la moyenne du mois : ppm, émission en kg, émission en tonne,
                                tCO2e et coût carbone.
                            </p>
                        </div>
                        <div className="d-flex flex-column flex-sm-row gap-2">
                            <Form.Control
                                type="month"
                                value={selectedMonth}
                                onChange={(event) => setSelectedMonth(event.target.value)}
                                className="bg-white"
                            />
                            <Button
                                variant="light"
                                className="d-inline-flex align-items-center gap-2"
                                onClick={() => setShowManualModal(true)}
                            >
                                <Plus size={16} />
                                Saisie manuelle
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Row className="mb-2">
                {stats.map((item) => (
                    <Col xl={3} md={6} xs={12} className="mb-4" key={item.id}>
                        <StatRightTopIcon info={item} />
                    </Col>
                ))}
            </Row>

            <Row className="mb-4">
                <Col xl={8} xs={12} className="mb-4 mb-xl-0">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom">
                            <h4 className="mb-0">Répartition par gaz</h4>
                        </Card.Header>
                        <Card.Body>
                            {analytics.perGas.length > 0 ? (
                                <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    Aucune mesure DEHPE pour le mois sélectionné.
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={4} xs={12}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom">
                            <h4 className="mb-0">Synthèse métier</h4>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-4">
                                <div className="text-uppercase small fw-semibold text-muted mb-1">
                                    PPM moyen du mois
                                </div>
                                <div className="display-6 fw-bold text-dark">
                                    {formatNumber(analytics.averagePpm, 2)}
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="text-uppercase small fw-semibold text-muted mb-1">
                                    Formule de calcul
                                </div>
                                <div className="small text-muted">
                                    `kg = ppm x facteurEmission`, `t = kg x 0.001`, `tCO2e = t x
                                    productRechauffement`, `coût = tCO2e x 15`
                                </div>
                            </div>
                            <div className="border rounded-3 p-3 bg-light">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Total tCO2e</span>
                                    <strong>{formatNumber(analytics.totalTco2e, 4)}</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Coût carbone total</span>
                                    <strong>{formatNumber(analytics.totalCost, 2)} $</strong>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom">
                    <h4 className="mb-0">Calcul par gaz sur la moyenne du mois</h4>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Gaz</th>
                                <th>Source</th>
                                <th>PPM moyen</th>
                                <th>Facteur émission</th>
                                <th>PRG</th>
                                <th>Emission kg</th>
                                <th>Emission t</th>
                                <th>tCO2e</th>
                                <th>Coût carbone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.perGas.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-5 text-muted">
                                        Aucune donnée calculable pour ce mois.
                                    </td>
                                </tr>
                            ) : (
                                analytics.perGas.map((item) => (
                                    <tr key={item.gazId}>
                                        <td className="fw-semibold">{item.gazName}</td>
                                        <td>{item.sourceName}</td>
                                        <td>{formatNumber(item.avgPpm, 2)}</td>
                                        <td>{formatNumber(item.facteurEmission, 4)}</td>
                                        <td>{formatNumber(item.productRechauffement, 2)}</td>
                                        <td>{formatNumber(item.emissionKg, 4)}</td>
                                        <td>{formatNumber(item.emissionT, 6)}</td>
                                        <td>{formatNumber(item.tco2e, 6)}</td>
                                        <td>{formatNumber(item.coutCarbone, 2)} $</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                    <h4 className="mb-0">Dernières valeurs du mois</h4>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Source</th>
                                <th>Gaz</th>
                                <th>PPM saisi</th>
                                <th>Coût gaz</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.recentRows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-muted">
                                        Aucune valeur disponible sur le mois sélectionné.
                                    </td>
                                </tr>
                            ) : (
                                analytics.recentRows.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.timestamp.toLocaleString('fr-FR')}</td>
                                        <td>{row.sourceName}</td>
                                        <td>{row.gazName}</td>
                                        <td>{formatNumber(row.ppm, 2)}</td>
                                        <td>{formatNumber(row.coutCarbone, 2)} $</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showManualModal} onHide={() => setShowManualModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Saisie manuelle des mesures DEHPE</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleManualSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label>Source DEHPE</Form.Label>
                                <Form.Select
                                    value={manualSourceId}
                                    onChange={(event) => setManualSourceId(event.target.value)}
                                    required
                                >
                                    <option value="">Choisir une source</option>
                                    {dehpeSources.map((source) => (
                                        <option key={source._id} value={source._id}>
                                            {source.designation}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label>Date et heure</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={manualTimestamp}
                                    onChange={(event) => setManualTimestamp(event.target.value)}
                                    required
                                />
                            </Col>
                        </Row>

                        <hr />

                        {selectedSource ? (
                            <Row className="g-3">
                                {selectedSource.gaz.map((gaz) => (
                                    <Col md={6} key={gaz._id}>
                                        <Form.Label>{gaz.designation} (PPM)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={manualValues[gaz._id] ?? ''}
                                            onChange={(event) =>
                                                setManualValues((prev) => ({
                                                    ...prev,
                                                    [gaz._id]: event.target.value
                                                }))
                                            }
                                            required
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Alert variant="light" className="mb-0">
                                Sélectionner une source DEHPE pour saisir les gaz associés.
                            </Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowManualModal(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={saving || !selectedSource}>
                            {saving ? 'Enregistrement...' : 'Enregistrer la mesure'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default EntrepriseCarbonDashboard;
