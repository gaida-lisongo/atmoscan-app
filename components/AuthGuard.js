'use client'

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import { Spinner } from 'react-bootstrap';

const AuthGuard = ({ children }) => {
    const { isAuthenticated, loading, checkAuth, user, token } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const hasCheckedRef = useRef(false); // Pour éviter les appels multiples

    useEffect(() => {
        // Ne vérifier qu'une seule fois au montage initial de l'app
        // Si on a déjà un user et token dans le store (persisté), on fait confiance
        if (hasCheckedRef.current) {
            setIsChecking(false);
            return;
        }

        const initAuth = async () => {
            // Si on a déjà des données persistées, on fait confiance au store
            if (user && token && isAuthenticated) {
                console.log('AuthGuard: Using persisted auth state');
                setIsChecking(false);
                hasCheckedRef.current = true;
                return;
            }

            // Sinon, on vérifie auprès du serveur
            console.log('AuthGuard: Checking auth with server...');
            try {
                await checkAuth();
            } catch (e) {
                console.error('AuthGuard: Auth check failed', e);
            } finally {
                setIsChecking(false);
                hasCheckedRef.current = true;
            }
        };
        
        initAuth();
    }, []); // Dépendances vides = s'exécute une seule fois

    useEffect(() => {
        if (!isChecking && !loading) {
            const publicPaths = ['/login', '/authentication/sign-in'];
            const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

            if (!isAuthenticated && !isPublicPath) {
                router.push('/login');
            } else if (isAuthenticated && isPublicPath) {
                router.push('/');
            }
        }
    }, [isAuthenticated, loading, isChecking, pathname, router]);

    // Loader pendant la vérification initiale seulement
    if (isChecking) {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </Spinner>
                    <p className="mt-3 text-muted fw-medium">Vérification de l'authentification...</p>
                </div>
            </div>
        );
    }

    const publicPaths = ['/login', '/authentication/sign-in'];
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

    if (!isAuthenticated && !isPublicPath) {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="warning" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Redirection...</span>
                    </Spinner>
                    <p className="mt-3 text-muted fw-medium">Redirection vers la connexion...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;