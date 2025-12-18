// import node module libraries
import { CheckCircle, Menu } from 'react-feather';
import Link from 'next/link';
import {
	Nav,
	Navbar,
	Form
} from 'react-bootstrap';

// import sub components
import QuickMenu from 'layouts/QuickMenu';

const NavbarTop = (props) => {
	return (
		<Navbar expanded="lg" className="navbar-classic navbar navbar-expand-lg">
			<div className='d-flex justify-content-between w-100'>
				<div className="d-flex align-items-center">
					<div className="lh-1">
						<h2 className="mb-0">
							AtmoScan
							<CheckCircle size="20" className="text-primary ms-2" />
						</h2>
						<p className="mb-0 text-muted">
							<span className="ms-2 fw-bold text-dark" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>
								POWERED BY LANAScan (A. NSIMBA & N. LISONGO)
							</span>
						</p>
					</div>
								{/* <Link
						href="#"
						id="nav-toggle"
						className="nav-icon me-2 icon-xs"
						onClick={() => props.data.SidebarToggleMenu(!props.data.showMenu)}>
						<Menu size="18px" />
					</Link>
					<div className="ms-lg-3 d-none d-md-none d-lg-block">
						
						<Form className="d-flex align-items-center">
							<Form.Control type="search" placeholder="Search" />
						</Form>
					</div> */}
				</div>
				{/* Quick Menu */}
				<Nav className="navbar-right-wrap ms-2 d-flex nav-top-wrap">
					<QuickMenu />
				</Nav>
			</div>
		</Navbar>
	);
};

export default NavbarTop;
