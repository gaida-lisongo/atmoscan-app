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
					<div className="lh-1" onClick={() => window.location.href = '/'} 
						 style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
						 onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
						 onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
						<h2 className="mb-0" style={{background: 'linear-gradient(45deg, #007bff, #28a745)', 
							WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
							AtmoScan
							<CheckCircle size="20" className="text-primary ms-2" />
						</h2>
						<p className="mb-0 text-muted">
							<span className="ms-2 fw-bold text-dark" style={{fontSize: '0.7rem', letterSpacing: '2px', 
								textShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
								POWERED BY A. NSIMBA & N. LISONGO
							</span>
						</p>
					</div>
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
