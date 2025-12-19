// import node module libraries
import { Col, Row, Card } from 'react-bootstrap';

const UserOverview = ({ user }) => {
    const parseDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    return (
        <Col xl={12} lg={12} md={12} xs={12} className="mb-6">
            {/* card */}
            <Card>
                {/* card body */}
                <Card.Body>
                    {/* card title */}
                    <Card.Title as="h4">Apropos</Card.Title>
                    <span className="text-uppercase fw-medium text-dark fs-5 ls-2">NATIONALITE</span>
                    <p className="mt-2 mb-6">{user ? user?.nationalite : "Non Renseignée"}
                    </p>
                    <Row>
                        <Col xs={12} className="mb-5">
                            <h6 className="text-uppercase fs-5 ls-2">LIEU DE NAISSANCE</h6>
                            <p className="mb-0">{user ? user?.lieu_naissance : "Non Renseigné"}</p>
                        </Col>
                        <Col xs={6} className="mb-5">
                            <h6 className="text-uppercase fs-5 ls-2">TELEPHONE </h6>
                            <p className="mb-0">{user ? user?.telephone : "Non Renseigné"}</p>
                        </Col>
                        <Col xs={6} className="mb-5">
                            <h6 className="text-uppercase fs-5 ls-2">DATE DE NAISSANCE </h6>
                            <p className="mb-0">{user ? parseDate(user?.date_naissance) : "Non Renseignée"}</p>
                        </Col>
                        <Col xs={6}>
                            <h6 className="text-uppercase fs-5 ls-2">EMAIL </h6>
                            <p className="mb-0">{user ? user?.email : "Non Renseigné"}</p>
                        </Col>
                        <Col xs={6}>
                            <h6 className="text-uppercase fs-5 ls-2">ADRESSE</h6>
                            <p className="mb-0">{user ? user?.adresse : "Non Renseignée"}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    )
}

export default UserOverview