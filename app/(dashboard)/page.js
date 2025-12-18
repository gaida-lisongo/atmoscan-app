'use client'
import { Fragment, useEffect, useState } from "react";
import { Container, Col, Row, Spinner } from 'react-bootstrap';
import { StatRightTopIcon } from "widgets";
import { EntrepriseManager, GazManager, TasksPerformance, SourcesChart, SourceManager } from "sub-components";
import ProjectsStatsData from "data/dashboard/ProjectsStatsData";

export const CustomLoader = () => (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f5f7fb' }}>
        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
        <h4 className="mt-3 text-primary fw-bold">Chargement du Dashboard...</h4>
    </div>
);

const Home = () => {
    const [sources, setSources] = useState([]);
    const [allGaz, setAllGaz] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        try {
            const [resS, resG] = await Promise.all([fetch('/api/sources'), fetch('/api/gaz')]);
            const sJson = await resS.json();
            const gJson = await resG.json();
            if (sJson.success) setSources(sJson.data);
            if (gJson.success) setAllGaz(gJson.data);
        } catch (error) { console.error("Fetch error", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { refreshData(); }, []);

    // --- Méthodes CRUD Sources ---
    const handleAddSource = async (data) => {
        const res = await fetch('/api/sources', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) refreshData();
    };

    const handleUpdateSource = async (id, data) => {
        const res = await fetch(`/api/sources?id=${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            const json = await res.json();
            refreshData();
            return json.data; // Retourne la source mise à jour pour la modale
        }
    };

    const handleDeleteSource = async (id) => {
        if (confirm("Supprimer cette source ?")) {
            await fetch(`/api/sources?id=${id}`, { method: 'DELETE' });
            refreshData();
        }
    };

    if (loading) return <CustomLoader />;

    return (
        <Fragment>
            <div className="bg-primary pt-10 pb-21"></div>
            <Container fluid className="mt-n22 px-6">
                <Row>
                    <Col xl={8} lg={8} md={12} xs={12}>
                        <Row>
                            {ProjectsStatsData.map((item, index) => (
                                <Col xl={6} lg={6} md={12} xs={12} className="mt-6" key={index}>
                                    <StatRightTopIcon info={item} />
                                </Col>
                            ))}
                        </Row>
                        <Col xl={12} lg={12} md={12} xs={12} className="mt-6">
                            <SourcesChart data={sources} />
                        </Col>
                    </Col>
                    <Col xl={4} lg={12} md={12} xs={12} className="mt-6">
                        {/* On remplace TasksPerformance par SourceManager si c'est ton souhait */}
                        <SourceManager 
                            sources={sources} 
                            allGaz={allGaz}
                            onAdd={handleAddSource}
                            onUpdate={handleUpdateSource}
                            onDelete={handleDeleteSource}
                        />
                    </Col>
                </Row>
                <Row className="my-6">
                    <Col xl={6} lg={6} md={12} xs={12}><EntrepriseManager /></Col>
                    <Col xl={6} lg={6} md={12} xs={12}><GazManager /></Col>
                </Row>
            </Container>
        </Fragment>
    );
}

export default Home;