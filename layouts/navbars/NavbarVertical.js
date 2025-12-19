'use client'
// import node module libraries
import { Fragment, useContext } from 'react';
import Link from 'next/link';
import { usePathname   } from 'next/navigation'
import { useMediaQuery } from 'react-responsive';
import {
	ListGroup,
	Card,
	Image,
	Badge,
} from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

// import simple bar scrolling used for notification item scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

// import routes file
import { DashboardMenu } from 'routes/DashboardRoutes';
import { useEffect } from 'react';
import useClassesStore from '@/stores/Classes';
import { v4 as uuid } from 'uuid';

const NavbarVertical = (props) => {
	const location = usePathname ();
  	const { fetchAll, sections, loading } = useClassesStore();

	useEffect(() => {
		fetchAll();
	}, []);

	useEffect(() => {
		// console.log('sections', sections);
	}, [loading]);

	const renderSections = () => {
		if (!sections || sections.length === 0) return [];
		
		const menu = [
			{
				id: uuid(),
				title: 'Sections Académiques',
				grouptitle: true
			}
		];

		const items = [];
		sections?.map((section) => {
			const item = {
				id: uuid(),
				title: section?.designation || 'Section',
				icon: 'layers',
				badge: section?.promotions?.length || 0,
				badgecolor: 'info',
				children: []
			};
			
			section?.promotions?.map((promotion) => {
				item.children.push({
					id: uuid(),
					title: `${promotion?.classe} ${promotion?.orientation ? `(${promotion?.orientation})` : ''}`,
					icon: 'book-open',
					link: `/promotion/${promotion.promotionId}`,
					badgecolor: 'success'
				});
			});
			
			items.push(item);
		});
		
		return [...menu, ...items];
	};

	const CustomToggle = ({ children, eventKey, icon }) => {
		const { activeEventKey } = useContext(AccordionContext);
		const decoratedOnClick = useAccordionButton(eventKey, () =>
			console.log('totally custom!')
		);
		const isCurrentEventKey = activeEventKey === eventKey;
		return (
			<li className="nav-item">
				<Link
					href="#"
					className="nav-link "
					onClick={decoratedOnClick}
					data-bs-toggle="collapse"
					data-bs-target="#navDashboard"
					aria-expanded={isCurrentEventKey ? true : false}
					aria-controls="navDashboard">
					{icon ? <i className={`nav-icon fe fe-${icon} me-2`}></i> : ''}{' '}
					{children}
				</Link>
			</li>
		);
	};
	const CustomToggleLevel2 = ({ children, eventKey, icon }) => {
		const { activeEventKey } = useContext(AccordionContext);
		const decoratedOnClick = useAccordionButton(eventKey, () =>
			console.log('totally custom!')
		);
		const isCurrentEventKey = activeEventKey === eventKey;
		return (
			(<Link
				href="#"
				className="nav-link "
				onClick={decoratedOnClick}
				data-bs-toggle="collapse"
				data-bs-target="#navDashboard"
				aria-expanded={isCurrentEventKey ? true : false}
				aria-controls="navDashboard">
				{children}
			</Link>)
		);
	};

	const generateLink = (item) => {
		return (
			(<Link
				href={item.link}
				className={`nav-link ${location === item.link ? 'active' : ''
					}`}
				onClick={(e) =>
					isMobile ? props.onClick(!props.showMenu) : props.showMenu
				}>

				{item.name}
				{''}
				{item.badge ? (
					<Badge
						className="ms-1"
						bg={item.badgecolor ? item.badgecolor : 'primary'}
					>
						{item.badge}
					</Badge>
				) : (
					''
				)}

			</Link>)
		);
	};

	const renderMenu = (data, eventKeyPrefix = '') => {
		return data.map((menu, index) => {
			if (menu.grouptitle) {
				return (
					<Card bsPrefix="nav-item" key={index}>
						{/* group title item */}
						<div className="navbar-heading">{menu.title}</div>
						{/* end of group title item */}
					</Card>
				);
			} else {
				if (menu.children) {
					return (
						<Fragment key={index}>
							{/* main menu / root menu level / root items */}
							<CustomToggle eventKey={`${eventKeyPrefix}${index}`} icon={menu.icon}>
								{menu.title}
								{menu.badge && (
									<Badge className="ms-1" bg={menu.badgecolor ? menu.badgecolor : 'primary'}>
										{menu.badge}
									</Badge>
								)}
							</CustomToggle>
							<Accordion.Collapse eventKey={`${eventKeyPrefix}${index}`} as="li" bsPrefix="nav-item">
								<ListGroup as="ul" bsPrefix="" className="nav flex-column">
									{menu.children.map((submenu, subindex) => {
										if (submenu.children) {
											// Niveau 3 - sous-sous-menu
											return (
												<Fragment key={subindex}>
													<CustomToggle eventKey={`${eventKeyPrefix}${index}-${subindex}`} icon={submenu.icon}>
														{submenu.title}
														{submenu.badge && (
															<Badge className="ms-1" bg={submenu.badgecolor ? submenu.badgecolor : 'primary'}>
																{submenu.badge}
															</Badge>
														)}
													</CustomToggle>
													<Accordion.Collapse eventKey={`${eventKeyPrefix}${index}-${subindex}`} as="li" bsPrefix="nav-item">
														<ListGroup as="ul" bsPrefix="" className="nav flex-column">
															{submenu.children.map((subsubmenu, subsubindex) => (
																<ListGroup.Item as="li" bsPrefix="nav-item" key={subsubindex}>
																	{/* Utilisation de generateLink pour le menu principal, sinon rendu direct */}
																	{eventKeyPrefix === 'main-' ? generateLink(subsubmenu) : (
																		<Link 
																			href={subsubmenu.link} 
																			className={`nav-link ${location === subsubmenu.link ? 'active' : ''}`}
																		>
																			<i className={`nav-icon fe fe-${subsubmenu.icon} me-2`}></i>
																			{subsubmenu.title}
																			{subsubmenu.badge && (
																				<Badge className="ms-1" bg={subsubmenu.badgecolor ? subsubmenu.badgecolor : 'primary'}>
																					{subsubmenu.badge}
																				</Badge>
																			)}
																		</Link>
																	)}
																</ListGroup.Item>
															))}
														</ListGroup>
													</Accordion.Collapse>
												</Fragment>
											);
										} else {
											// Niveau 2 - sous-menu simple
											return (
												<ListGroup.Item as="li" bsPrefix="nav-item" key={subindex}>
													{/* Utilisation de generateLink pour le menu principal, sinon rendu direct */}
													{eventKeyPrefix === 'main-' ? generateLink(submenu) : (
														submenu.link ? (
															<Link 
																href={submenu.link} 
																className={`nav-link ${location === submenu.link ? 'active' : ''}`}
															>
																<i className={`nav-icon fe fe-${submenu.icon} me-2`}></i>
																{submenu.title}
																{submenu.badge && (
																	<Badge className="ms-1" bg={submenu.badgecolor ? submenu.badgecolor : 'primary'}>
																		{submenu.badge}
																	</Badge>
																)}
															</Link>
														) : (
															<span className="nav-link">
																<i className={`nav-icon fe fe-${submenu.icon} me-2`}></i>
																{submenu.title}
															</span>
														)
													)}
												</ListGroup.Item>
											);
										}
									})}
								</ListGroup>
							</Accordion.Collapse>
						</Fragment>
					);
				} else {
					// Menu simple sans enfants
					return (
						<Card bsPrefix="nav-item" key={index}>
							{/* menu item without any children items */}
							{/* Utilisation de generateLink pour le menu principal, sinon rendu direct */}
							{eventKeyPrefix === 'main-' ? generateLink(menu) : (
								<Link 
									href={menu.link} 
									className={`nav-link ${location === menu.link ? 'active' : ''}`}
								>
									<i className={`nav-icon fe fe-${menu.icon} me-2`}></i>
									{menu.title}
									{menu.badge && (
										<Badge className="ms-1" bg={menu.badgecolor ? menu.badgecolor : 'primary'}>
											{menu.badge}
										</Badge>
									)}
								</Link>
							)}
						</Card>
					);
				}
			}
		});
	};

	const isMobile = useMediaQuery({ maxWidth: 767 });

	return (
		<Fragment>
			<SimpleBar style={{ maxHeight: '100vh' }}>
				<div className="nav-scroller">
					<Link href="/" className="navbar-brand">
						<Image src="/images/brand/logo/logo.svg" alt="" />
					</Link>
				</div>				
				{/* Dashboard Menu */}
				<Accordion defaultActiveKey="0" as="ul" className="navbar-nav flex-column">
					{/* Sections dynamiques */}
					{sections && renderMenu(renderSections(), 'section-')}
					
					{/* Menu principal */}
					{renderMenu(DashboardMenu, 'main-')}
				</Accordion>
				{/* end of Dashboard Menu */}
				
			</SimpleBar>
		</Fragment>
	);
};

export default NavbarVertical;
