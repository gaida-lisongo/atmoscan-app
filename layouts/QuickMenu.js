// import node module libraries
import Link from 'next/link';
import { Fragment } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    Row,
    Col,
    Image,
    Dropdown,
    ListGroup,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';

// simple bar scrolling used for notification item scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

// import data files
import NotificationList from 'data/Notification';

// import hooks
import useMounted from 'hooks/useMounted';
import useAuthStore from '@/stores/authStore';
import { User } from 'react-feather';

const QuickMenu = () => {
    const router = useRouter();
    const hasMounted = useMounted();
    const { user, logout } = useAuthStore();

    console.log('QuickMenu: Rendering', { user, hasMounted });
    
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
            title: 'Modifier Profile',
            icon: 'fe fe-user',
            link: '/user/profile',
            action: null,
            className: ''
        },
        {
            title: 'Securité',
            icon: 'fe fe-settings',
            link: '/user/settings',
            action: null,
            className: ''
        },
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
                    {NotificationList.map(function (item, index) {
                        return (
                            <ListGroup.Item className={index === 0 ? 'bg-light' : ''} key={index}>
                                <Row>
                                    <Col>
                                        <Link href="#" className="text-muted">
                                            <h5 className=" mb-1">{item.sender}</h5>
                                            <p className="mb-0"> {item.message}</p>
                                        </Link>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </SimpleBar>
        );
    }

    const QuickMenuDesktop = () => {
        return (
        <ListGroup as="ul" bsPrefix='navbar-nav' className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
            <Dropdown as="li" className="stopevent">
                <Dropdown.Toggle as="a"
                    bsPrefix=' '
                    id="dropdownNotification"
                    className="btn btn-light btn-icon rounded-circle indicator indicator-primary text-muted">
                    <i className="fe fe-bell"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end py-0"
                    aria-labelledby="dropdownNotification"
                    align="end"
                    show
                    >
                    <Dropdown.Item className="mt-3" bsPrefix=' ' as="div"  >
                        <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-end">
                            <span className="h4 mb-0">Notifications</span>
                            <Link href="/" className="text-muted">
                                <span className="align-middle">
                                    <i className="fe fe-settings me-1"></i>
                                </span>
                            </Link>
                        </div>
                        <Notifications />
                        <div className="border-top px-3 pt-3 pb-3">
                            <Link href="/dashboard/notification-history" className="text-link fw-semi-bold">
                                See all Notifications
                            </Link>
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
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
            <Dropdown as="li" className="stopevent">
                <Dropdown.Toggle as="a"
                    bsPrefix=' '
                    id="dropdownNotification"
                    className="btn btn-light btn-icon rounded-circle indicator indicator-primary text-muted">
                    <i className="fe fe-bell"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end py-0"
                    aria-labelledby="dropdownNotification"
                    align="end"
                    >
                    <Dropdown.Item className="mt-3" bsPrefix=' ' as="div"  >
                        <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-end">
                            <span className="h4 mb-0">Notifications</span>
                            <Link href="/" className="text-muted">
                                <span className="align-middle">
                                    <i className="fe fe-settings me-1"></i>
                                </span>
                            </Link>
                        </div>
                        <Notifications />
                        <div className="border-top px-3 pt-3 pb-3">
                            <Link href="/dashboard/notification-history" className="text-link fw-semi-bold">
                                See all Notifications
                            </Link>
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
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
        </Fragment>
    )
}

export default QuickMenu;