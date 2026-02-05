import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const Dashboard = () => {
    const [userName, setUserName] = useState("");
    const { user } = useSelector((state) => state.auth);
    { console.log(userName); }

    useEffect(() => {
        const fetchingUserInfo = () => {
            setUserName(`${user.firstName} ${user.lastName}`);
        };

        fetchingUserInfo();
    }, [user]);


    return (
        <section>Welcome to Dashboard {userName}</section>
    )
}

export default Dashboard