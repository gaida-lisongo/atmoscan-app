'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// import node module libraries
import { Col, Row, Container } from 'react-bootstrap';

// import widget as custom components
import { PageHeading } from 'widgets'

// import sub components
import {
  TasksPerformance,
  ActivityFeed,
  MyTeam,
  EntrepriseDetail,
  PollutionsDetail,
  GesChart
} from 'sub-components'
import CustomLoader from 'components/CustomLoader';

const Entreprise = () => {
  const params = useParams(); // Récupère l'ID vite
  const id = params.id;
  
  const [entreprise, setEntreprise] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async (id) => {
    try {
        const [resS, resE] = await Promise.all([fetch('/api/sources'), fetch(`/api/entreprises?id=${id}`)]);
        const sJson = await resS.json();
        const gJson = await resE.json();
        if (sJson.success) setSources(sJson.data);
        if (gJson.success) setEntreprise(gJson.data);
    } catch (error) { console.error("Fetch error", error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (id) {
        refreshData(id)
    }
  }, [id]);
  
  if (loading) return <CustomLoader />;
  if (!entreprise) return <p>Entreprise introuvable.</p>;
  return (
    <Container className="p-6">
      {/* Profile Header  */}
      <EntrepriseDetail entreprise={entreprise} sources={sources} />

      {/* content */}
      <div className="py-6">

        <Row className="my-6">
            <Col xl={4} lg={12} md={12} xs={12} className="mb-6 mb-xl-0">

                {/* Tasks Performance  */}
                {sources?.length && <GesChart sources={sources?.filter(s => s?.categorie == 'DDD')} entrepriseId={entreprise?._id} />}

            </Col>
            {/* card  */}
            <Col xl={8} lg={12} md={12} xs={12}>


                {/* Tasks Performance  */}
                {sources?.length && <GesChart sources={sources?.filter(s => s?.categorie == 'DEHPE')} entrepriseId={entreprise?._id} />}


            </Col>
        </Row>
   
      </div>

    </Container>
  )
}

export default Entreprise