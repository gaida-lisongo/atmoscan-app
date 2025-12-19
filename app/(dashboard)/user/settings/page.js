'use client';

import { Container } from 'react-bootstrap';
import { PageHeading } from 'widgets';

export const dynamic = 'force-dynamic';

const Settings = () => {
    return (
        <Container fluid className="p-6">
            <PageHeading heading="Paramètres" />
            <div className="py-4">
                <p className="text-muted">Page des paramètres en cours de développement...</p>
            </div>
        </Container>
    );
};

export default Settings;
