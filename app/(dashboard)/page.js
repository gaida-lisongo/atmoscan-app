'use client'
import { Fragment, useEffect, useState, useMemo } from "react";
import { Container, Col, Row, Spinner } from 'react-bootstrap';
import { StatRightTopIcon } from "widgets";
import { Activity, Wind } from 'react-bootstrap-icons'; // Nouveaux icons
import { EntrepriseManager, GazManager, SourcesChart, SourceManager } from "sub-components";
import AdminQuickAccess from 'components/AdminQuickAccess';
import CustomLoader from 'components/CustomLoader';
import useAuthStore from '@/stores/authStore';

const Home = () => {
    // console.log('DashboardPage: Rendering');
    const [sources, setSources] = useState([]);
    const [allGaz, setAllGaz] = useState([]);
    const [loading, setLoading] = useState(true);   
    const { user } = useAuthStore();

    useEffect(() => {
        // console.log('DashboardPage: Mounted');
        // console.log('Utilisateur connecté:', user);
    }, []);

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

    // --- Calcul dynamique des Metrics (useMemo pour la performance) ---
    const metrics = useMemo(() => {

        if(!user) return [];

        const stats = {
            DDD: { sources: 0, gaz: 0 },
            DEHPE: { sources: 0, gaz: 0 }
        };



        sources.forEach(s => {
            if (stats[s.categorie]) {
                stats[s.categorie].sources += 1;
                stats[s.categorie].gaz += s.gaz?.length || 0;
            }
        });

        if (user?.currentPrivilege?.designation == 'DDD') {
            return [
                {
                    id: 1,
                    title: "Sources sous surveillance",
                    value: stats.DDD.sources ,
                    icon: <Activity size={18} className="text-info" />,
                    statInfo: `<span className="text-info me-2 fw-bold">${((stats.DDD.sources + stats.DEHPE.sources) ? (stats?.DDD?.sources * 100/(stats.DDD.sources + stats.DEHPE.sources)).toFixed(2) : 0)} %</span>`
                },
                {
                    id: 2,
                    title: "Emissions sous surveillance",
                    value: stats.DDD?.gaz || 0,
                    icon: <Wind size={18} className="text-success" />,
                    statInfo: `<span className="text-success me-2 fw-bold">${((stats.DDD.gaz + stats.DEHPE.gaz) ? (stats?.DDD?.gaz * 100/(stats.DDD.gaz + stats.DEHPE.gaz)).toFixed(2) : 0)} %</span>`
                }
            ]
        } else {

            return [
                {
                    id: 1,
                    title: "Sources sous surveillance",
                    value: stats.DEHPE.sources ,
                    icon: <Activity size={18} className="text-info" />,
                    statInfo: `<span className="text-info me-2 fw-bold">${((stats.DDD.sources + stats.DEHPE.sources) ? (stats?.DEHPE?.sources * 100/(stats.DDD.sources + stats.DEHPE.sources)).toFixed(2) : 0)} %</span>`
                },
                {
                    id: 2,
                    title: "Emissions sous surveillance",
                    value: stats.DEHPE?.gaz || 0,
                    icon: <Wind size={18} className="text-success" />,
                    statInfo: `<span className="text-success me-2 fw-bold">${((stats.DDD.gaz + stats.DEHPE.gaz) ? (stats?.DEHPE?.gaz * 100/(stats.DDD.gaz + stats.DEHPE.gaz)).toFixed(2) : 0)} %</span>`
                }
            ];

        }
    }, [sources]);

    // --- Méthodes CRUD ---
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
            return json.data;
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
            {/* Animation de dégradé en arrière-plan */}
            <div 
                className="rounded-top pt-10 pb-21 shadow-sm" 
                style={{  
                    backgroundImage: 'url(/images/industrie.jpg)', 
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '220px', 
                    width: '100%',
                    transition: 'all 0.5s ease'
                }}
            ></div>
            <Container fluid className="mt-n22 px-6">
                {/* Accès rapide administrateur */}
                <AdminQuickAccess />
                
                <Row>
                    <Col xl={6} lg={6} md={12} xs={12}>
                        <Row>
                            {/* Affichage des deux cartes DEHPE et DDD */}
                            {metrics.map((item, index) => (
                                <Col xl={6} lg={6} md={12} xs={12} className="mt-6" key={index}>
                                    <div className="animate-up"> 
                                        <StatRightTopIcon info={item} />
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <Col xl={12} lg={12} md={12} xs={12} className="mt-6">
                            <SourcesChart sources={sources?.filter(s => s.categorie === (user?.currentPrivilege?.designation || 'DDD'))} />
                        </Col>
                    </Col>
                    <Col xl={6} lg={6} md={12} xs={12} className="mt-6">
                        <EntrepriseManager />
                    </Col>
                </Row>
                <Row className="my-6">
                    <Col xl={6} lg={6} md={12} xs={12} className="mb-6 mb-xl-0">                    
                        <SourceManager 
                            sources={sources?.filter(s => s.categorie === (user?.currentPrivilege?.designation || 'DDD'))} 
                            allGaz={allGaz}
                            onAdd={handleAddSource}
                            onUpdate={handleUpdateSource}
                            onDelete={handleDeleteSource}
                        />
                    </Col>
                    <Col xl={6} lg={6} md={12} xs={12}><GazManager /></Col>
                </Row>
            </Container>

            {/* CSS inline pour l'animation d'entrée */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </Fragment>
    );
}

export default Home;