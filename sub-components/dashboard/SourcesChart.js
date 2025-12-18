'use client'
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { Card, Dropdown, Spinner } from 'react-bootstrap';
import { MoreVertical, BarChart2 } from 'react-feather';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const SourcesChart = ({ sources = [] }) => {
    // État pour la source sélectionnée (par défaut la première)
    const [selectedSource, setSelectedSource] = useState(null);

    useEffect(() => {
        if (sources.length > 0 && !selectedSource) {
            setSelectedSource(sources[0]);
        }
    }, [sources]);

    // Préparation des données pour l'histogramme
    const gazList = selectedSource?.gaz || [];
    const categories = gazList.map(g => g.designation || 'Gaz');
    
    // Séries : Seuils Bon (Vert), Modéré (Jaune), Dangereux (Rouge)
    // Note : On utilise les valeurs du référentiel Gaz
    const series = [
        {
            name: 'Seuil Bon',
            data: gazList.map(g => g.seuilBon || 400) // Valeur par défaut si non définie
        },
        {
            name: 'Seuil Modéré',
            data: gazList.map(g => g.seuilModere || 1000)
        },
        {
            name: 'Seuil Dangereux',
            data: gazList.map(g => g.seuilDangereux || 1500)
        }
    ];

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: { enabled: true, delay: 150 },
                dynamicAnimation: { enabled: true, speed: 350 }
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded',
                borderRadius: 4
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        colors: ['#28a745', '#ffc107', '#dc3545'], // Vert, Jaune, Rouge
        xaxis: {
            categories: categories,
            labels: { style: { colors: '#64748b', fontSize: '12px' } }
        },
        yaxis: {
            title: { text: 'Concentration (PPM)', style: { color: '#64748b' } }
        },
        fill: { opacity: 1 },
        tooltip: {
            y: { formatter: (val) => `${val} PPM` }
        },
        grid: { borderColor: '#f1f5f9' },
        legend: { position: 'top', horizontalAlign: 'right' }
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

    const ActionMenu = () => (
        <Dropdown>
            <Dropdown.Toggle as={CustomToggle}>
                <MoreVertical size="15px" className="text-muted" />
            </Dropdown.Toggle>
            <Dropdown.Menu align={'end'} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Dropdown.Header>Choisir une source</Dropdown.Header>
                {sources.map((source) => (
                    <Dropdown.Item 
                        key={source._id} 
                        onClick={() => setSelectedSource(source)}
                        active={selectedSource?._id === source._id}
                    >
                        {source.designation}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );

    if (!selectedSource) {
        return (
            <Card className="h-100 d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="primary" />
            </Card>
        );
    }

    return (
        <Card className="h-100 shadow-sm">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="mb-0">Seuils par Source</h4>
                        <p className="text-muted small mb-0">
                            Source actuelle : <span className="fw-bold text-primary">{selectedSource.designation}</span>
                        </p>
                    </div>
                    <ActionMenu />
                </div>

                <div className="mb-4">
                    <Chart
                        options={chartOptions}
                        series={series}
                        type="bar"
                        height={320}
                        width="100%"
                    />
                </div>

                <div className="d-flex align-items-center justify-content-around bg-light py-3 rounded">
                    <div className="text-center">
                        <div className="text-success small fw-bold text-uppercase">Sain</div>
                        <h3 className="mb-0 fw-bold">{gazList.length}</h3>
                        <p className="text-muted mb-0 small">Gaz suivis</p>
                    </div>
                    <div className="text-center">
                        <div className="text-warning small fw-bold text-uppercase">Type</div>
                        <h3 className="mb-0 fw-bold">{selectedSource.categorie}</h3>
                        <p className="text-muted mb-0 small">Réglementation</p>
                    </div>
                    <div className="text-center">
                        <BarChart2 size="24px" className="text-primary mt-2" />
                        <p className="text-muted mb-0 small mt-1">Comparatif</p>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SourcesChart;