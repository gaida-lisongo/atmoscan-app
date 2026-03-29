'use client'
// import node module libraries
import { Fragment } from "react";
import Link from 'next/link';
import { Container, Col, Row } from 'react-bootstrap';
// import widget/custom components
import { StatRightTopIcon } from "widgets";

// import sub components
import { ActiveProjects, Teams, 
    TasksPerformance 
} from "sub-components";
import {
	Briefcase,
    ListTask,
    People,
    Bullseye
} from 'react-bootstrap-icons';
// import required data files
import ProjectsStatsData from "data/dashboard/ProjectsStatsData";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useClassesStore from "@/stores/Classes";
import { v4 as uuid } from 'uuid';

const Home = () => {
    const {promotionId} = useParams();
    const [promotion, setPromotion] = useState(null);
    const {getClassById, getClassByPromotionId, loading, classes, error} = useClassesStore()

    useEffect(() => {
        // console.log("classes récupérées:", classes);
        // console.log("promotionId depuis URL:", promotionId, typeof promotionId);
        
        if (!loading && classes.length > 0) {
            // Essayons d'abord par ID direct
            let foundPromotion = getClassById(promotionId);
            
            // Si pas trouvé, essayons par id_promotion
            if (!foundPromotion) {
                foundPromotion = getClassByPromotionId(promotionId);
            }
            
            // Si toujours pas trouvé, cherchons manuellement dans le tableau
            if (!foundPromotion) {
                foundPromotion = classes.find(classe => 
                    classe.id == promotionId || 
                    classe.id_promotion == promotionId ||
                    classe.id === parseInt(promotionId) ||
                    classe.id_promotion === parseInt(promotionId)
                );
            }
            
            // console.log("Promotion trouvée:", foundPromotion);
            setPromotion(foundPromotion);
        }
    }, [loading, classes, promotionId]);

    const renderMetrique = () => {
        const unites = promotion?.unites || [];
        // console.log("unites", unites);

        const stats = [
            {
                id: uuid(),
                title: 'Classe',
                value: promotion?.systeme,
                icon: <Briefcase size={18}/>,
                statInfo: '<span className="text-dark me-2">' + promotion?.section + '</span>' 
            },
            {
                id: uuid(),
                title: 'Unites',
                value: promotion?.unites?.length,
                icon: <Briefcase size={18}/>,
                statInfo: '<span className="text-dark me-2">' + promotion?.unites?.reduce((t, unite) => t + (unite?.matieres?.reduce((total, matiere) => total + parseInt(matiere?.credit), 0)), 0) + '</span> Crédits' 
            },
            {
                id: uuid(),
                title: 'ECUE S1',
                value: unites?.reduce((t, unite) => t + (unite?.matieres?.reduce((total, matiere) => total + parseInt(matiere == 'Premier' ? 1 : 0), 0)), 0),
                icon: <Briefcase size={18}/>,
                statInfo: '<span className="text-dark me-2">' + unites?.reduce((t, unite) => t + (unite?.matieres?.reduce((total, matiere) => total + parseInt(matiere == 'Premier' ? matiere?.credit : 0), 0)), 0) + '</span>' 
            },
            {
                id: uuid(),
                title: 'ECUE S2',
                value: unites?.reduce((t, unite) => t + (unite?.matieres?.reduce((total, matiere) => total + parseInt(matiere == 'Deuxieme' ? matiere?.credit : 0), 0)), 0),
                icon: <Briefcase size={18}/>,
                statInfo: '<span className="text-dark me-2">' + unites?.reduce((t, unite) => t + (unite?.matieres?.reduce((total, matiere) => total + parseInt(matiere == 'Deuxieme' ? matiere?.credit : 0), 0)), 0) + '</span> Crédits' 
            }
        ];
        
        return stats;
    }
    
    return (
        <Fragment>
            <div className="bg-primary pt-10 pb-21"></div>
            <Container fluid className="mt-n22 px-6">
                <Row>
                    <Col lg={12} md={12} xs={12}>
                        {/* Page header */}
                        <div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="mb-2 mb-lg-0">
                                    <h3 className="mb-0  text-white">{promotion?.intitule && promotion.filiere ? promotion.intitule + " - " + promotion.filiere : "Promotion"}</h3>
                                </div>
                                <div>
                                    <Link href="#" className="btn btn-white">Inscrire</Link>
                                </div>
                            </div>
                        </div>
                    </Col>
                    {promotion ?? renderMetrique().map((item, index) => {
                        return (
                            <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
                                <StatRightTopIcon info={item} />
                            </Col>
                        )
                    })}
                </Row>

                {/* Active Projects  */}
                <ActiveProjects />
            </Container>
        </Fragment>
    )
}
export default Home;
