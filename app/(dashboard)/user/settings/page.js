'use client';

import Link from 'next/link';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Settings as SettingsIcon, Cloud } from 'react-feather';
import { PageHeading } from 'widgets';

export const dynamic = 'force-dynamic';

const Settings = () => {
    return (
        <Container fluid className="p-6">
            <PageHeading heading="Paramètres" />
            <div className="py-4">
                <Row className="g-4">
                    <Col xl={4} lg={6} md={8}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <div
                                        className="icon-shape icon-lg bg-light-primary text-primary rounded-3 me-3"
                                    >
                                        <Cloud size={18} />
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Configuration CO2e</h4>
                                        <p className="mb-0 text-muted small">
                                            Gérer les coefficients d&apos;équivalence par gaz.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <Button as={Link} href="/co2e" className="d-inline-flex align-items-center gap-2">
                                        <SettingsIcon size={16} />
                                        Ouvrir la configuration
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default Settings;
