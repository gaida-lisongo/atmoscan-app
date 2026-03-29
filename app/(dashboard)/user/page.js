'use client'
import Link from 'next/link';
import { Breadcrumb } from 'react-bootstrap';
import { Home, Users } from 'react-feather';
import { UserManager } from 'sub-components';

const UserPage = () => {
    return (
        <div className="min-vh-100 bg-white">
            {/* Fil d'Ariane */}
            <div className="px-4 pt-4 pb-2">
                <Breadcrumb className="bg-light rounded-3 px-3 py-2 mb-0" style={{ fontSize: '0.9rem' }}>
                    <Breadcrumb.Item linkAs={Link} href="/" className="d-flex align-items-center text-decoration-none">
                        <Home size="16" className="me-2" />
                        Accueil
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active className="d-flex align-items-center fw-semibold">
                        <Users size="16" className="me-2" />
                        Gestion des Utilisateurs
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* Composant de gestion des utilisateurs pleine largeur */}
            <div className="w-100">
                <UserManager />
            </div>
        </div>
    );
};

export default UserPage;