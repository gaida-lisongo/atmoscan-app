// import node module libraries
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    Row,
    Col,
    Image,
    Dropdown,
    ListGroup,
    Modal,
    Badge,
    Table,
    Button,
    Accordion,
    Form,
    Pagination,
    InputGroup,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';

// simple bar scrolling used for notification item scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

// import hooks
import useMounted from 'hooks/useMounted';
import useAuthStore from '@/stores/authStore';
import { User } from 'react-feather';

const QuickMenu = () => {
    const router = useRouter();
    const hasMounted = useMounted();
    const { user, logout } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [gazList, setGazList] = useState([]);
    
    // Filtres et pagination pour toutes les notifications
    const [filterReadStatus, setFilterReadStatus] = useState('all'); // 'all', 'read', 'unread'
    const [filterYear, setFilterYear] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterDay, setFilterDay] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Fetch gaz pour avoir les noms
    const fetchGaz = async () => {
        try {
            const response = await fetch('/api/gaz');
            const data = await response.json();
            if (data.success) {
                setGazList(data.data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des gaz:", error);
        }
    };

    // Obtenir le nom du gaz par son ID
    const getGazName = (gazId) => {
        const gaz = gazList.find(g => g._id === gazId);
        return gaz?.designation || gaz?.formuleChimique || 'Gaz inconnu';
    };

    // Export PDF du rapport
    const exportToPDF = () => {
        if (!selectedNotification) return;
        
        const printContent = document.getElementById('notification-report');
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Rapport Notification - ${selectedNotification.capteurId?.designation || 'Capteur'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #624bff; border-bottom: 2px solid #624bff; padding-bottom: 10px; }
                        h2 { color: #333; margin-top: 20px; }
                        .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
                        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                        .badge-success { background: #28a745; color: white; }
                        .badge-warning { background: #ffc107; color: black; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #624bff; color: white; }
                        tr:nth-child(even) { background: #f8f9fa; }
                        .mesure-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>📋 Rapport de Notification</h1>
                    
                    <div class="info-box">
                        <h2>🔧 Informations du Capteur</h2>
                        <p><strong>Désignation:</strong> ${selectedNotification.capteurId?.designation || '-'}</p>
                        <p><strong>UUID:</strong> ${selectedNotification.capteurId?.uuid || '-'}</p>
                        <p><strong>Type:</strong> ${selectedNotification.capteurId?.type || '-'}</p>
                    </div>
                    
                    <div class="info-box">
                        <h2>📝 Message</h2>
                        <p>${selectedNotification.message || '-'}</p>
                        <p><strong>Statut:</strong> <span class="badge ${selectedNotification.read ? 'badge-success' : 'badge-warning'}">${selectedNotification.read ? 'Lu' : 'Non lu'}</span></p>
                        <p><strong>Date:</strong> ${new Date(selectedNotification.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                    
                    <h2>📊 Mesures Associées (${selectedNotification.mesures?.length || 0})</h2>
                    ${selectedNotification.mesures?.length > 0 ? 
                        selectedNotification.mesures.map((mesure, idx) => `
                            <div class="mesure-section">
                                <h3>Mesure #${idx + 1} - ${new Date(mesure.createdAt).toLocaleString('fr-FR')}</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Gaz</th>
                                            <th>Valeur (PPM)</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${mesure.ppm?.map(p => `
                                            <tr>
                                                <td>${getGazName(p.gaz)}</td>
                                                <td>${p.value}</td>
                                                <td>${new Date(p.timestamp).toLocaleString('fr-FR')}</td>
                                            </tr>
                                        `).join('') || '<tr><td colspan="3">Aucune donnée</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        `).join('') 
                    : '<p>Aucune mesure associée</p>'}
                    
                    <div class="footer">
                        <p>Rapport généré le ${new Date().toLocaleString('fr-FR')}</p>
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            if (data.success) {
                console.log("Notifications fetched:", data.data);
                setNotifications(data.data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchGaz();
    }, []);

    // Calcul du nombre de notifications non lues
    const unreadCount = notifications.filter(n => !n.read).length;

    // Ouvrir modal avec détails
    const handleNotificationClick = async (notif) => {
        setSelectedNotification(notif);
        setShowNotificationModal(true);
        
        // Marquer comme lu si pas encore lu
        if (!notif.read) {
            try {
                await fetch(`/api/notifications?id=${notif._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ read: true })
                });
                // Rafraîchir les notifications
                fetchNotifications();
            } catch (error) {
                console.error("Erreur lors de la mise à jour:", error);
            }
        }
    };

    // console.log('QuickMenu: Rendering', { user, hasMounted });
    
    const isDesktop = useMediaQuery({
        query: '(min-width: 1224px)'
    })

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const getRoleMenuItem = () => {
        const role = user?.currentPrivilege?.designation;
        
        if (role === 'ADMIN') {
            return {
                title: 'Administration',
                icon: 'fe fe-user-check',
                link: '/user',
                action: null,
                className: 'text-primary'
            };
        } else if (role === 'DDD' || role === 'DEHPE') {
            return {
                title: 'Capteurs',
                icon: 'fe fe-activity',
                link: '/capteurs',
                action: null,
                className: 'text-primary'
            };
        }
        
        // Pour OPERATOR ou autre, on ne retourne rien ou un objet vide
        return null;
    };

    const roleItem = getRoleMenuItem();
    const menuItems = [];
    
    if (roleItem) {
        menuItems.push(roleItem);
    }

    const userMenu = [
        ...menuItems, // Dynamic role item inserted here or at the top
        {
            title: 'Configuration',
            icon: 'fe fe-settings',
            link: '/user/settings',
            action: null,
            className: ''
        },
        {
            title: 'Modifier Profile',
            icon: 'fe fe-user',
            link: '/user/profile',
            action: null,
            className: ''
        },
        // {
        //     title: 'Securité',
        //     icon: 'fe fe-settings',
        //     link: '/user/settings',
        //     action: null,
        //     className: ''
        // },
        {
            title: 'Se déconnecter',
            icon: 'fe fe-log-out',
            link: '#',
            action : handleLogout,
            className: 'text-danger'
        }
    ];

    const Notifications = () => {
        return (
            <SimpleBar style={{ maxHeight: '300px' }}>
                <ListGroup variant="flush">
                    {notifications.length === 0 ? (
                        <ListGroup.Item className="text-center text-muted py-4">
                            <i className="fe fe-bell-off mb-2" style={{ fontSize: '24px' }}></i>
                            <p className="mb-0">Aucune notification</p>
                        </ListGroup.Item>
                    ) : (
                        notifications.slice(0, 12).map((item, index) => (
                            <ListGroup.Item 
                                key={item._id} 
                                className={`${!item.read ? 'bg-light-primary' : ''} cursor-pointer`}
                                style={{ 
                                    cursor: 'pointer',
                                    borderLeft: !item.read ? '3px solid #624bff' : 'none',
                                    backgroundColor: !item.read ? 'rgba(98, 75, 255, 0.08)' : 'transparent'
                                }}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <Row>
                                    <Col>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <h6 className={`mb-1 ${!item.read ? 'fw-bold' : ''}`}>
                                                    <i className={`fe fe-cpu me-2 ${!item.read ? 'text-primary' : 'text-muted'}`}></i>
                                                    {item.capteurId?.designation || 'Capteur'}
                                                </h6>
                                                <p className={`mb-1 small ${!item.read ? 'text-dark' : 'text-muted'}`}>
                                                    {item.message?.length > 50 ? item.message.substring(0, 50) + '...' : item.message}
                                                </p>
                                                <small className="text-muted">
                                                    {new Date(item.createdAt).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </small>
                                            </div>
                                            {!item.read && (
                                                <span className="badge bg-primary rounded-pill ms-2">Nouveau</span>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            </SimpleBar>
        );
    }

    const QuickMenuDesktop = () => {
        return (
        <ListGroup as="ul" bsPrefix='navbar-nav' className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
            {/* Notifications Dropdown */}
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle
                    as="a"
                    bsPrefix=' '
                    id="dropdownNotification"
                    className={`text-dark icon-notifications me-lg-1 btn btn-light btn-icon rounded-circle ${unreadCount > 0 ? 'indicator indicator-primary' : ''}`}
                >
                    <i className="fe fe-bell"></i>
                    {unreadCount > 0 && (
                        <span 
                            className="position-absolute translate-middle badge rounded-pill bg-danger"
                            style={{ top: '8px', right: '-2px', fontSize: '10px' }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end mt-4 py-0"
                    aria-labelledby="dropdownNotification"
                    align="end"
                >
                    <Dropdown.Item className="mt-3" bsPrefix=' ' as="div">
                        <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-center">
                            <span className="h4 mb-0">
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge bg="danger" className="ms-2">{unreadCount}</Badge>
                                )}
                            </span>
                            <Link href="/" className="text-muted">
                                <span className="align-middle">
                                    <i className="fe fe-settings me-1"></i>
                                </span>
                            </Link>
                        </div>
                        <Notifications />
                        <div className="border-top px-3 pt-3 pb-3">
                            <a 
                                href="#" 
                                className="text-link fw-semi-bold"
                                onClick={(e) => { e.preventDefault(); setShowAllNotificationsModal(true); }}
                            >
                                Voir toutes les notifications ({notifications.length})
                            </a>
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            
            {/* User Dropdown */}
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle
                    as="a"
                    bsPrefix=' '
                    className="rounded-circle"
                    id="dropdownUser">
                    <div className="avatar avatar-md avatar-indicators avatar-online">
                        {user?.photoPath ? (
                            <Image alt="avatar" src={user.photoPath} className="rounded-circle" />
                        ) : (
                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white" style={{ width: '100%', height: '100%' }}>
                                {user?.prenom?.[0]}{user?.nom?.[0]}
                            </div>
                        )}
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="dropdown-menu dropdown-menu-end "
                    align="end"
                    aria-labelledby="dropdownUser"
                    show
                    >
                    <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=' '>
                            <div className="lh-1 ">
                                <h5 className="mb-1"> {user ? `${user.username}` : 'Utilisateur'}</h5>
                                <Link href="/profile" className="text-inherit fs-6">{user?.matricule}</Link>
                            </div>
                            <div className=" dropdown-divider mt-3 mb-2"></div>
                    </Dropdown.Item>
                    {
                        userMenu.map((item, index) => (
                            <Dropdown.Item 
                                eventKey={index + 2} 
                                key={index}
                                href={item.link}
                                className={item.className}
                                onClick={item.action}
                            >
                                <i className={`${item.icon} me-2`}></i> {item.title}
                            </Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        </ListGroup>
    )}

    const QuickMenuMobile = () => {
        return (
        <ListGroup as="ul" bsPrefix='navbar-nav' className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
            {/* Notifications Dropdown Mobile */}
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle
                    as="a"
                    bsPrefix=' '
                    id="dropdownNotificationMobile"
                    className={`text-dark icon-notifications me-lg-1 btn btn-light btn-icon rounded-circle ${unreadCount > 0 ? 'indicator indicator-primary' : ''}`}
                >
                    <i className="fe fe-bell"></i>
                    {unreadCount > 0 && (
                        <span 
                            className="position-absolute translate-middle badge rounded-pill bg-danger"
                            style={{ top: '8px', right: '-2px', fontSize: '10px' }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end mt-4 py-0"
                    aria-labelledby="dropdownNotificationMobile"
                    align="end"
                >
                    <Dropdown.Item className="mt-3" bsPrefix=' ' as="div">
                        <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-center">
                            <span className="h4 mb-0">
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge bg="danger" className="ms-2">{unreadCount}</Badge>
                                )}
                            </span>
                            <Link href="/" className="text-muted">
                                <span className="align-middle">
                                    <i className="fe fe-settings me-1"></i>
                                </span>
                            </Link>
                        </div>
                        <Notifications />
                        <div className="border-top px-3 pt-3 pb-3">
                            <a 
                                href="#" 
                                className="text-link fw-semi-bold"
                                onClick={(e) => { e.preventDefault(); setShowAllNotificationsModal(true); }}
                            >
                                Voir toutes les notifications ({notifications.length})
                            </a>
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            
            {/* User Dropdown Mobile */}
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle
                    as="a"
                    bsPrefix=' '
                    className="rounded-circle"
                    id="dropdownUser">
                    <div className="avatar avatar-md avatar-indicators avatar-online">
                        {user?.photoPath ? (
                            <Image alt="avatar" src={user.photoPath} className="rounded-circle" />
                        ) : (
                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white" style={{ width: '100%', height: '100%' }}>
                                {user?.prenom?.[0]}{user?.nom?.[0]}
                            </div>
                        )}
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="dropdown-menu dropdown-menu-end "
                    align="end"
                    aria-labelledby="dropdownUser"
                    >
                    <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=' '>
                            <div className="lh-1 ">
                                <h5 className="mb-1"> {user ? `${user?.username}` : 'Utilisateur'}</h5>
                                <Link href="/profile" className="text-inherit fs-6">{user?.matricule}</Link>
                            </div>
                            <div className=" dropdown-divider mt-3 mb-2"></div>
                    </Dropdown.Item>
                    {
                        userMenu.map((item, index) => (
                            <Dropdown.Item 
                                eventKey={index + 2} 
                                key={index}
                                href={item.link}
                                className={item.className}
                                onClick={item.action}
                            >
                                <i className={`${item.icon} me-2`}></i> {item.title}
                            </Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        </ListGroup>
    )}

    return (
        <Fragment>
            { hasMounted && isDesktop ? <QuickMenuDesktop /> : <QuickMenuMobile />}
            
            {/* Modal Détail Notification */}
            <Modal 
                show={showNotificationModal} 
                onHide={() => { setShowNotificationModal(false); setSelectedNotification(null); }} 
                centered
                size="lg"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="d-flex align-items-center">
                        <i className="fe fe-bell text-primary me-2"></i>
                        Détail de la notification
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body id="notification-report" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {selectedNotification && (
                        <div>
                            {/* Capteur Info */}
                            <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                                <div className="avatar avatar-md bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                                    <i className="fe fe-cpu"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0">{selectedNotification.capteurId?.designation || 'Capteur'}</h6>
                                    <small className="text-muted">
                                        UUID: {selectedNotification.capteurId?.uuid?.substring(0, 8)}... | Type: {selectedNotification.capteurId?.type}
                                    </small>
                                </div>
                                <Badge 
                                    bg={selectedNotification.read ? 'secondary' : 'success'} 
                                    className="ms-auto"
                                >
                                    {selectedNotification.read ? 'Lu' : 'Non lu'}
                                </Badge>
                            </div>

                            {/* Message */}
                            <div className="mb-3">
                                <label className="text-muted small mb-1">
                                    <i className="fe fe-message-square me-1"></i>Message
                                </label>
                                <div className="p-3 border rounded bg-white">
                                    {selectedNotification.message}
                                </div>
                            </div>

                            {/* Mesures */}
                            <div className="mb-3">
                                <label className="text-muted small mb-1 d-flex align-items-center">
                                    <i className="fe fe-activity me-1"></i>
                                    Mesures associées 
                                    <Badge bg="primary" className="ms-2">{selectedNotification.mesures?.length || 0}</Badge>
                                </label>
                                
                                {selectedNotification.mesures?.length > 0 ? (
                                    <Accordion defaultActiveKey="0">
                                        {selectedNotification.mesures.map((mesure, idx) => (
                                            <Accordion.Item eventKey={String(idx)} key={mesure._id || idx}>
                                                <Accordion.Header>
                                                    <div className="d-flex align-items-center w-100">
                                                        <Badge bg="info" className="me-2">#{idx + 1}</Badge>
                                                        <span className="me-auto">
                                                            Mesure du {new Date(mesure.createdAt).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        <Badge bg="secondary" className="me-2">
                                                            {mesure.ppm?.length || 0} gaz
                                                        </Badge>
                                                    </div>
                                                </Accordion.Header>
                                                <Accordion.Body className="p-0">
                                                    <Table responsive hover size="sm" className="mb-0">
                                                        <thead className="table-primary">
                                                            <tr>
                                                                <th>Gaz</th>
                                                                <th className="text-end">Valeur (PPM)</th>
                                                                <th>Timestamp</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {mesure.ppm?.map((p, pIdx) => (
                                                                <tr key={p._id || pIdx}>
                                                                    <td>
                                                                        <i className="fe fe-wind text-muted me-1"></i>
                                                                        {getGazName(p.gaz)}
                                                                    </td>
                                                                    <td className="text-end">
                                                                        <Badge 
                                                                            bg={p.value > 30 ? 'danger' : p.value > 15 ? 'warning' : 'success'}
                                                                            className="font-monospace"
                                                                        >
                                                                            {p.value.toFixed(2)}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="text-muted small">
                                                                        {new Date(p.timestamp).toLocaleString('fr-FR')}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div className="p-4 border rounded bg-light text-center">
                                        <i className="fe fe-inbox text-muted" style={{ fontSize: '32px' }}></i>
                                        <p className="text-muted mt-2 mb-0">Aucune mesure associée à cette notification</p>
                                    </div>
                                )}
                            </div>

                            {/* Date */}
                            <div className="d-flex justify-content-between text-muted small border-top pt-3">
                                <span>
                                    <i className="fe fe-calendar me-1"></i>
                                    {new Date(selectedNotification.createdAt).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                <span>
                                    <i className="fe fe-clock me-1"></i>
                                    {new Date(selectedNotification.createdAt).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button 
                        variant="outline-danger" 
                        onClick={exportToPDF}
                        disabled={!selectedNotification}
                    >
                        <i className="fe fe-file-text me-2"></i>
                        Exporter PDF
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => { setShowNotificationModal(false); setSelectedNotification(null); }}
                    >
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Toutes les Notifications */}
            <Modal 
                show={showAllNotificationsModal} 
                onHide={() => {
                    setShowAllNotificationsModal(false);
                    setCurrentPage(1);
                    setFilterReadStatus('all');
                    setFilterYear('');
                    setFilterMonth('');
                    setFilterDay('');
                }} 
                centered
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <i className="fe fe-bell text-primary me-2"></i>
                        Toutes les notifications
                        <Badge bg="primary" className="ms-2">{notifications.length}</Badge>
                        {unreadCount > 0 && (
                            <Badge bg="danger" className="ms-2">{unreadCount} non lue(s)</Badge>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: 0 }}>
                    {/* Filtres */}
                    <div className="p-3 bg-light border-bottom">
                        <Row className="g-2 align-items-end">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small mb-1">Statut de lecture</Form.Label>
                                    <Form.Select 
                                        size="sm"
                                        value={filterReadStatus}
                                        onChange={(e) => { setFilterReadStatus(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="all">Toutes</option>
                                        <option value="unread">Non lues</option>
                                        <option value="read">Lues</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="small mb-1">Année</Form.Label>
                                    <Form.Select 
                                        size="sm"
                                        value={filterYear}
                                        onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="">Toutes</option>
                                        {[...new Set(notifications.map(n => new Date(n.createdAt).getFullYear()))]
                                            .sort((a, b) => b - a)
                                            .map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="small mb-1">Mois</Form.Label>
                                    <Form.Select 
                                        size="sm"
                                        value={filterMonth}
                                        onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="">Tous</option>
                                        <option value="1">Janvier</option>
                                        <option value="2">Février</option>
                                        <option value="3">Mars</option>
                                        <option value="4">Avril</option>
                                        <option value="5">Mai</option>
                                        <option value="6">Juin</option>
                                        <option value="7">Juillet</option>
                                        <option value="8">Août</option>
                                        <option value="9">Septembre</option>
                                        <option value="10">Octobre</option>
                                        <option value="11">Novembre</option>
                                        <option value="12">Décembre</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="small mb-1">Jour</Form.Label>
                                    <Form.Select 
                                        size="sm"
                                        value={filterDay}
                                        onChange={(e) => { setFilterDay(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="">Tous</option>
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    className="w-100"
                                    onClick={() => {
                                        setFilterReadStatus('all');
                                        setFilterYear('');
                                        setFilterMonth('');
                                        setFilterDay('');
                                        setCurrentPage(1);
                                    }}
                                >
                                    <i className="fe fe-x me-1"></i>
                                    Réinitialiser
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    
                    {/* Liste des notifications filtrées */}
                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        {(() => {
                            // Appliquer les filtres
                            let filtered = notifications.filter(n => {
                                // Filtre statut lecture
                                if (filterReadStatus === 'read' && !n.read) return false;
                                if (filterReadStatus === 'unread' && n.read) return false;
                                
                                // Filtre année
                                if (filterYear && new Date(n.createdAt).getFullYear() !== parseInt(filterYear)) return false;
                                
                                // Filtre mois
                                if (filterMonth && (new Date(n.createdAt).getMonth() + 1) !== parseInt(filterMonth)) return false;
                                
                                // Filtre jour
                                if (filterDay && new Date(n.createdAt).getDate() !== parseInt(filterDay)) return false;
                                
                                return true;
                            });
                            
                            // Pagination
                            const totalPages = Math.ceil(filtered.length / itemsPerPage);
                            const startIndex = (currentPage - 1) * itemsPerPage;
                            const paginatedNotifications = filtered.slice(startIndex, startIndex + itemsPerPage);
                            
                            if (filtered.length === 0) {
                                return (
                                    <div className="text-center py-5">
                                        <i className="fe fe-search text-muted" style={{ fontSize: '48px' }}></i>
                                        <p className="text-muted mt-3">Aucune notification correspondant aux filtres</p>
                                    </div>
                                );
                            }
                            
                            return (
                                <>
                                    <Table hover className="mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th style={{ width: '40px' }}></th>
                                                <th>Capteur</th>
                                                <th>Message</th>
                                                <th style={{ width: '80px' }}>Mesures</th>
                                                <th style={{ width: '150px' }}>Date</th>
                                                <th style={{ width: '80px' }}>Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedNotifications.map((item) => (
                                                <tr 
                                                    key={item._id}
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        backgroundColor: !item.read ? 'rgba(98, 75, 255, 0.05)' : 'transparent'
                                                    }}
                                                    onClick={() => {
                                                        setShowAllNotificationsModal(false);
                                                        handleNotificationClick(item);
                                                    }}
                                                >
                                                    <td className="text-center">
                                                        <div className={`avatar avatar-xs rounded-circle d-inline-flex align-items-center justify-content-center ${!item.read ? 'bg-primary' : 'bg-secondary'}`}>
                                                            <i className="fe fe-cpu text-white" style={{ fontSize: '10px' }}></i>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={!item.read ? 'fw-bold' : ''}>
                                                            {item.capteurId?.designation || 'Capteur'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={!item.read ? 'text-dark' : 'text-muted'}>
                                                            {item.message?.length > 60 ? item.message.substring(0, 60) + '...' : item.message}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={item.mesures?.length > 0 ? 'info' : 'secondary'}>
                                                            {item.mesures?.length || 0}
                                                        </Badge>
                                                    </td>
                                                    <td className="small text-muted">
                                                        {new Date(item.createdAt).toLocaleString('fr-FR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={item.read ? 'secondary' : 'primary'} className="rounded-pill">
                                                            {item.read ? 'Lu' : 'Nouveau'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                                            <small className="text-muted">
                                                Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} sur {filtered.length}
                                            </small>
                                            <Pagination size="sm" className="mb-0">
                                                <Pagination.First 
                                                    onClick={() => setCurrentPage(1)} 
                                                    disabled={currentPage === 1}
                                                />
                                                <Pagination.Prev 
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                                    disabled={currentPage === 1}
                                                />
                                                
                                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <Pagination.Item
                                                            key={pageNum}
                                                            active={currentPage === pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </Pagination.Item>
                                                    );
                                                })}
                                                
                                                <Pagination.Next 
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                                    disabled={currentPage === totalPages}
                                                />
                                                <Pagination.Last 
                                                    onClick={() => setCurrentPage(totalPages)} 
                                                    disabled={currentPage === totalPages}
                                                />
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setShowAllNotificationsModal(false);
                            setCurrentPage(1);
                            setFilterReadStatus('all');
                            setFilterYear('');
                            setFilterMonth('');
                            setFilterDay('');
                        }}
                    >
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    )
}

export default QuickMenu;
