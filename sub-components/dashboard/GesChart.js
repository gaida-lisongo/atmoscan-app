'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Card, Dropdown, Spinner, ProgressBar, Button, Badge } from 'react-bootstrap';
import { MoreVertical, Calendar, Info } from 'react-feather';

const GesChart = ({ sources = [], entrepriseId }) => {
    const [selectedSource, setSelectedSource] = useState(null);
    const [timeFilter, setTimeFilter] = useState('day');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!sources?.length) {
            setSelectedSource(null);
            return;
        }

        const currentStillExists = sources.some((source) => source._id === selectedSource?._id);
        if (!currentStillExists) {
            setSelectedSource(sources[0]);
        }
    }, [sources, selectedSource]);

    const fetchAverages = useCallback(async () => {
        if (!selectedSource?._id || !entrepriseId) {
            setData([]);
            return;
        }
        setLoading(true);

        try {
            const params = new URLSearchParams({
                sourceId: selectedSource._id,
                entrepriseId
            });
            const response = await fetch(`/api/mesures?${params.toString()}`);
            const json = await response.json();

            if (json.success && Array.isArray(json.data)) {
                const now = new Date();
                const stats = {};

                json.data.forEach(measure => {
                    measure.ppm?.forEach(p => {
                        const mDate = new Date(p.timestamp);
                        let isMatch = false;

                        if (timeFilter === 'day') {
                            isMatch = mDate.toDateString() === now.toDateString();
                        } else if (timeFilter === 'month') {
                            isMatch = mDate.getMonth() === now.getMonth() && mDate.getFullYear() === now.getFullYear();
                        } else if (timeFilter === 'quarter') {
                            const currentQuarter = Math.floor(now.getMonth() / 3);
                            const measureQuarter = Math.floor(mDate.getMonth() / 3);
                            isMatch = currentQuarter === measureQuarter && mDate.getFullYear() === now.getFullYear();
                        }

                        if (isMatch) {
                            const name = p.gaz?.designation;
                            if (name) {
                                if (!stats[name]) {
                                    stats[name] = { 
                                        total: 0, 
                                        count: 0, 
                                        max: p.gaz.indiceReferentiel?.dangereux || 1000 
                                    };
                                }
                                stats[name].total += p.value || 0;
                                stats[name].count += 1;
                            }
                        }
                    });
                });

                const formattedData = Object.keys(stats).map(name => ({
                    name,
                    average: parseFloat((stats[name].total / stats[name].count).toFixed(2)),
                    max: stats[name].max
                }));

                setData(formattedData);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Erreur filtrage:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedSource, timeFilter, entrepriseId]);

    useEffect(() => { fetchAverages(); }, [fetchAverages]);

    const getVariant = (val, max) => {
        const p = (val / max) * 100;
        if (p < 30) return "success";
        if (p < 70) return "warning";
        return "danger";
    };

    return (
        <Card className="h-100 shadow-sm border-0">
            <style>{`
                .vertical-progress-wrapper {
                    height: 250px;
                    width: 40px;
                    background-color: #f0f2f5;
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column-reverse; /* Remplit du bas vers le haut */
                    margin: 0 auto;
                }
                .vertical-progress-bar {
                    width: 100%;
                    transition: height 1.5s ease-in-out; /* Animation de remplissage */
                }
                .gauge-container {
                    text-align: center;
                    flex: 1;
                }
            `}</style>

            <Card.Header className="bg-white py-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="mb-0 fw-bold text-dark">Indicateurs {selectedSource?.categorie == 'DDD' ? 'GES' : 'POLLUANT'}</h5>
                        <small className="text-muted text-uppercase">{selectedSource?.designation}</small>
                    </div>
                    <Dropdown>
                        <Dropdown.Toggle as="button" className="btn btn-light btn-sm border-0">
                            <MoreVertical size="16" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            {sources.map(s => (
                                <Dropdown.Item key={s._id} onClick={() => setSelectedSource(s)}>{s.designation}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <div className="d-flex bg-light p-1 rounded">
                    {['day', 'month', 'quarter'].map((f) => (
                        <Button 
                            key={f}
                            variant={timeFilter === f ? 'white' : 'transparent'} 
                            size="sm" 
                            className={`flex-grow-1 border-0 shadow-none ${timeFilter === f ? 'shadow-sm fw-bold' : ''}`}
                            onClick={() => setTimeFilter(f)}
                        >
                            {f === 'day' ? 'Jour' : f === 'month' ? 'Mois' : 'Trimestre'}
                        </Button>
                    ))}
                </div>
            </Card.Header>

            <Card.Body className="d-flex align-items-end justify-content-around py-4">
                {loading ? (
                    <div className="w-100 text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : data.length > 0 ? (
                    data.map((item, index) => {
                        const percentage = Math.min((item.average / item.max) * 100, 100);
                        const variantColor = getVariant(item.average, item.max);
                        
                        return (
                            <div key={index} className="gauge-container px-2">
                                <div className="mb-2 fw-bold small">{item.average}</div>
                                <div className="vertical-progress-wrapper shadow-inner">
                                    <div 
                                        className={`vertical-progress-bar bg-${variantColor} ${percentage > 80 ? 'progress-bar-striped progress-bar-animated' : ''}`}
                                        style={{ height: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="mt-3 fw-bold text-uppercase" style={{ fontSize: '0.8rem' }}>{item.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>PPM</div>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-100 text-center py-5 text-muted">Aucune donnée</div>
                )}
            </Card.Body>

            <Card.Footer className="bg-white border-top-0 py-3">
                <div className="d-flex justify-content-around border rounded p-2 bg-light">
                    <div className="small"><Badge bg="success" className="me-1"> </Badge> Normal</div>
                    <div className="small"><Badge bg="warning" className="me-1"> </Badge> Modéré</div>
                    <div className="small"><Badge bg="danger" className="me-1"> </Badge> Dangereux</div>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default GesChart;
