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

const Profile = () => {
  const params = useParams(); // Récupère l'ID vite
  const id = params.id;
  
  const [entreprise, setEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        fetch(`/api/entreprises?id=${id}`)
            .then(res => res.json())
            .then(json => {
                if (json.success) setEntreprise(json.data);
                setLoading(false);
            });
    }
  }, [id]);
  
  if (loading) return <p>Chargement...</p>;
  if (!entreprise) return <p>Entreprise introuvable.</p>;
  return (
    <Container fluid className="p-6">
      {/* Profile Header  */}
      <EntrepriseDetail entreprise={entreprise} />

      {/* content */}
      <div className="py-6">

        <Row className="my-6">
            <Col xl={4} lg={12} md={12} xs={12} className="mb-6 mb-xl-0">

                {/* Tasks Performance  */}
                <GesChart />

            </Col>
            {/* card  */}
            <Col xl={8} lg={12} md={12} xs={12}>

                {/* Projects Contributions */}
                <PollutionsDetail />


            </Col>
        </Row>
   
      </div>

    </Container>
  )
}

export default Profile