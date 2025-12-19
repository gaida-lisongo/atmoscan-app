'use client'
// import node module libraries
import { Col, Row, Container } from 'react-bootstrap';

// import widget as custom components
import { PageHeading } from 'widgets'

// import sub components
import {
  UserOverview,
  ActivityFeed,
  UserPrivilegies,
  UserBanner,
  ProjectsContributions,
  RecentFromBlog
} from 'sub-components';
import useAuthStore from '@/stores/authStore';
import { User } from 'react-feather';

export const dynamic = 'force-dynamic';

const Profile = () => {
  const { user } = useAuthStore();
  return (
    <Container fluid className="p-6">
      {/* Page Heading */}
      <PageHeading heading={user ? `Matricule - ${user?.matricule}` : ""}/>

      {/* Profile Header  */}
      <UserBanner />

      {/* content */}
      <div className="py-6">
        <Row>

          <Col xl={6} lg={12} md={12} xs={12} className="mb-6">
            <UserOverview user={user} />

          </Col>
          {/* About Me */}

          <Col xl={6} lg={12} md={12} xs={12} className="mb-6">

            {/* Mes Autorisations */}
            <UserPrivilegies user={user} />

          </Col>
        </Row>
      </div>

    </Container>
  )
}

export default Profile