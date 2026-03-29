"use client";
import CustomLoader from 'components/CustomLoader';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, Image } from 'react-bootstrap';

const UserPrivilegies = ({ user }) => {
    const [privilegies, setPrivileges] = useState([]);

    const fetchPrivileges = async () => {
        try {
            const req = await fetch('/api/privileges?userId=' + user._id);
            const resp = await req.json();

            if (resp.success) {
                // console.log('User Privileges:', resp.data);
                setPrivileges(resp.data);
            } else {
                console.error('Failed to fetch privileges:', resp.error);
            }
        } catch (error) {
            console.error('Error fetching user privileges:', error);
        }
    }
    
    // console.log('UserPrivilegies: Rendering for user', user._id);
    
    useEffect(() => {
        fetchPrivileges();
    }, [user]);

    if(privilegies.length === 0) {
        return <CustomLoader />;
    }

    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title as="h4">Mes Autorisations</Card.Title>
                {
                    privilegies.map((privilege, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex align-items-center">
                                <div>
                                    <Image src={user?.photoPath || "/images/avatar/avatar-1.jpg"} className="rounded-circle avatar-md" alt="" />
                                </div>
                                    <div className="ms-3 ">
                                        <h5 className="mb-1">{privilege?.designation}</h5>
                                    <p className="text-muted mb-0 fs-5 text-muted"><i className="fe fe-lock fs-4"></i> {privilege?.password}</p>
                                </div>
                            </div>
                            {privilege.entreprises.length > 0 && <div>
                                {/* icons */}
                                {privilege.entreprises.map((ent, idx) => (
                                    <Link key={idx} href={`/entreprises/${ent._id}`} className="text-muted text-primary-hover me-3">
                                        <i className="fe fe-home fs-4"></i> {ent.designation}
                                    </Link>
                                ))}
                            </div>}
                        </div>
                    ))
                }
                
            </Card.Body>
        </Card>
    )
}

export default UserPrivilegies