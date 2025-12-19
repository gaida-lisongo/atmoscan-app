'use client';

import { Spinner } from 'react-bootstrap';

const CustomLoader = () => (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f5f7fb' }}>
        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
        <h4 className="mt-3 text-primary fw-bold italic">Analyse des données environnementales...</h4>
    </div>
);

export default CustomLoader;
